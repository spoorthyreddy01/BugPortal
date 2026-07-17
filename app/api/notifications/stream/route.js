import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

// Long-lived streaming response — must never be statically optimized/cached.
export const dynamic = "force-dynamic";
// Vercel serverless functions have a max execution time; when it's hit the
// connection just closes and the browser's EventSource auto-reconnects
// (standard SSE behavior), so this isn't a correctness issue — only worth
// raising on a paid plan if 60s feels too chatty with reconnects.
export const maxDuration = 60;

const encoder = new TextEncoder();

export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  await connectDB();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let changeStream;
      let heartbeat;

      const send = (event, data) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Controller already closed mid-write — cleanup() will follow.
        }
      };

      const sendUnreadCount = async () => {
        const count = await Notification.countDocuments({
          recipient: userId,
          read: false,
        });
        send("count", { count });
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        changeStream?.close().catch(() => {});
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal.addEventListener("abort", cleanup);

      try {
        // Initial snapshot so the client has correct state immediately,
        // without waiting on the first change event.
        await sendUnreadCount();

        changeStream = Notification.watch(
          [
            {
              $match: {
                "fullDocument.recipient": new mongoose.Types.ObjectId(userId),
              },
            },
          ],
          { fullDocument: "updateLookup" }
        );

        changeStream.on("change", async (change) => {
          if (change.operationType === "insert") {
            const populated = await Notification.findById(change.fullDocument._id)
              .populate("triggeredBy", "name email image")
              .populate("issue", "title")
              .lean();
            if (populated) send("notification", populated);
          }
          await sendUnreadCount();
        });

        changeStream.on("error", (err) => {
          console.error("Notification change stream error:", err);
          cleanup();
        });
      } catch (err) {
        console.error("Failed to open notification change stream:", err);
        send("error", { message: "Live updates unavailable" });
        cleanup();
        return;
      }

      // Keeps intermediary proxies/load balancers from treating the
      // connection as idle and closing it early.
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          cleanup();
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

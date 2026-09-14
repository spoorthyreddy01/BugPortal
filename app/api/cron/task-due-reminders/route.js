import { NextResponse } from "next/server";
import { findAndNotifyDueSoonTasks } from "@/services/taskService";

// Triggered by Vercel Cron (see vercel.json) — Vercel sends
// `Authorization: Bearer $CRON_SECRET` on scheduled invocations.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await findAndNotifyDueSoonTasks();
  return NextResponse.json({ success: true, ...result });
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Real-time via Server-Sent Events + MongoDB Change Streams (see
// app/api/notifications/stream/route.js) — a single persistent connection
// per open tab, server pushes on insert, no client-side polling. The
// browser's EventSource auto-reconnects on drop (network blip, serverless
// function timeout, etc.), so no manual retry logic is needed here.
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.addEventListener("count", (event) => {
      setCount(JSON.parse(event.data).count);
    });

    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      const target = notification.issue
        ? `/issues/${notification.issue._id}`
        : notification.task
          ? `/tasks/${notification.task._id}`
          : null;

      toast(notification.message, {
        action: target
          ? { label: "View", onClick: () => router.push(target) }
          : undefined,
      });
    });

    return () => eventSource.close();
  }, [router]);

  return { count };
}

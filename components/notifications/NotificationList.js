"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";

export default function NotificationList({ notifications: initial }) {
  const [notifications, setNotifications] = useState(initial);

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      await axios.patch(`/api/notifications/${id}`);
    } catch {
      // Best-effort — the UI already updated optimistically.
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axios.post("/api/notifications/mark-all-read");
    } catch {
      // Best-effort.
    }
  };

  const removeNotification = async (id) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await axios.delete(`/api/notifications/${id}`);
    } catch (err) {
      setNotifications(previous);
      toast.error(err.response?.data?.error || "Failed to clear notification");
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications? This can't be undone.")) return;
    const previous = notifications;
    setNotifications([]);
    try {
      await axios.delete("/api/notifications/clear");
    } catch (err) {
      setNotifications(previous);
      toast.error(err.response?.data?.error || "Failed to clear notifications");
    }
  };

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
        <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No notifications yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all as read
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`group flex items-start gap-2 rounded-lg border p-3 transition-colors ${
              n.read
                ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
            }`}
          >
            <Link
              href={
                n.issue
                  ? `/issues/${n.issue._id}`
                  : n.task
                    ? `/tasks/${n.task._id}`
                    : "#"
              }
              onClick={() => !n.read && markRead(n._id)}
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              {!n.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
              <div className={n.read ? "pl-5" : ""}>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {n.message}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => removeNotification(n._id)}
              className="shrink-0 rounded p-1 text-zinc-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
              aria-label="Clear notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

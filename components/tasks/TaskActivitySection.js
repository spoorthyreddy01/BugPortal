"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import TaskActivityFeed from "./TaskActivityFeed";
import { ROLES } from "@/config/constants";

export default function TaskActivitySection({
  taskId,
  activity: initial,
  createdById,
  assigneeId,
}) {
  const { data: session } = useSession();
  const [activity, setActivity] = useState(initial);
  const [clearing, setClearing] = useState(false);

  const user = session?.user;
  const canClear =
    !!user &&
    (createdById === user.id ||
      assigneeId === user.id ||
      user.role === ROLES.ADMIN);

  const handleClear = async () => {
    if (!activity.length) return;
    if (!confirm("Clear this task's activity history? This can't be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await axios.delete(`/api/tasks/${taskId}/activity`);
      setActivity([]);
      toast.success("Activity cleared");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to clear activity");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Activity
        </h3>
        {canClear && activity.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      <TaskActivityFeed activity={activity} />
    </div>
  );
}

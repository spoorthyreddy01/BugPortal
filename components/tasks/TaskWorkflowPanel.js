"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ROLES, TASK_STATUS, TASK_STATUS_VALUES } from "@/config/constants";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";
import { usePostCompletionCheckIn } from "@/hooks/usePostCompletionCheckIn";
import CheckInModal from "@/components/checkins/CheckInModal";

export default function TaskWorkflowPanel({ task }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user;
  const isCreator = !!user && task.createdBy?._id === user.id;
  const isAssignee = !!user && task.assignee?._id === user.id;
  const isAdmin = user?.role === ROLES.ADMIN;
  const canModify = isCreator || isAssignee || isAdmin;
  const { checkAfterDone, promptVisible, promptActiveTask, closePrompt } =
    usePostCompletionCheckIn();

  const changeStatus = async (status) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`/api/tasks/${task._id}/move`, { status });
      toast.success(`Moved to ${TASK_STATUS_LABELS[status]}`);
      if (status === TASK_STATUS.DONE) {
        await checkAfterDone(task.assignee?._id, user?.id);
      }
      router.refresh();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update status";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This can't be undone.")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/api/tasks/${task._id}`);
      toast.success("Task deleted");
      router.push("/tasks");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete task";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {isAssignee && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Move to:
          </span>
          {TASK_STATUS_VALUES.filter((s) => s !== task.status).map((status) => (
            <button
              key={status}
              type="button"
              disabled={loading}
              onClick={() => changeStatus(status)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              {TASK_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}

      {canModify && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/tasks/${task._id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Pencil className="h-4 w-4" />
            Edit Task
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </button>
        </div>
      )}

      {promptVisible && (
        <CheckInModal
          activeTask={promptActiveTask}
          onClose={closePrompt}
          onCheckedIn={() => {
            closePrompt();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

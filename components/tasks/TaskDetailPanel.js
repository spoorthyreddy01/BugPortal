"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { X, Loader2, Trash2, ExternalLink } from "lucide-react";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskChecklist from "./TaskChecklist";
import TaskCommentThread from "./TaskCommentThread";
import TaskActivitySection from "./TaskActivitySection";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";
import { ROLES } from "@/config/constants";

export default function TaskDetailPanel({ taskId, onClose, onUpdated, onDeleted }) {
  const { data: session } = useSession();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      axios.get(`/api/tasks/${taskId}`),
      axios.get(`/api/tasks/${taskId}/comments`),
      axios.get(`/api/tasks/${taskId}/activity`),
    ])
      .then(([taskRes, commentsRes, activityRes]) => {
        if (cancelled) return;
        setTask(taskRes.data.task);
        setComments(commentsRes.data.comments);
        setActivity(activityRes.data.activity);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load task");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const user = session?.user;
  const canModify =
    !!user &&
    task &&
    (task.createdBy?._id === user.id ||
      task.assignee?._id === user.id ||
      user.role === ROLES.ADMIN);

  const handleSubtaskToggled = (updatedTask) => {
    setTask(updatedTask);
    onUpdated(updatedTask);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This can't be undone.")) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      toast.success("Task deleted");
      onDeleted(taskId);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete task");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {loading || !task ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TaskPriorityBadge priority={task.priority} />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {task.title}
              </h2>
              {task.description && (
                <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {task.description}
                </p>
              )}
              <Link
                href={`/tasks/${task._id}`}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <ExternalLink className="h-3 w-3" />
                Open full page
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">Assignee</p>
                <p className="text-zinc-800 dark:text-zinc-200">
                  {task.assignee?.name || task.assignee?.email || "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">Due date</p>
                <p className="text-zinc-800 dark:text-zinc-200">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">Project</p>
                <p className="text-zinc-800 dark:text-zinc-200">
                  {task.project?.name || "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">Created by</p>
                <p className="text-zinc-800 dark:text-zinc-200">
                  {task.createdBy?.name || task.createdBy?.email}
                </p>
              </div>
            </div>

            <TaskChecklist
              taskId={task._id}
              subtasks={task.subtasks}
              onToggled={handleSubtaskToggled}
              canEdit={canModify}
            />

            <TaskCommentThread taskId={task._id} comments={comments} />

            <TaskActivitySection
              taskId={task._id}
              activity={activity}
              createdById={task.createdBy?._id}
              assigneeId={task.assignee?._id}
            />

            {canModify && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 dark:border-red-900 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { Inbox } from "lucide-react";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskDetailPanel from "./TaskDetailPanel";
import TaskBulkActionBar from "./TaskBulkActionBar";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";

export default function TaskList({ tasks: initial }) {
  const [tasks, setTasks] = useState(initial);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleDeleted = (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setOpenTaskId(null);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
          <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No tasks match your filters
          </p>
        </div>
      ) : (
      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const overdue =
            task.dueDate && task.status !== "done" && isPast(new Date(task.dueDate));
          return (
            <div
              key={task._id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(task._id)}
                onChange={() => toggleSelected(task._id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-700"
                aria-label={`Select ${task.title}`}
              />
              <button
                type="button"
                onClick={() => setOpenTaskId(task._id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {task.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {task.project?.name || "No project"} &middot;{" "}
                    {task.assignee?.name || task.assignee?.email || "Unassigned"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <TaskPriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <span
                    className={`shrink-0 text-xs ${
                      overdue ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      )}

      <TaskBulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onApplied={() => setSelectedIds([])}
      />

      {openTaskId && (
        <TaskDetailPanel
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

import Link from "next/link";
import { ListTodo } from "lucide-react";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";

export default function RecentTasksList({ tasks }) {
  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <ListTodo className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No tasks yet
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {tasks.map((task) => (
        <li key={task._id} className="py-3 first:pt-0 last:pb-0">
          <Link
            href={`/tasks/${task._id}`}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {task.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {task.project?.name || "No project"} ·{" "}
                {TASK_STATUS_LABELS[task.status]}
              </p>
            </div>
            <TaskPriorityBadge priority={task.priority} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

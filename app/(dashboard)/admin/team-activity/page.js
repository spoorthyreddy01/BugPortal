import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { getTeamCheckIns, getInProgressByDeveloper } from "@/services/checkInService";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";
import { TASK_STATUS } from "@/config/constants";

function checklistProgress(task) {
  if (!task?.subtasks?.length) return null;
  const done = task.subtasks.filter((s) => s.done).length;
  return `${done}/${task.subtasks.length}`;
}

export default async function TeamActivityPage() {
  const [checkIns, inProgress] = await Promise.all([
    getTeamCheckIns(),
    getInProgressByDeveloper(),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Team Activity
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Who&apos;s checked in today, their progress, and what everyone is
          currently working on.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Today&apos;s Check-ins
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No one has checked in yet today.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {checkIns.map((ci) => {
              const progress = checklistProgress(ci.task);
              const isDone = ci.task?.status === TASK_STATUS.DONE;
              return (
                <div key={ci._id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/team-activity/${ci.user?._id}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                    >
                      {ci.user?.name || ci.user?.email}
                    </Link>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {ci.checkedOutAt
                        ? `Checked out ${new Date(ci.checkedOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Still working"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-700" />
                    )}
                    <Link
                      href={`/tasks/${ci.task?._id}`}
                      className="text-zinc-700 dark:text-zinc-300 hover:underline"
                    >
                      {ci.task?.title}
                    </Link>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {TASK_STATUS_LABELS[ci.task?.status]}
                    </span>
                    {progress && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        {progress} checklist
                      </span>
                    )}
                    {ci.carriedOver && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        carried over
                      </span>
                    )}
                  </div>
                  {ci.delayReason && (
                    <p className="ml-5 text-xs text-amber-600 dark:text-amber-400">
                      Delayed: {ci.delayReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Currently Working On
        </h2>
        {inProgress.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No active tasks right now
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {inProgress.map(({ developer, tasks }) => (
              <div key={developer._id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
                <Link
                  href={`/admin/team-activity/${developer._id}`}
                  className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                >
                  {developer.name || developer.email}
                </Link>
                <ul className="flex flex-col gap-1.5">
                  {tasks.map((task) => (
                    <li
                      key={task._id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <Link
                        href={`/tasks/${task._id}`}
                        className="text-zinc-700 dark:text-zinc-300 hover:underline"
                      >
                        {task.title}
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        {checklistProgress(task) && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            {checklistProgress(task)}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">
                          created by {task.createdBy?.name || task.createdBy?.email}
                        </span>
                        <TaskPriorityBadge priority={task.priority} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

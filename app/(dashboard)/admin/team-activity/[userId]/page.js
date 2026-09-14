import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCheckInHistory } from "@/services/checkInService";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";
import { TASK_STATUS } from "@/config/constants";

export default async function DeveloperHistoryPage({ params }) {
  const { userId } = await params;

  await connectDB();
  const [developer, history] = await Promise.all([
    User.findById(userId).select("name email image").lean(),
    getCheckInHistory(userId, 60),
  ]);
  if (!developer) notFound();

  return (
    <div className="w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <Link
          href="/admin/team-activity"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Team Activity
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {developer.name || developer.email}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Daily check-in history
        </p>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No check-ins recorded yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {history.map((entry) => {
            const isDone = entry.task?.status === TASK_STATUS.DONE;
            const doneCount = entry.task?.subtasks?.filter((s) => s.done).length || 0;
            const total = entry.task?.subtasks?.length || 0;
            return (
              <div key={entry._id} className="p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {entry.date}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {entry.checkedOutAt
                      ? `Checked out ${new Date(entry.checkedOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Not checked out"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-700" />
                  )}
                  <Link
                    href={`/tasks/${entry.task?._id}`}
                    className="text-zinc-700 dark:text-zinc-300 hover:underline"
                  >
                    {entry.task?.title}
                  </Link>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    {TASK_STATUS_LABELS[entry.task?.status]}
                  </span>
                  {total > 0 && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {doneCount}/{total} checklist
                    </span>
                  )}
                  {entry.carriedOver && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      carried over
                    </span>
                  )}
                </div>
                {entry.delayReason && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Delayed: {entry.delayReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Paperclip, CircleDot } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function IssueCard({ issue }) {
  return (
    <Link
      href={`/issues/${issue._id}`}
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {issue.project?.name}
            {issue.module ? ` · ${issue.module}` : ""}
          </p>
          <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
            {issue.title}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>Reported by {issue.reporter?.name || issue.reporter?.email}</span>
        {issue.currentDeveloper && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CircleDot className="h-3 w-3 fill-current" />
            {issue.currentDeveloper.name || issue.currentDeveloper.email} is
            working on this
          </span>
        )}
        <span>
          {formatDistanceToNow(new Date(issue.createdAt), {
            addSuffix: true,
          })}
        </span>
        {issue.attachmentCount > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            {issue.attachmentCount}
          </span>
        )}
      </div>
    </Link>
  );
}

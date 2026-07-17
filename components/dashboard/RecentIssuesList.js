import Link from "next/link";
import { Inbox } from "lucide-react";
import {
  PRIORITY_CHART_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/utils/chartColors";

export default function RecentIssuesList({ issues }) {
  if (!issues.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No issues reported yet
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {issues.map((issue) => (
        <li
          key={issue._id}
          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <Link href={`/issues/${issue._id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {issue.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {issue.project?.name} · {STATUS_LABELS[issue.status]}
            </p>
          </Link>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: PRIORITY_CHART_COLORS[issue.priority] }}
          >
            {PRIORITY_LABELS[issue.priority]}
          </span>
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import { ACTIVITY_TYPES } from "@/config/constants";

const ACTIVITY_LABELS = {
  [ACTIVITY_TYPES.ISSUE_CREATED]: "created",
  [ACTIVITY_TYPES.STARTED_WORKING]: "started working on",
  [ACTIVITY_TYPES.STOPPED_WORKING]: "stopped working on",
  [ACTIVITY_TYPES.COMMENT_ADDED]: "commented on",
  [ACTIVITY_TYPES.ATTACHMENT_UPLOADED]: "added an attachment to",
  [ACTIVITY_TYPES.ISSUE_RESOLVED]: "resolved",
  [ACTIVITY_TYPES.ISSUE_REOPENED]: "reopened",
  [ACTIVITY_TYPES.ATTACHMENT_CLEANUP]: "cleaned up attachments on",
};

export default function RecentActivityList({ activity }) {
  if (!activity.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Activity className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {activity.map((entry) => (
        <li key={entry._id} className="py-3 first:pt-0 last:pb-0">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {entry.actor?.name || "Someone"}
            </span>{" "}
            {ACTIVITY_LABELS[entry.type] || entry.type}{" "}
            <Link
              href={`/issues/${entry.issue?._id}`}
              className="font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-2"
            >
              {entry.issue?.title || "an issue"}
            </Link>
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            {formatDistanceToNow(new Date(entry.createdAt), {
              addSuffix: true,
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}

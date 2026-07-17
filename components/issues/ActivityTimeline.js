import { formatDistanceToNow } from "date-fns";
import { ACTIVITY_TYPES } from "@/config/constants";

const ACTIVITY_LABELS = {
  [ACTIVITY_TYPES.ISSUE_CREATED]: "created this issue",
  [ACTIVITY_TYPES.STARTED_WORKING]: "started working on this issue",
  [ACTIVITY_TYPES.STOPPED_WORKING]: "stopped working on this issue",
  [ACTIVITY_TYPES.COMMENT_ADDED]: "commented",
  [ACTIVITY_TYPES.ATTACHMENT_UPLOADED]: "uploaded an attachment",
  [ACTIVITY_TYPES.ISSUE_RESOLVED]: "marked this issue as resolved",
  [ACTIVITY_TYPES.ISSUE_REOPENED]: "reopened this issue",
  [ACTIVITY_TYPES.ATTACHMENT_CLEANUP]:
    "System removed all attachments after issue resolution",
};

export default function ActivityTimeline({ activity }) {
  if (!activity.length) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-600">
        No activity yet
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {activity.map((entry) => (
        <li key={entry._id} className="flex gap-3">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="text-sm">
            <p className="text-zinc-700 dark:text-zinc-300">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {entry.actor?.name || entry.actor?.email || "System"}
              </span>{" "}
              {ACTIVITY_LABELS[entry.type] || entry.type}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              {formatDistanceToNow(new Date(entry.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

import { formatDistanceToNow } from "date-fns";

// Unlike Issue's ActivityTimeline, task activity log entries already store a
// fully-formed human-readable message (see taskService.js) — no type→label
// map needed here.
export default function TaskActivityFeed({ activity }) {
  if (!activity?.length) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-600">No activity yet</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {activity.map((a) => (
        <li key={a._id} className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {a.actor?.name || "System"}
          </span>{" "}
          {a.message} &middot;{" "}
          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
        </li>
      ))}
    </ul>
  );
}

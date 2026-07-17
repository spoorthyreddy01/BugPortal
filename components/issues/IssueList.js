import { Inbox } from "lucide-react";
import IssueCard from "./IssueCard";

export default function IssueList({ issues }) {
  if (!issues.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
        <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No issues match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {issues.map((issue) => (
        <IssueCard key={issue._id} issue={issue} />
      ))}
    </div>
  );
}

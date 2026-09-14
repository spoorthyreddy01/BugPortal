"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TASK_PRIORITY_VALUES } from "@/config/constants";
import { TASK_PRIORITY_LABELS } from "@/utils/chartColors";

const selectClass =
  "rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100";

export default function TaskFilters({ projects, members, current }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <select
        value={current.project}
        onChange={(e) => updateParam("project", e.target.value)}
        className={selectClass}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={current.priority}
        onChange={(e) => updateParam("priority", e.target.value)}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {TASK_PRIORITY_VALUES.map((p) => (
          <option key={p} value={p}>
            {TASK_PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        value={current.assignee}
        onChange={(e) => updateParam("assignee", e.target.value)}
        className={selectClass}
      >
        <option value="">All Assignees</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name || m.email}
          </option>
        ))}
      </select>
    </div>
  );
}

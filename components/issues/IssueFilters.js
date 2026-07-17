"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  ISSUE_STATUS_VALUES,
  ISSUE_PRIORITY_VALUES,
} from "@/config/constants";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/utils/chartColors";

const selectClass =
  "rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100";

export default function IssueFilters({ projects, developers, current }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          key={current.q}
          defaultValue={current.q}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("q", e.currentTarget.value);
          }}
          placeholder="Search issues... (press Enter)"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
        />
      </div>

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
        value={current.status}
        onChange={(e) => updateParam("status", e.target.value)}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {ISSUE_STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={current.priority}
        onChange={(e) => updateParam("priority", e.target.value)}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {ISSUE_PRIORITY_VALUES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        value={current.workingDeveloper}
        onChange={(e) => updateParam("workingDeveloper", e.target.value)}
        className={selectClass}
      >
        <option value="">All Developers</option>
        {developers.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name || d.email}
          </option>
        ))}
      </select>

      <select
        value={current.sort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className={selectClass}
      >
        <option value="-createdAt">Newest</option>
        <option value="createdAt">Oldest</option>
        <option value="-priority">Priority (high to low)</option>
        <option value="title">Title (A-Z)</option>
      </select>
    </div>
  );
}

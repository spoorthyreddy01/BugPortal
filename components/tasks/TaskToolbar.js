"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus, LayoutGrid, List, X } from "lucide-react";
import TaskForm from "./TaskForm";

export default function TaskToolbar({ projects, members, view }) {
  const [showForm, setShowForm] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewHref = (v) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "board") params.delete("view");
    else params.set("view", v);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-0.5">
          <Link
            href={viewHref("board")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
              view === "board"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </Link>
          <Link
            href={viewHref("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
              view === "list"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              New Task
            </h2>

            <TaskForm
              projects={projects}
              members={members}
              onDone={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

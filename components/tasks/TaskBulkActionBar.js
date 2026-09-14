"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { X } from "lucide-react";
import { TASK_STATUS_VALUES } from "@/config/constants";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";

export default function TaskBulkActionBar({ selectedIds, onClear, onApplied }) {
  const router = useRouter();
  const [status, setStatus] = useState(TASK_STATUS_VALUES[0]);
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  const report = (result) => {
    const { succeeded, skipped } = result;
    if (skipped > 0) {
      toast.success(`${succeeded} updated, ${skipped} skipped (not yours)`);
    } else {
      toast.success(`${succeeded} updated`);
    }
  };

  const applyStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/tasks/bulk", {
        ids: selectedIds,
        action: "status",
        status,
      });
      report(data);
      onApplied();
      router.refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || "Bulk update failed");
    } finally {
      setLoading(false);
    }
  };

  const applyDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} task(s)? This can't be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/tasks/bulk", {
        ids: selectedIds,
        action: "delete",
      });
      report(data);
      onApplied();
      router.refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || "Bulk delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-lg">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {selectedIds.length} selected
      </span>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
      >
        {TASK_STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={loading}
        onClick={applyStatus}
        className="rounded-md bg-zinc-900 dark:bg-white px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 disabled:opacity-50"
      >
        Change status
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={applyDelete}
        className="rounded-md border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-50"
      >
        Delete selected
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <X className="h-3.5 w-3.5" />
        Clear selection
      </button>
    </div>
  );
}

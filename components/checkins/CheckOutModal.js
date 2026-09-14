"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { TASK_STATUS } from "@/config/constants";

export default function CheckOutModal({ checkIn, onClose, onCheckedOut }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isDone = checkIn.task?.status === TASK_STATUS.DONE;

  const submit = async () => {
    if (!isDone && !reason.trim()) {
      toast.error("Add a reason for the delay");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/checkins/checkout", {
        delayReason: reason,
      });
      toast.success("Checked out for today");
      onCheckedOut(data.checkIn);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to check out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex w-full max-w-md max-h-[85vh] flex-col overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Check out for today
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {isDone
            ? "Nice work — this task is done."
            : "Not finished yet — add a quick reason."}
        </p>

        <div className="flex flex-col gap-4">
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
              isDone
                ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isDone && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {checkIn.task?.title}
          </div>

          {!isDone && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Why isn&apos;t it done yet?
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Blocked on API access, will finish tomorrow"
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                This task will carry over to tomorrow automatically.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

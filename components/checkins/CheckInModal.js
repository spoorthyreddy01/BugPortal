"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Loader2, Plus } from "lucide-react";

// Driven entirely by whether the caller already has an active task
// (Task.assignee=me, status != done) — checking in when one exists just
// confirms/continues it; checking in with none requires declaring a new
// one. The same component is used both for the morning prompt and the
// mid-day "what's next" moment right after finishing a task.
export default function CheckInModal({ activeTask, onClose, onCheckedIn }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks((prev) => [...prev, subtaskInput.trim()]);
    setSubtaskInput("");
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = activeTask
        ? { taskId: activeTask._id }
        : { newTask: { title: title.trim(), description: description.trim(), subtasks } };

      if (!activeTask && !title.trim()) {
        toast.error("Describe the task you're starting today");
        setSubmitting(false);
        return;
      }

      const { data } = await axios.post("/api/checkins", payload);
      toast.success(activeTask ? "Checked in for today" : "Task started");
      onCheckedIn(data.checkIn);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to check in");
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

        {activeTask ? (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Continuing your task
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              You still have an open task from before — finish it before starting
              anything new.
            </p>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {activeTask.title}
              </p>
              {activeTask.subtasks?.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {activeTask.subtasks.map((s) => (
                    <li key={s._id} className={s.done ? "line-through" : ""}>
                      {s.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Start Today
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              What are you working on today?
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              You can only have one active task at a time — describe it and
              break it into a checklist if it has multiple parts.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Task *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build login module"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Checklist (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                    placeholder="e.g. Add manual register/login"
                    className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="shrink-0 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-sm text-zinc-600 dark:text-zinc-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {subtasks.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-1">
                    {subtasks.map((s, i) => (
                      <li
                        key={s}
                        className="flex items-center justify-between rounded-md bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() =>
                            setSubtasks((prev) => prev.filter((_, idx) => idx !== i))
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start This Task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check, Plus, X } from "lucide-react";

export default function TaskChecklist({ taskId, subtasks, onToggled, canEdit = false }) {
  const [newItem, setNewItem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!subtasks?.length && !canEdit) return null;

  const toggle = async (subtaskId) => {
    try {
      const { data } = await axios.patch(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`
      );
      onToggled(data.task);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update subtask");
    }
  };

  const remove = async (subtaskId) => {
    try {
      const { data } = await axios.delete(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`
      );
      onToggled(data.task);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove subtask");
    }
  };

  const add = async () => {
    if (!newItem.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/tasks/${taskId}/subtasks`, {
        text: newItem.trim(),
      });
      onToggled(data.task);
      setNewItem("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add subtask");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Checklist
      </h3>
      <ul className="flex flex-col gap-1.5">
        {subtasks?.map((s) => (
          <li key={s._id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggle(s._id)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  s.done
                    ? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {s.done && (
                  <Check className="h-3 w-3 text-white dark:text-zinc-900" />
                )}
              </span>
              <span
                className={`truncate ${
                  s.done
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {s.text}
              </span>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => remove(s._id)}
                className="shrink-0 rounded p-1 text-zinc-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
                aria-label="Remove item"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Add a checklist item"
            className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={add}
            disabled={submitting}
            className="shrink-0 rounded-md border border-zinc-300 dark:border-zinc-700 px-2 text-zinc-600 dark:text-zinc-300 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

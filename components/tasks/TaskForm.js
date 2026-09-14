"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import {
  TASK_PRIORITY,
  TASK_PRIORITY_VALUES,
  TASK_RECURRENCE,
  TASK_RECURRENCE_VALUES,
} from "@/config/constants";
import { TASK_PRIORITY_LABELS } from "@/utils/chartColors";

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

const RECURRENCE_LABELS = {
  [TASK_RECURRENCE.NONE]: "Does not repeat",
  [TASK_RECURRENCE.DAILY]: "Daily",
  [TASK_RECURRENCE.WEEKLY]: "Weekly",
  [TASK_RECURRENCE.MONTHLY]: "Monthly",
};

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

// Bare form only — no modal chrome. TaskToolbar wraps this in a modal for
// create; the edit page (/tasks/[id]/edit) renders it directly, mirroring
// how IssueForm has no opinion on create-modal vs edit-page either.
export default function TaskForm({ projects, members, task = null, onDone }) {
  const router = useRouter();
  const isEditMode = !!task;
  const [serverError, setServerError] = useState("");
  const [subtasks, setSubtasks] = useState(
    task?.subtasks?.map((s) => s.text) || []
  );
  const [subtaskInput, setSubtaskInput] = useState("");
  const [labels, setLabels] = useState(task?.labels || []);
  const [labelInput, setLabelInput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      project: task?.project?._id || task?.project || "",
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || TASK_PRIORITY.MEDIUM,
      dueDate: toDateInputValue(task?.dueDate),
      assignee: task?.assignee?._id || task?.assignee || "",
      recurrence: task?.recurrence?.frequency || TASK_RECURRENCE.NONE,
    },
  });

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks((prev) => [...prev, subtaskInput.trim()]);
    setSubtaskInput("");
  };

  const addLabel = () => {
    if (!labelInput.trim()) return;
    setLabels((prev) => [...prev, labelInput.trim()]);
    setLabelInput("");
  };

  const onSubmit = async (values) => {
    setServerError("");
    const payload = {
      ...values,
      project: values.project || null,
      assignee: values.assignee || null,
      dueDate: values.dueDate || null,
      labels,
      recurrence: { frequency: values.recurrence },
    };

    if (isEditMode) {
      try {
        await axios.patch(`/api/tasks/${task._id}`, payload);
        toast.success("Task updated");
        router.push(`/tasks/${task._id}`);
        router.refresh();
      } catch (err) {
        const message = err.response?.data?.error || "Failed to update task";
        setServerError(message);
        toast.error(message);
      }
      return;
    }

    try {
      await axios.post("/api/tasks", { ...payload, subtasks });
      toast.success("Task created");
      onDone?.();
      router.refresh();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to create task";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Title *</label>
        <input
          {...register("title", { required: "Title is required" })}
          placeholder="What needs to be done?"
          className={inputClass}
        />
        {errors.title && (
          <span className="text-xs text-red-600">{errors.title.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description (optional)</label>
        <textarea {...register("description")} rows={3} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Priority *</label>
          <select {...register("priority", { required: true })} className={inputClass}>
            {TASK_PRIORITY_VALUES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Due date (optional)</label>
          <input type="date" {...register("dueDate")} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Assignee (optional)</label>
          <select {...register("assignee")} className={inputClass}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Project (optional)</label>
          <select {...register("project")} className={inputClass}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Repeat</label>
        <select {...register("recurrence")} className={`${inputClass} sm:w-56`}>
          {TASK_RECURRENCE_VALUES.map((freq) => (
            <option key={freq} value={freq}>
              {RECURRENCE_LABELS[freq]}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          When a repeating task is marked Done, a new one is created for the
          next occurrence.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Labels (optional)</label>
        <div className="flex gap-2">
          <input
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLabel();
              }
            }}
            placeholder="Type a label and press Enter"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addLabel}
            className="shrink-0 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-sm text-zinc-600 dark:text-zinc-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {labels.map((label, i) => (
              <span
                key={label}
                className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
              >
                {label}
                <button
                  type="button"
                  onClick={() => setLabels((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {!isEditMode && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Checklist (optional)</label>
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
              placeholder="Add a checklist item and press Enter"
              className={inputClass}
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
                    onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

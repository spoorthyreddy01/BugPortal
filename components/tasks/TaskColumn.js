"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";

export default function TaskColumn({ status, tasks, onOpenTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-full min-w-[260px] flex-1 flex-col gap-3 sm:min-w-[280px]">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {TASK_STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors ${
          isOver
            ? "border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
            No tasks
          </p>
        )}
      </div>
    </div>
  );
}

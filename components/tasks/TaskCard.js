"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow, isPast } from "date-fns";
import { CalendarClock, ListChecks, User as UserIcon } from "lucide-react";
import TaskPriorityBadge from "./TaskPriorityBadge";

function Avatar({ user }) {
  if (!user) return null;
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 rounded-full"
      />
    );
  }
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
      {(user.name || user.email || "?")[0]?.toUpperCase()}
    </div>
  );
}

export default function TaskCard({ task, onOpen }) {
  const { data: session } = useSession();
  const canDrag = !!session?.user && task.assignee?._id === session.user.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const doneCount = task.subtasks?.filter((s) => s.done).length || 0;
  const overdue =
    task.dueDate && task.status !== "done" && isPast(new Date(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task._id)}
      className={`flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-left transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 ${
        canDrag ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">
          {task.title}
        </p>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {task.assignee ? (
          <>
            <Avatar user={task.assignee} />
            <span className="truncate">
              {task.assignee.name || task.assignee.email}
            </span>
          </>
        ) : (
          <>
            <UserIcon className="h-3.5 w-3.5" />
            <span>Unassigned</span>
          </>
        )}
      </div>

      {task.project?.name && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {task.project.name}
        </p>
      )}

      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {(task.subtasks?.length > 0 || task.dueDate) && (
        <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {task.subtasks?.length > 0 && (
            <span className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              {doneCount}/{task.subtasks.length}
            </span>
          )}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                overdue ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              <CalendarClock className="h-3 w-3" />
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

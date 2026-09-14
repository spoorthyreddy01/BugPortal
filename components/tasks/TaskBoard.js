"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TASK_STATUS, TASK_STATUS_VALUES } from "@/config/constants";
import TaskColumn from "./TaskColumn";
import TaskDetailPanel from "./TaskDetailPanel";
import CheckInModal from "@/components/checkins/CheckInModal";
import { usePostCompletionCheckIn } from "@/hooks/usePostCompletionCheckIn";

function findColumn(board, taskId) {
  return TASK_STATUS_VALUES.find((status) =>
    board[status].some((t) => t._id === taskId)
  );
}

export default function TaskBoard({ initialBoard }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [board, setBoard] = useState(initialBoard);
  const [openTaskId, setOpenTaskId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const { checkAfterDone, promptVisible, promptActiveTask, closePrompt } =
    usePostCompletionCheckIn();

  const persistMove = async (taskId, status, order, assigneeId) => {
    try {
      await axios.post(`/api/tasks/${taskId}/move`, { status, order });
      if (status === TASK_STATUS.DONE) {
        await checkAfterDone(assigneeId, session?.user?.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to move task");
      router.refresh();
    }
  };

  // Computes the next board state and the move to persist from the current
  // `board` closure (read, not React's functional-updater form) — calling
  // persistMove() from inside a setState updater is impure and gets
  // silently double-invoked by React 18 Strict Mode in development, which
  // was firing every drag's PATCH /move (and its activity-log entry) twice.
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const sourceStatus = findColumn(board, activeId);
    const targetStatus = TASK_STATUS_VALUES.includes(over.id)
      ? over.id
      : findColumn(board, over.id);

    if (!sourceStatus || !targetStatus) return;

    const next = { ...board, [sourceStatus]: [...board[sourceStatus]] };
    const sourceIndex = next[sourceStatus].findIndex((t) => t._id === activeId);
    const [moved] = next[sourceStatus].splice(sourceIndex, 1);

    let insertAt;
    if (sourceStatus === targetStatus) {
      const withoutMoved = board[sourceStatus].filter((t) => t._id !== activeId);
      const targetIndex = withoutMoved.findIndex((t) => t._id === over.id);
      insertAt = targetIndex === -1 ? withoutMoved.length : targetIndex;
      withoutMoved.splice(insertAt, 0, moved);
      next[sourceStatus] = withoutMoved;
    } else {
      next[targetStatus] = [...board[targetStatus]];
      moved.status = targetStatus;
      const targetIndex = next[targetStatus].findIndex((t) => t._id === over.id);
      insertAt = targetIndex === -1 ? next[targetStatus].length : targetIndex;
      next[targetStatus].splice(insertAt, 0, moved);
    }

    setBoard(next);
    persistMove(activeId, targetStatus, insertAt, moved.assignee?._id);
  };

  const handleTaskUpdated = (updatedTask) => {
    setBoard((prev) => {
      const next = {};
      for (const status of TASK_STATUS_VALUES) {
        next[status] = prev[status]
          .filter((t) => t._id !== updatedTask._id)
          .concat(updatedTask.status === status ? [updatedTask] : []);
      }
      return next;
    });
  };

  const handleTaskDeleted = (taskId) => {
    setBoard((prev) => {
      const next = {};
      for (const status of TASK_STATUS_VALUES) {
        next[status] = prev[status].filter((t) => t._id !== taskId);
      }
      return next;
    });
    setOpenTaskId(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TASK_STATUS_VALUES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={board[status]}
              onOpenTask={setOpenTaskId}
            />
          ))}
        </div>
      </DndContext>

      {openTaskId && (
        <TaskDetailPanel
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {promptVisible && (
        <CheckInModal
          activeTask={promptActiveTask}
          onClose={closePrompt}
          onCheckedIn={() => {
            closePrompt();
            router.refresh();
          }}
        />
      )}
    </>
  );
}

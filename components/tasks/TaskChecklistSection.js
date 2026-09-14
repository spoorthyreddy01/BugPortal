"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TaskChecklist from "./TaskChecklist";
import { ROLES } from "@/config/constants";

// Thin client wrapper so a server-rendered page (which can't call
// useRouter/useSession itself) still reflects a subtask edit without a
// manual reload, and still enforces the same edit permission as elsewhere.
export default function TaskChecklistSection({
  taskId,
  subtasks,
  createdById,
  assigneeId,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const canEdit =
    !!user &&
    (createdById === user.id ||
      assigneeId === user.id ||
      user.role === ROLES.ADMIN);

  return (
    <TaskChecklist
      taskId={taskId}
      subtasks={subtasks}
      onToggled={() => router.refresh()}
      canEdit={canEdit}
    />
  );
}

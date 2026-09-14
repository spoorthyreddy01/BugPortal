import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { toggleSubtask, removeSubtask } from "@/services/taskService";

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id, subtaskId } = await params;

  try {
    const task = await toggleSubtask(id, subtaskId, user);
    return NextResponse.json({ success: true, task });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id, subtaskId } = await params;

  try {
    const task = await removeSubtask(id, subtaskId, user);
    return NextResponse.json({ success: true, task });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

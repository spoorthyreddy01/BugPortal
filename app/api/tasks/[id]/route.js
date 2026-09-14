import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { getTaskById, updateTask, deleteTask } from "@/services/taskService";

export async function GET(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) {
    return NextResponse.json(
      { success: false, error: "Task not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, task });
}

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const task = await updateTask(id, user, body);
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

  const { id } = await params;

  try {
    await deleteTask(id, user);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

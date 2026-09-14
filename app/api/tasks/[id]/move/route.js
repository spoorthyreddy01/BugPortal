import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { moveTask } from "@/services/taskService";

export async function POST(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const task = await moveTask(id, user, {
      status: body.status,
      order: body.order,
    });
    return NextResponse.json({ success: true, task });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

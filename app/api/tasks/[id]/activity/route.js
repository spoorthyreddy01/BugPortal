import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { getTaskActivity, clearTaskActivity } from "@/services/taskService";

export async function GET(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const activity = await getTaskActivity(id);
  return NextResponse.json({ success: true, activity });
}

export async function DELETE(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  try {
    await clearTaskActivity(id, user);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

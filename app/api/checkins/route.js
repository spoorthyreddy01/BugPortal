import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { getTodayCheckIn, checkIn } from "@/services/checkInService";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const data = await getTodayCheckIn(user.id);
  return NextResponse.json({ success: true, ...data });
}

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();

  try {
    const record = await checkIn(user.id, user.name, {
      taskId: body.taskId,
      newTask: body.newTask,
    });
    return NextResponse.json({ success: true, checkIn: record });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

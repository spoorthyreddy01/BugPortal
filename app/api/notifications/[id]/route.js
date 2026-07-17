import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import {
  markAsRead,
  deleteNotification,
} from "@/services/notificationService";

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  try {
    const notification = await markAsRead(id, user.id);
    return NextResponse.json({ success: true, notification });
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
    await deleteNotification(id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

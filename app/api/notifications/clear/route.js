import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { clearAllNotifications } from "@/services/notificationService";

export async function DELETE() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  await clearAllNotifications(user.id);
  return NextResponse.json({ success: true });
}

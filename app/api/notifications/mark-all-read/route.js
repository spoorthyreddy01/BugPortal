import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { markAllAsRead } from "@/services/notificationService";

export async function POST() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  await markAllAsRead(user.id);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { getUnreadCount } from "@/services/notificationService";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const count = await getUnreadCount(user.id);
  return NextResponse.json({ success: true, count });
}

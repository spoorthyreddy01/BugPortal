import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { listNotificationsForUser } from "@/services/notificationService";

export async function GET(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const data = await listNotificationsForUser(user.id, { page, limit });
  return NextResponse.json({ success: true, ...data });
}

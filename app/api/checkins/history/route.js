import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { getCheckInHistory } from "@/services/checkInService";
import { ROLES } from "@/config/constants";

export async function GET(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId") || user.id;

  if (targetUserId !== user.id && user.role !== ROLES.ADMIN) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const history = await getCheckInHistory(targetUserId);
  return NextResponse.json({ success: true, history });
}

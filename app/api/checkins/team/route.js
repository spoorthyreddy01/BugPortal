import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/requireAuth";
import { getTeamCheckIns, getInProgressByDeveloper } from "@/services/checkInService";
import { ROLES } from "@/config/constants";

export async function GET(request) {
  const user = await requireRole([ROLES.ADMIN]);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;

  const [checkIns, inProgress] = await Promise.all([
    getTeamCheckIns(date),
    getInProgressByDeveloper(),
  ]);

  return NextResponse.json({ success: true, checkIns, inProgress });
}

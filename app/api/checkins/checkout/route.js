import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { checkOut } from "@/services/checkInService";

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();

  try {
    const record = await checkOut(user.id, body.delayReason || "");
    return NextResponse.json({ success: true, checkIn: record });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

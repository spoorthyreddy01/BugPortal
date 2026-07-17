import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/requireAuth";
import { listUsers, createAuthorizedUser } from "@/services/userService";
import { ROLES } from "@/config/constants";

export async function GET(request) {
  const sessionUser = await requireRole([ROLES.ADMIN]);
  if (sessionUser instanceof NextResponse) return sessionUser;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const users = await listUsers({ q });
  return NextResponse.json({ success: true, users });
}

export async function POST(request) {
  const sessionUser = await requireRole([ROLES.ADMIN]);
  if (sessionUser instanceof NextResponse) return sessionUser;

  const body = await request.json();

  try {
    const user = await createAuthorizedUser({
      email: body.email,
      role: body.role,
    });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/requireAuth";
import { updateUser, deleteUser } from "@/services/userService";
import { ROLES } from "@/config/constants";

export async function PATCH(request, { params }) {
  const sessionUser = await requireRole([ROLES.ADMIN]);
  if (sessionUser instanceof NextResponse) return sessionUser;

  const { id } = await params;
  const body = await request.json();

  if (id === sessionUser.id && body.role && body.role !== ROLES.ADMIN) {
    return NextResponse.json(
      { success: false, error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }
  if (id === sessionUser.id && body.status && body.status !== "active") {
    return NextResponse.json(
      { success: false, error: "You cannot deactivate your own account" },
      { status: 400 }
    );
  }

  try {
    const user = await updateUser(id, body);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const sessionUser = await requireRole([ROLES.ADMIN]);
  if (sessionUser instanceof NextResponse) return sessionUser;

  const { id } = await params;

  if (id === sessionUser.id) {
    return NextResponse.json(
      { success: false, error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

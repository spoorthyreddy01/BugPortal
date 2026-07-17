import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/requireAuth";
import { updateProject } from "@/services/projectService";
import { ROLES } from "@/config/constants";

export async function PATCH(request, { params }) {
  const user = await requireRole([ROLES.ADMIN]);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const project = await updateProject(id, body);
    return NextResponse.json({ success: true, project });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

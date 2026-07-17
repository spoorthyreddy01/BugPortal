import { NextResponse } from "next/server";
import { requireUser, requireRole } from "@/middleware/requireAuth";
import { listProjectsWithCounts, createProject } from "@/services/projectService";
import { ROLES } from "@/config/constants";

export async function GET(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  const projects = await listProjectsWithCounts({ includeArchived });
  return NextResponse.json({ success: true, projects });
}

export async function POST(request) {
  const user = await requireRole([ROLES.ADMIN]);
  if (user instanceof NextResponse) return user;

  const body = await request.json();

  try {
    const project = await createProject(body);
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

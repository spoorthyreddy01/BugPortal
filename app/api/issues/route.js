import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { createIssue, listIssues } from "@/services/issueService";

export async function GET(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const params = {
    q: searchParams.get("q") || "",
    project: searchParams.get("project") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    workingDeveloper: searchParams.get("workingDeveloper") || "",
    sort: searchParams.get("sort") || "-createdAt",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 20),
  };

  const data = await listIssues(params);
  return NextResponse.json({ success: true, ...data });
}

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();

  if (!body.project || !body.title || !body.description || !body.priority) {
    return NextResponse.json(
      {
        success: false,
        error: "Project, title, description, and priority are required",
      },
      { status: 400 }
    );
  }

  try {
    const issue = await createIssue(body, user.id, user.name);
    return NextResponse.json({ success: true, issue }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

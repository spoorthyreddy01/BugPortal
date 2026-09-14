import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { createTask, listTasks } from "@/services/taskService";

export async function GET(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const params = {
    q: searchParams.get("q") || "",
    project: searchParams.get("project") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    assignee: searchParams.get("assignee") || "",
    label: searchParams.get("label") || "",
    sort: searchParams.get("sort") || "-createdAt",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 50),
  };

  const data = await listTasks(params);
  return NextResponse.json({ success: true, ...data });
}

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();

  if (!body.title || !body.priority) {
    return NextResponse.json(
      { success: false, error: "Title and priority are required" },
      { status: 400 }
    );
  }

  try {
    const task = await createTask(body, user.id, user.name);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

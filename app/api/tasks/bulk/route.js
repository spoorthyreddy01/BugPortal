import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { bulkUpdateStatus, bulkDeleteTasks } from "@/services/taskService";
import { TASK_STATUS_VALUES } from "@/config/constants";

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const { ids, action, status } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "No tasks selected" },
      { status: 400 }
    );
  }

  try {
    if (action === "status") {
      if (!TASK_STATUS_VALUES.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      const result = await bulkUpdateStatus(ids, user, status);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "delete") {
      const result = await bulkDeleteTasks(ids, user);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { success: false, error: "Unknown bulk action" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { updateIssue, deleteIssue } from "@/services/issueService";

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const issue = await updateIssue(id, user, body);
    return NextResponse.json({ success: true, issue });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  try {
    await deleteIssue(id, user);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

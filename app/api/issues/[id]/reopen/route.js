import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { reopenIssue } from "@/services/issueService";

export async function POST(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  try {
    const issue = await reopenIssue(id, user);
    return NextResponse.json({ success: true, issue });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

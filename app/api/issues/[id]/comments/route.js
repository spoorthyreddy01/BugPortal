import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { listCommentsByIssue, createComment } from "@/services/commentService";

export async function GET(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const comments = await listCommentsByIssue(id);
  return NextResponse.json({ success: true, comments });
}

export async function POST(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const comment = await createComment(id, body.text, user.id, user.name);
    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

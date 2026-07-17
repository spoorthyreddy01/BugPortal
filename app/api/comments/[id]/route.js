import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { updateComment, deleteComment } from "@/services/commentService";

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  try {
    const comment = await updateComment(id, body.text, user.id);
    return NextResponse.json({ success: true, comment });
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
    await deleteComment(id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

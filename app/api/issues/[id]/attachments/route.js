import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import {
  createAttachment,
  listAttachmentsByIssue,
} from "@/services/attachmentService";

export async function GET(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const attachments = await listAttachmentsByIssue(id);
  return NextResponse.json({ success: true, attachments });
}

export async function POST(request, { params }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  if (
    !body.publicId ||
    !body.secureUrl ||
    !body.originalFilename ||
    !body.fileType ||
    !body.fileSize
  ) {
    return NextResponse.json(
      { success: false, error: "Missing attachment metadata" },
      { status: 400 }
    );
  }

  try {
    const attachment = await createAttachment(id, body, user.id);
    return NextResponse.json({ success: true, attachment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 500 }
    );
  }
}

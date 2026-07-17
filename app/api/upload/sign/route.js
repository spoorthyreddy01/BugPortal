import { NextResponse } from "next/server";
import { requireUser } from "@/middleware/requireAuth";
import { generateUploadSignature } from "@/services/cloudinaryService";

export async function POST(request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json().catch(() => ({}));
  const folder = body.folder || "bugportal/issues";

  const signatureData = generateUploadSignature(folder);
  return NextResponse.json({ success: true, ...signatureData });
}

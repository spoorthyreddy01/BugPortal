import { connectDB } from "@/lib/db";
import Attachment from "@/models/Attachment";
import ActivityLog from "@/models/ActivityLog";
import { destroyWithRetry } from "./cloudinaryService";
import { getCloudinaryResourceType } from "@/utils/cloudinaryResourceType";
import {
  ACTIVITY_TYPES,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_UPLOAD_SIZE_MB,
} from "@/config/constants";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function createAttachment(issueId, data, uploaderId) {
  await connectDB();

  if (!ALLOWED_ATTACHMENT_TYPES.includes(data.fileType)) {
    throw httpError("Unsupported file type", 400);
  }
  if (data.fileSize > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    throw httpError(`File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit`, 400);
  }

  const attachment = await Attachment.create({
    issue: issueId,
    originalFilename: data.originalFilename,
    publicId: data.publicId,
    secureUrl: data.secureUrl,
    fileType: data.fileType,
    fileSize: data.fileSize,
    uploadedBy: uploaderId,
  });

  await ActivityLog.create({
    issue: issueId,
    type: ACTIVITY_TYPES.ATTACHMENT_UPLOADED,
    actor: uploaderId,
    message: `Uploaded ${data.originalFilename}`,
  });

  return attachment;
}

export async function listAttachmentsByIssue(issueId) {
  await connectDB();
  return Attachment.find({ issue: issueId }).sort({ uploadedAt: 1 }).lean();
}

// Idempotent by design — safe to call more than once for the same issue
// (e.g. a resolve → reopen → resolve cycle, or a manual retry after a
// prior partial failure). Attachments that fail to delete from Cloudinary
// are left in place rather than removed from Mongo, so a later run can
// pick them back up; this function itself never throws, since attachment
// cleanup must never block issue resolution.
export async function cleanupAttachmentsForIssue(issueId) {
  await connectDB();

  const attachments = await Attachment.find({ issue: issueId }).lean();
  if (!attachments.length) return { deleted: 0, total: 0 };

  let deleted = 0;
  for (const attachment of attachments) {
    try {
      await destroyWithRetry(
        attachment.publicId,
        getCloudinaryResourceType(attachment.fileType)
      );
      await Attachment.deleteOne({ _id: attachment._id });
      deleted += 1;
    } catch (err) {
      console.error(
        `Skipping cleanup for attachment ${attachment._id}:`,
        err?.message
      );
    }
  }

  await ActivityLog.create({
    issue: issueId,
    type: ACTIVITY_TYPES.ATTACHMENT_CLEANUP,
    actor: null,
    message: "System removed all attachments after issue resolution.",
  });

  return { deleted, total: attachments.length };
}

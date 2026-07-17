import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    originalFilename: { type: String, required: true },
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "uploadedAt", updatedAt: false } }
);

AttachmentSchema.index({ issue: 1 });

export default mongoose.models.Attachment ||
  mongoose.model("Attachment", AttachmentSchema);

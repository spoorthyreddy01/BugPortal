import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ issue: 1, createdAt: 1 });

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);

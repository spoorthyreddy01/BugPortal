import mongoose from "mongoose";

const TaskCommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
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

TaskCommentSchema.index({ task: 1, createdAt: 1 });

export default mongoose.models.TaskComment ||
  mongoose.model("TaskComment", TaskCommentSchema);

import mongoose from "mongoose";
import { ACTIVITY_TYPES } from "../config/constants.js";

const TaskActivityLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TaskActivityLogSchema.index({ task: 1, createdAt: -1 });

export default mongoose.models.TaskActivityLog ||
  mongoose.model("TaskActivityLog", TaskActivityLogSchema);

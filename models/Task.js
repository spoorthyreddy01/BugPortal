import mongoose from "mongoose";
import {
  TASK_PRIORITY,
  TASK_PRIORITY_VALUES,
  TASK_STATUS,
  TASK_STATUS_VALUES,
  TASK_RECURRENCE,
  TASK_RECURRENCE_VALUES,
} from "../config/constants.js";

const SubtaskSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const TaskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    priority: {
      type: String,
      enum: TASK_PRIORITY_VALUES,
      default: TASK_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: TASK_STATUS_VALUES,
      default: TASK_STATUS.TODO,
    },

    dueDate: { type: Date, default: null },
    labels: { type: [String], default: [] },
    subtasks: { type: [SubtaskSchema], default: [] },
    order: { type: Number, default: 0 },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedAt: { type: Date, default: null },
    dueSoonNotifiedAt: { type: Date, default: null },
    recurrence: {
      frequency: {
        type: String,
        enum: TASK_RECURRENCE_VALUES,
        default: TASK_RECURRENCE.NONE,
      },
    },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ project: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ title: "text", description: "text" });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);

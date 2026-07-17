import mongoose from "mongoose";
import {
  ISSUE_PRIORITY,
  ISSUE_PRIORITY_VALUES,
  ISSUE_STATUS,
  ISSUE_STATUS_VALUES,
} from "../config/constants.js";

const IssueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    module: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    priority: {
      type: String,
      enum: ISSUE_PRIORITY_VALUES,
      default: ISSUE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: ISSUE_STATUS_VALUES,
      default: ISSUE_STATUS.OPEN,
    },

    expectedResult: { type: String, default: "" },
    actualResult: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    appVersion: { type: String, default: "" },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startedWorkingAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

IssueSchema.index({ project: 1, status: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ reporter: 1 });
IssueSchema.index({ currentDeveloper: 1 });
IssueSchema.index({ title: "text", description: "text" });

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);

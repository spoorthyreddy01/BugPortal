import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import ActivityLog from "@/models/ActivityLog";
import {
  ISSUE_STATUS,
  ISSUE_STATUS_VALUES,
  ISSUE_PRIORITY,
  ISSUE_PRIORITY_VALUES,
} from "@/config/constants";

export async function getSummaryCounts() {
  await connectDB();

  const [
    total,
    open,
    inProgress,
    resolved,
    closed,
    critical,
    available,
    beingWorked,
  ] = await Promise.all([
    Issue.countDocuments({}),
    Issue.countDocuments({ status: ISSUE_STATUS.OPEN }),
    Issue.countDocuments({ status: ISSUE_STATUS.IN_PROGRESS }),
    Issue.countDocuments({ status: ISSUE_STATUS.RESOLVED }),
    Issue.countDocuments({ status: ISSUE_STATUS.CLOSED }),
    Issue.countDocuments({ priority: ISSUE_PRIORITY.CRITICAL }),
    Issue.countDocuments({
      currentDeveloper: null,
      status: { $nin: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED] },
    }),
    Issue.countDocuments({ currentDeveloper: { $ne: null } }),
  ]);

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
    critical,
    available,
    beingWorked,
  };
}

export async function getIssuesByProject() {
  await connectDB();

  return Issue.aggregate([
    { $group: { _id: "$project", value: { $sum: 1 } } },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: "$project" },
    { $project: { _id: 0, label: "$project.name", value: 1 } },
    { $sort: { value: -1 } },
  ]);
}

export async function getIssuesByStatus() {
  await connectDB();

  const rows = await Issue.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.value]));

  return ISSUE_STATUS_VALUES.map((status) => ({
    status,
    value: counts[status] || 0,
  }));
}

export async function getIssuesByPriority() {
  await connectDB();

  const rows = await Issue.aggregate([
    { $group: { _id: "$priority", value: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.value]));

  return ISSUE_PRIORITY_VALUES.map((priority) => ({
    priority,
    value: counts[priority] || 0,
  }));
}

export async function getRecentIssues(limit = 5) {
  await connectDB();

  return Issue.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("project", "name")
    .populate("reporter", "name email image")
    .populate("currentDeveloper", "name email image")
    .lean();
}

export async function getRecentActivity(limit = 8) {
  await connectDB();

  return ActivityLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name email image")
    .populate("issue", "title")
    .lean();
}

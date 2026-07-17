import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import Attachment from "@/models/Attachment";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { cleanupAttachmentsForIssue } from "./attachmentService";
import { notifyUsers } from "./notificationService";
import {
  ACTIVITY_TYPES,
  ISSUE_STATUS,
  ROLES,
  USER_STATUS,
  NOTIFICATION_TYPES,
} from "@/config/constants";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const POPULATE_FIELDS = [
  { path: "project", select: "name" },
  { path: "reporter", select: "name email image" },
  { path: "currentDeveloper", select: "name email image" },
];

const PRIORITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

export async function createIssue(data, reporterId, reporterName) {
  await connectDB();

  const issue = await Issue.create({
    project: data.project,
    module: data.module || "",
    title: data.title,
    description: data.description,
    priority: data.priority,
    expectedResult: data.expectedResult || "",
    actualResult: data.actualResult || "",
    browser: data.browser || "",
    operatingSystem: data.operatingSystem || "",
    appVersion: data.appVersion || "",
    reporter: reporterId,
  });

  await ActivityLog.create({
    issue: issue._id,
    type: ACTIVITY_TYPES.ISSUE_CREATED,
    actor: reporterId,
    message: "Issue created",
  });

  // Let every developer/admin know a new issue is available to pick up.
  try {
    const developers = await User.find({
      role: { $in: [ROLES.DEVELOPER, ROLES.ADMIN] },
      status: USER_STATUS.ACTIVE,
    })
      .select("_id")
      .lean();

    await notifyUsers({
      recipientIds: developers.map((d) => d._id),
      type: NOTIFICATION_TYPES.ISSUE_CREATED,
      issueId: issue._id,
      triggeredBy: reporterId,
      message: `${reporterName || "Someone"} reported a new issue: "${issue.title}"`,
    });
  } catch (err) {
    console.error(`Notification failed for new issue ${issue._id}:`, err);
  }

  return issue;
}

export async function listIssues({
  q = "",
  project = "",
  status = "",
  priority = "",
  workingDeveloper = "",
  reporter = "",
  sort = "-createdAt",
  page = 1,
  limit = 20,
} = {}) {
  await connectDB();

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (reporter) filter.reporter = reporter;
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (workingDeveloper) filter.currentDeveloper = workingDeveloper;

  const skip = (page - 1) * limit;
  const isPrioritySort = sort === "priority" || sort === "-priority";

  let issues;
  if (isPrioritySort) {
    // Priority is stored as a string enum, so a plain field sort would go
    // alphabetical (critical, high, low, medium) instead of by severity —
    // this weights it explicitly.
    const direction = sort.startsWith("-") ? -1 : 1;
    issues = await Issue.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: Object.entries(PRIORITY_WEIGHT).map(
                ([value, weight]) => ({
                  case: { $eq: ["$priority", value] },
                  then: weight,
                })
              ),
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityWeight: direction, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    issues = await Issue.populate(issues, POPULATE_FIELDS);
  } else {
    issues = await Issue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(POPULATE_FIELDS)
      .lean();
  }

  const total = await Issue.countDocuments(filter);

  const attachmentCounts = await Attachment.aggregate([
    { $match: { issue: { $in: issues.map((i) => i._id) } } },
    { $group: { _id: "$issue", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    attachmentCounts.map((c) => [c._id.toString(), c.count])
  );

  return {
    issues: issues.map((i) => ({
      ...i,
      attachmentCount: countMap[i._id.toString()] || 0,
    })),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getIssueById(id) {
  await connectDB();
  return Issue.findById(id).populate(POPULATE_FIELDS).lean();
}

export async function getIssueActivity(issueId) {
  await connectDB();
  return ActivityLog.find({ issue: issueId })
    .sort({ createdAt: -1 })
    .populate("actor", "name email image")
    .lean();
}

export async function startWorking(issueId, user) {
  await connectDB();
  const issue = await Issue.findById(issueId);
  if (!issue) throw httpError("Issue not found", 404);

  if (![ROLES.DEVELOPER, ROLES.ADMIN].includes(user.role)) {
    throw httpError("Only developers can start working on an issue", 403);
  }
  if (issue.currentDeveloper) {
    throw httpError("Someone is already working on this issue", 409);
  }
  if ([ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(issue.status)) {
    throw httpError("Cannot start working on a resolved or closed issue", 400);
  }

  issue.status = ISSUE_STATUS.IN_PROGRESS;
  issue.currentDeveloper = user.id;
  issue.startedWorkingAt = new Date();
  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    type: ACTIVITY_TYPES.STARTED_WORKING,
    actor: user.id,
    message: "Started working on this issue",
  });

  try {
    await notifyUsers({
      recipientIds: [issue.reporter],
      type: NOTIFICATION_TYPES.STARTED_WORKING,
      issueId: issue._id,
      triggeredBy: user.id,
      message: `${user.name || "Someone"} started working on "${issue.title}"`,
    });
  } catch (err) {
    console.error(`Notification failed for issue ${issue._id}:`, err);
  }

  return issue;
}

export async function stopWorking(issueId, user) {
  await connectDB();
  const issue = await Issue.findById(issueId);
  if (!issue) throw httpError("Issue not found", 404);

  if (!issue.currentDeveloper || issue.currentDeveloper.toString() !== user.id) {
    throw httpError(
      "Only the developer currently working on this issue can stop",
      403
    );
  }

  issue.status = ISSUE_STATUS.OPEN;
  issue.currentDeveloper = null;
  issue.startedWorkingAt = null;
  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    type: ACTIVITY_TYPES.STOPPED_WORKING,
    actor: user.id,
    message: "Stopped working on this issue",
  });

  return issue;
}

export async function resolveIssue(issueId, user) {
  await connectDB();
  const issue = await Issue.findById(issueId);
  if (!issue) throw httpError("Issue not found", 404);

  const isCurrentDeveloper =
    issue.currentDeveloper && issue.currentDeveloper.toString() === user.id;
  if (!isCurrentDeveloper && user.role !== ROLES.ADMIN) {
    throw httpError(
      "Only the developer working on this issue (or an admin) can resolve it",
      403
    );
  }

  issue.status = ISSUE_STATUS.RESOLVED;
  issue.resolvedAt = new Date();
  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    type: ACTIVITY_TYPES.ISSUE_RESOLVED,
    actor: user.id,
    message: "Marked this issue as resolved",
  });

  // Attachment cleanup must never block issue resolution — the service
  // itself already swallows per-attachment failures, but this is a second
  // safety net in case it throws unexpectedly (e.g. a DB hiccup).
  try {
    await cleanupAttachmentsForIssue(issue._id);
  } catch (err) {
    console.error(`Attachment cleanup failed for issue ${issue._id}:`, err);
  }

  try {
    await notifyUsers({
      recipientIds: [issue.reporter],
      type: NOTIFICATION_TYPES.ISSUE_RESOLVED,
      issueId: issue._id,
      triggeredBy: user.id,
      message: `${user.name || "Someone"} resolved "${issue.title}"`,
    });
  } catch (err) {
    console.error(`Notification failed for issue ${issue._id}:`, err);
  }

  return issue;
}

export async function reopenIssue(issueId, user) {
  await connectDB();
  const issue = await Issue.findById(issueId);
  if (!issue) throw httpError("Issue not found", 404);

  const isReporter = issue.reporter.toString() === user.id;
  const isLastDeveloper =
    issue.currentDeveloper && issue.currentDeveloper.toString() === user.id;
  if (!isReporter && !isLastDeveloper && user.role !== ROLES.ADMIN) {
    throw httpError(
      "Only the reporter, the developer who resolved it, or an admin can reopen this issue",
      403
    );
  }
  if (![ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(issue.status)) {
    throw httpError("Only resolved or closed issues can be reopened", 400);
  }

  const previousDeveloper = issue.currentDeveloper;

  issue.status = ISSUE_STATUS.OPEN;
  issue.currentDeveloper = null;
  issue.startedWorkingAt = null;
  issue.resolvedAt = null;
  await issue.save();

  await ActivityLog.create({
    issue: issue._id,
    type: ACTIVITY_TYPES.ISSUE_REOPENED,
    actor: user.id,
    message: "Reopened this issue",
  });

  try {
    await notifyUsers({
      recipientIds: [issue.reporter, previousDeveloper],
      type: NOTIFICATION_TYPES.ISSUE_REOPENED,
      issueId: issue._id,
      triggeredBy: user.id,
      message: `${user.name || "Someone"} reopened "${issue.title}"`,
    });
  } catch (err) {
    console.error(`Notification failed for issue ${issue._id}:`, err);
  }

  return issue;
}

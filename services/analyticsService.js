import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { ACTIVITY_TYPES, ROLES, USER_STATUS } from "@/config/constants";

export async function getResolutionMetrics() {
  await connectDB();

  const resolved = await Issue.find({ resolvedAt: { $ne: null } })
    .select("createdAt resolvedAt")
    .lean();

  if (!resolved.length) {
    return { avgResolutionHours: 0, resolvedCount: 0 };
  }

  const totalHours = resolved.reduce((sum, issue) => {
    const diffMs = new Date(issue.resolvedAt) - new Date(issue.createdAt);
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);

  return {
    avgResolutionHours: Math.round((totalHours / resolved.length) * 10) / 10,
    resolvedCount: resolved.length,
  };
}

export async function getReopenRate() {
  await connectDB();

  const [reopenCount, resolvedCount] = await Promise.all([
    ActivityLog.countDocuments({ type: ACTIVITY_TYPES.ISSUE_REOPENED }),
    ActivityLog.countDocuments({ type: ACTIVITY_TYPES.ISSUE_RESOLVED }),
  ]);

  const rate =
    resolvedCount > 0
      ? Math.round((reopenCount / resolvedCount) * 1000) / 10
      : 0;

  return { reopenCount, resolvedCount, rate };
}

export async function getDeveloperPerformance() {
  await connectDB();

  const developers = await User.find({
    role: { $in: [ROLES.DEVELOPER, ROLES.ADMIN] },
    status: USER_STATUS.ACTIVE,
  })
    .select("name email image")
    .lean();

  const [resolvedCounts, activeCounts] = await Promise.all([
    ActivityLog.aggregate([
      { $match: { type: ACTIVITY_TYPES.ISSUE_RESOLVED, actor: { $ne: null } } },
      { $group: { _id: "$actor", count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: { currentDeveloper: { $ne: null } } },
      { $group: { _id: "$currentDeveloper", count: { $sum: 1 } } },
    ]),
  ]);

  const resolvedMap = Object.fromEntries(
    resolvedCounts.map((r) => [r._id?.toString(), r.count])
  );
  const activeMap = Object.fromEntries(
    activeCounts.map((r) => [r._id?.toString(), r.count])
  );

  return developers
    .map((dev) => ({
      ...dev,
      resolvedCount: resolvedMap[dev._id.toString()] || 0,
      activeCount: activeMap[dev._id.toString()] || 0,
    }))
    .sort((a, b) => b.resolvedCount - a.resolvedCount);
}

export async function getIssuesTrend(days = 14) {
  await connectDB();

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const [created, resolved] = await Promise.all([
    Issue.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Issue.aggregate([
      { $match: { resolvedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$resolvedAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const createdMap = Object.fromEntries(created.map((c) => [c._id, c.count]));
  const resolvedMap = Object.fromEntries(
    resolved.map((r) => [r._id, r.count])
  );

  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: key,
      created: createdMap[key] || 0,
      resolved: resolvedMap[key] || 0,
    });
  }

  return result;
}

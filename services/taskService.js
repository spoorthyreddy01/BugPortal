import { addDays, addWeeks, addMonths } from "date-fns";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import TaskComment from "@/models/TaskComment";
import TaskActivityLog from "@/models/TaskActivityLog";
import { notifyUsers } from "./notificationService";
import { sendTaskAssignedMail, sendTaskDueSoonMail } from "./mailService";
import {
  ACTIVITY_TYPES,
  TASK_STATUS,
  TASK_STATUS_VALUES,
  TASK_PRIORITY_VALUES,
  TASK_RECURRENCE,
  ROLES,
  NOTIFICATION_TYPES,
} from "@/config/constants";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const POPULATE_FIELDS = [
  { path: "project", select: "name" },
  { path: "assignee", select: "name email image" },
  { path: "createdBy", select: "name email image" },
];

const PRIORITY_WEIGHT = { urgent: 4, high: 3, medium: 2, low: 1 };

const EDITABLE_FIELDS = [
  "project",
  "title",
  "description",
  "priority",
  "dueDate",
  "labels",
  "assignee",
  "recurrence",
];

// Only the creator, the assignee, or an admin can change or remove a task —
// mirrors assertCanModify in issueService.js.
function assertCanModify(task, user, action) {
  const isCreator = task.createdBy.toString() === user.id;
  const isAssignee = task.assignee && task.assignee.toString() === user.id;
  if (!isCreator && !isAssignee && user.role !== ROLES.ADMIN) {
    throw httpError(`Only the creator, assignee, or an admin can ${action} this task`, 403);
  }
}

// Moving a task on the board is deliberately narrower than assertCanModify:
// only the person actually assigned to the work can change its status —
// not the creator, and not an admin — since it's their board to move.
function assertCanMove(task, user) {
  const isAssignee = task.assignee && task.assignee.toString() === user.id;
  if (!isAssignee) {
    throw httpError("Only the assigned developer can move this task", 403);
  }
}

export async function createTask(data, creatorId, creatorName) {
  await connectDB();

  // One-task-at-a-time rule: a person can't be handed (or hand themselves)
  // a second active task while one is still open. Applies uniformly —
  // no admin exception — since the whole point is nobody juggles two
  // self-declared tasks at once.
  if (data.assignee) {
    const alreadyActive = await Task.findOne({
      assignee: data.assignee,
      status: { $ne: TASK_STATUS.DONE },
    }).select("_id title");
    if (alreadyActive) {
      throw httpError(
        `This person already has an active task ("${alreadyActive.title}") — it must be finished first`,
        409
      );
    }
  }

  const task = await Task.create({
    project: data.project || null,
    title: data.title,
    description: data.description || "",
    priority: data.priority,
    dueDate: data.dueDate || null,
    labels: data.labels || [],
    subtasks: (data.subtasks || []).map((text) => ({ text, done: false })),
    assignee: data.assignee || null,
    createdBy: creatorId,
  });

  await TaskActivityLog.create({
    task: task._id,
    type: ACTIVITY_TYPES.TASK_CREATED,
    actor: creatorId,
    message: "Task created",
  });

  if (task.assignee && task.assignee.toString() !== creatorId) {
    try {
      await notifyUsers({
        recipientIds: [task.assignee],
        type: NOTIFICATION_TYPES.TASK_ASSIGNED,
        taskId: task._id,
        triggeredBy: creatorId,
        message: `${creatorName || "Someone"} assigned you a task: "${task.title}"`,
      });
    } catch (err) {
      console.error(`Notification failed for new task ${task._id}:`, err);
    }

    try {
      await sendTaskAssignedMail(task, creatorName);
    } catch (err) {
      console.error(`Mail delivery failed for new task ${task._id}:`, err);
    }
  }

  return task;
}

export async function listTasks({
  q = "",
  project = "",
  status = "",
  priority = "",
  assignee = "",
  label = "",
  sort = "-createdAt",
  page = 1,
  limit = 50,
} = {}) {
  await connectDB();

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (label) filter.labels = label;

  const skip = (page - 1) * limit;
  const isPrioritySort = sort === "priority" || sort === "-priority";

  let tasks;
  if (isPrioritySort) {
    // Priority is a string enum, so a plain field sort would go alphabetical
    // instead of by severity — weight it explicitly, same as issueService.js.
    const direction = sort.startsWith("-") ? -1 : 1;
    tasks = await Task.aggregate([
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
    tasks = await Task.populate(tasks, POPULATE_FIELDS);
  } else {
    tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(POPULATE_FIELDS)
      .lean();
  }

  const total = await Task.countDocuments(filter);

  return {
    tasks,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

// Fetches every task matching the filter (no pagination) and buckets it by
// status for the board view, in each column's manual `order`.
export async function listTasksForBoard(filters = {}) {
  await connectDB();

  const filter = {};
  if (filters.project) filter.project = filters.project;
  if (filters.priority) filter.priority = filters.priority;
  if (filters.assignee) filter.assignee = filters.assignee;
  if (filters.label) filter.labels = filters.label;

  const tasks = await Task.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .populate(POPULATE_FIELDS)
    .lean();

  const board = Object.fromEntries(
    Object.values(TASK_STATUS).map((status) => [status, []])
  );
  for (const task of tasks) {
    (board[task.status] || (board[task.status] = [])).push(task);
  }
  return board;
}

export async function getTaskById(id) {
  await connectDB();
  return Task.findById(id).populate(POPULATE_FIELDS).lean();
}

export async function getTaskActivity(taskId) {
  await connectDB();
  return TaskActivityLog.find({ task: taskId })
    .sort({ createdAt: -1 })
    .populate("actor", "name email image")
    .lean();
}

export async function clearTaskActivity(taskId, user) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanModify(task, user, "clear the activity log for");

  await TaskActivityLog.deleteMany({ task: taskId });
  return { success: true };
}

export async function updateTask(taskId, user, updates) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanModify(task, user, "edit");

  const previousAssignee = task.assignee ? task.assignee.toString() : null;
  const previousDueDate = task.dueDate ? task.dueDate.getTime() : null;

  for (const field of EDITABLE_FIELDS) {
    if (updates[field] !== undefined) {
      task[field] = updates[field];
    }
  }

  const newDueDate = task.dueDate ? task.dueDate.getTime() : null;
  if (newDueDate !== previousDueDate) {
    task.dueSoonNotifiedAt = null;
  }

  await task.save();

  await TaskActivityLog.create({
    task: task._id,
    type: ACTIVITY_TYPES.TASK_UPDATED,
    actor: user.id,
    message: `${user.name || "Someone"} edited this task`,
  });

  const newAssignee = task.assignee ? task.assignee.toString() : null;
  if (newAssignee && newAssignee !== previousAssignee && newAssignee !== user.id) {
    try {
      await notifyUsers({
        recipientIds: [task.assignee],
        type: NOTIFICATION_TYPES.TASK_ASSIGNED,
        taskId: task._id,
        triggeredBy: user.id,
        message: `${user.name || "Someone"} assigned you a task: "${task.title}"`,
      });
    } catch (err) {
      console.error(`Notification failed for task ${task._id}:`, err);
    }

    try {
      await sendTaskAssignedMail(task, user.name);
    } catch (err) {
      console.error(`Mail delivery failed for task ${task._id}:`, err);
    }
  }

  return task;
}

export async function moveTask(taskId, user, { status, order }) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanMove(task, user);

  const previousStatus = task.status;
  if (status !== undefined) task.status = status;
  if (order !== undefined) task.order = order;

  if (status === TASK_STATUS.DONE && previousStatus !== TASK_STATUS.DONE) {
    task.completedAt = new Date();
  } else if (status !== undefined && status !== TASK_STATUS.DONE) {
    task.completedAt = null;
  }

  await task.save();

  if (status !== undefined && status !== previousStatus) {
    const wasCompleted =
      status === TASK_STATUS.DONE && previousStatus !== TASK_STATUS.DONE;
    const wasReopened =
      previousStatus === TASK_STATUS.DONE && status !== TASK_STATUS.DONE;

    await TaskActivityLog.create({
      task: task._id,
      type: wasCompleted
        ? ACTIVITY_TYPES.TASK_COMPLETED
        : wasReopened
          ? ACTIVITY_TYPES.TASK_REOPENED
          : ACTIVITY_TYPES.TASK_STATUS_CHANGED,
      actor: user.id,
      message: wasCompleted
        ? "Marked this task as done"
        : wasReopened
          ? "Reopened this task"
          : `Moved this task to ${status.replace("_", " ")}`,
    });

    const recipients = [task.createdBy, task.assignee].filter(Boolean);
    try {
      await notifyUsers({
        recipientIds: recipients,
        type: wasCompleted
          ? NOTIFICATION_TYPES.TASK_COMPLETED
          : NOTIFICATION_TYPES.TASK_STATUS_CHANGED,
        taskId: task._id,
        triggeredBy: user.id,
        message: wasCompleted
          ? `${user.name || "Someone"} completed "${task.title}"`
          : `${user.name || "Someone"} moved "${task.title}" to ${status.replace("_", " ")}`,
      });
    } catch (err) {
      console.error(`Notification failed for task ${task._id}:`, err);
    }

    if (wasCompleted && task.recurrence?.frequency !== TASK_RECURRENCE.NONE) {
      try {
        await cloneRecurringTask(task, user);
      } catch (err) {
        console.error(`Failed to clone recurring task ${task._id}:`, err);
      }
    }
  }

  return task;
}

// Advances the due date from the ORIGINAL due date (not "now"), so a task
// due every Monday keeps landing on Monday regardless of when it's actually
// completed. Falls back to today when the completed task had no due date.
function advanceDueDate(dueDate, frequency) {
  const base = dueDate || new Date();
  if (frequency === TASK_RECURRENCE.DAILY) return addDays(base, 1);
  if (frequency === TASK_RECURRENCE.WEEKLY) return addWeeks(base, 1);
  if (frequency === TASK_RECURRENCE.MONTHLY) return addMonths(base, 1);
  return null;
}

async function cloneRecurringTask(completedTask, actor) {
  const nextDueDate = advanceDueDate(
    completedTask.dueDate,
    completedTask.recurrence.frequency
  );

  const clone = await Task.create({
    project: completedTask.project,
    title: completedTask.title,
    description: completedTask.description,
    priority: completedTask.priority,
    status: TASK_STATUS.TODO,
    dueDate: nextDueDate,
    labels: completedTask.labels,
    subtasks: completedTask.subtasks.map((s) => ({ text: s.text, done: false })),
    assignee: completedTask.assignee,
    createdBy: completedTask.createdBy,
    recurrence: completedTask.recurrence,
  });

  await TaskActivityLog.create({
    task: clone._id,
    type: ACTIVITY_TYPES.TASK_CREATED,
    actor: actor.id,
    message: `Created automatically — repeats from "${completedTask.title}"`,
  });

  if (clone.assignee) {
    try {
      await notifyUsers({
        recipientIds: [clone.assignee],
        type: NOTIFICATION_TYPES.TASK_ASSIGNED,
        taskId: clone._id,
        triggeredBy: actor.id,
        message: `A new recurring task is ready: "${clone.title}"`,
      });
    } catch (err) {
      console.error(`Notification failed for recurring task ${clone._id}:`, err);
    }

    try {
      await sendTaskAssignedMail(clone, actor.name);
    } catch (err) {
      console.error(`Mail delivery failed for recurring task ${clone._id}:`, err);
    }
  }

  return clone;
}

export async function toggleSubtask(taskId, subtaskId, user) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanModify(task, user, "edit");

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) throw httpError("Subtask not found", 404);

  subtask.done = !subtask.done;
  await task.save();

  return task;
}

export async function addSubtask(taskId, user, text) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);
  if (!text?.trim()) throw httpError("Checklist item text is required", 400);

  assertCanModify(task, user, "edit");

  task.subtasks.push({ text: text.trim(), done: false });
  await task.save();

  return task;
}

export async function removeSubtask(taskId, subtaskId, user) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanModify(task, user, "edit");

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) throw httpError("Subtask not found", 404);

  task.subtasks.pull(subtaskId);
  await task.save();

  return task;
}

export async function deleteTask(taskId, user) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw httpError("Task not found", 404);

  assertCanModify(task, user, "delete");

  await Promise.all([
    TaskComment.deleteMany({ task: task._id }),
    TaskActivityLog.deleteMany({ task: task._id }),
  ]);

  await Task.deleteOne({ _id: task._id });

  return { success: true };
}

export async function listTaskComments(taskId) {
  await connectDB();
  return TaskComment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .populate("author", "name email image")
    .lean();
}

export async function createTaskComment(taskId, text, authorId, authorName) {
  await connectDB();

  if (!text || !text.trim()) {
    throw httpError("Comment text is required", 400);
  }

  const comment = await TaskComment.create({
    task: taskId,
    author: authorId,
    text: text.trim(),
  });

  await TaskActivityLog.create({
    task: taskId,
    type: ACTIVITY_TYPES.TASK_COMMENT_ADDED,
    actor: authorId,
    message: "Added a comment",
  });

  try {
    const task = await Task.findById(taskId)
      .select("title createdBy assignee")
      .lean();
    if (task) {
      await notifyUsers({
        recipientIds: [task.createdBy, task.assignee],
        type: NOTIFICATION_TYPES.TASK_COMMENT_ADDED,
        taskId,
        triggeredBy: authorId,
        message: `${authorName || "Someone"} commented on "${task.title}"`,
      });
    }
  } catch (err) {
    console.error(`Notification failed for comment on task ${taskId}:`, err);
  }

  return TaskComment.findById(comment._id)
    .populate("author", "name email image")
    .lean();
}

// Called by the daily Vercel Cron sweep (app/api/cron/task-due-reminders) —
// Vercel's Hobby plan only allows once-per-day cron schedules, so this runs
// once daily (see vercel.json) rather than hourly; the 24h lookahead window
// still catches anything due before the next day's run.
// dueSoonNotifiedAt is the anti-spam guard: once set, a task is never
// re-notified for the same due date, only if the due date itself changes
// (updateTask resets the guard back to null in that case).
export async function findAndNotifyDueSoonTasks(windowHours = 24) {
  await connectDB();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

  const dueSoonTasks = await Task.find({
    status: { $ne: TASK_STATUS.DONE },
    dueDate: { $gte: now, $lte: windowEnd },
    dueSoonNotifiedAt: null,
    assignee: { $ne: null },
  }).populate(POPULATE_FIELDS);

  let notified = 0;
  for (const task of dueSoonTasks) {
    try {
      await notifyUsers({
        recipientIds: [task.assignee._id],
        type: NOTIFICATION_TYPES.TASK_DUE_SOON,
        taskId: task._id,
        message: `"${task.title}" is due soon`,
      });
    } catch (err) {
      console.error(`Due-soon notification failed for task ${task._id}:`, err);
    }

    try {
      await sendTaskDueSoonMail(task);
    } catch (err) {
      console.error(`Due-soon mail failed for task ${task._id}:`, err);
    }

    task.dueSoonNotifiedAt = now;
    await task.save();
    notified += 1;
  }

  return { checked: dueSoonTasks.length, notified };
}

export async function getTaskSummaryCounts() {
  await connectDB();

  const [total, todo, inProgress, inReview, done, dueSoon] = await Promise.all([
    Task.countDocuments({}),
    Task.countDocuments({ status: TASK_STATUS.TODO }),
    Task.countDocuments({ status: TASK_STATUS.IN_PROGRESS }),
    Task.countDocuments({ status: TASK_STATUS.IN_REVIEW }),
    Task.countDocuments({ status: TASK_STATUS.DONE }),
    Task.countDocuments({
      status: { $ne: TASK_STATUS.DONE },
      dueDate: { $ne: null, $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    }),
  ]);

  return { total, todo, inProgress, inReview, done, dueSoon };
}

export async function getTasksByStatus() {
  await connectDB();

  const grouped = await Task.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(grouped.map((g) => [g._id, g.value]));

  return TASK_STATUS_VALUES.map((status) => ({
    status,
    value: countMap[status] || 0,
  }));
}

export async function getTasksByPriority() {
  await connectDB();

  const grouped = await Task.aggregate([
    { $group: { _id: "$priority", value: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(grouped.map((g) => [g._id, g.value]));

  return TASK_PRIORITY_VALUES.map((priority) => ({
    priority,
    value: countMap[priority] || 0,
  }));
}

export async function getDueSoonCount() {
  const { dueSoon } = await getTaskSummaryCounts();
  return dueSoon;
}

export async function getRecentTasks(limit = 5) {
  await connectDB();
  return Task.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate(POPULATE_FIELDS)
    .lean();
}

// Bulk actions apply the same per-task assertCanModify check as the
// single-task functions — a task the caller can't touch is silently
// skipped and counted, rather than failing the whole batch.
export async function bulkUpdateStatus(ids, user, status) {
  await connectDB();

  let succeeded = 0;
  let skipped = 0;

  for (const id of ids) {
    const task = await Task.findById(id);
    if (!task) {
      skipped += 1;
      continue;
    }
    try {
      assertCanMove(task, user);
    } catch {
      skipped += 1;
      continue;
    }

    const previousStatus = task.status;
    task.status = status;
    if (status === TASK_STATUS.DONE && previousStatus !== TASK_STATUS.DONE) {
      task.completedAt = new Date();
    } else if (status !== TASK_STATUS.DONE) {
      task.completedAt = null;
    }
    await task.save();

    if (status !== previousStatus) {
      await TaskActivityLog.create({
        task: task._id,
        type:
          status === TASK_STATUS.DONE
            ? ACTIVITY_TYPES.TASK_COMPLETED
            : ACTIVITY_TYPES.TASK_STATUS_CHANGED,
        actor: user.id,
        message: `${user.name || "Someone"} moved this task to ${status.replace("_", " ")} (bulk action)`,
      });
    }

    succeeded += 1;
  }

  return { succeeded, skipped };
}

export async function bulkDeleteTasks(ids, user) {
  await connectDB();

  let succeeded = 0;
  let skipped = 0;

  for (const id of ids) {
    const task = await Task.findById(id);
    if (!task) {
      skipped += 1;
      continue;
    }
    try {
      assertCanModify(task, user, "delete");
    } catch {
      skipped += 1;
      continue;
    }

    await Promise.all([
      TaskComment.deleteMany({ task: task._id }),
      TaskActivityLog.deleteMany({ task: task._id }),
    ]);
    await Task.deleteOne({ _id: task._id });

    succeeded += 1;
  }

  return { succeeded, skipped };
}

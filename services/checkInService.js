import { connectDB } from "@/lib/db";
import DailyCheckIn from "@/models/DailyCheckIn";
import Task from "@/models/Task";
import { createTask } from "./taskService";
import { TASK_STATUS } from "@/config/constants";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const TASK_POPULATE = { path: "task", select: "title description status priority subtasks" };

// Server-local YYYY-MM-DD — deliberately not UTC, so "today" matches the
// employee's own working day rather than flipping at UTC midnight.
export function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// A developer has at most one non-Done task assigned to them at a time
// (enforced in taskService.createTask) — this is that task, if any.
export async function getActiveTask(userId) {
  await connectDB();
  return Task.findOne({ assignee: userId, status: { $ne: TASK_STATUS.DONE } }).lean();
}

export async function getTodayCheckIn(userId) {
  await connectDB();
  const [activeTask, checkIn] = await Promise.all([
    getActiveTask(userId),
    DailyCheckIn.findOne({ user: userId, date: todayKey() })
      .populate(TASK_POPULATE)
      .lean(),
  ]);

  // Self-heal: a record from before the one-task-per-day schema change (or
  // any other corruption) has no `task` — treat it as if there's no
  // check-in today rather than handing the client a broken record.
  if (checkIn && !checkIn.task) {
    await DailyCheckIn.deleteOne({ _id: checkIn._id });
    return { activeTask, checkIn: null };
  }

  return { activeTask, checkIn };
}

// Checking in either (a) reconfirms the one task already active for this
// user, carrying it forward if it wasn't created today, or (b) — only when
// no active task exists — declares a brand-new one, which becomes active.
export async function checkIn(userId, userName, { taskId, newTask } = {}) {
  await connectDB();

  const active = await Task.findOne({
    assignee: userId,
    status: { $ne: TASK_STATUS.DONE },
  });

  let task;
  if (active) {
    if (taskId && taskId !== active._id.toString()) {
      throw httpError(
        `You still have an active task ("${active.title}") — finish or check out before starting another`,
        409
      );
    }
    task = active;
  } else {
    if (!newTask?.title) {
      throw httpError("Describe the task you're starting today", 400);
    }
    task = await createTask(
      {
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority || "medium",
        subtasks: newTask.subtasks || [],
        assignee: userId,
      },
      userId,
      userName
    );
    task.status = TASK_STATUS.IN_PROGRESS;
    await task.save();
  }

  const date = todayKey();
  const carriedOver = await DailyCheckIn.exists({
    user: userId,
    task: task._id,
    date: { $ne: date },
  });

  const record = await DailyCheckIn.findOneAndUpdate(
    { user: userId, date },
    {
      $set: { task: task._id, carriedOver: !!carriedOver },
      $setOnInsert: { checkedInAt: new Date() },
    },
    { upsert: true, new: true }
  ).populate(TASK_POPULATE);

  return record;
}

// Task.status is re-checked here (not trusted from check-in time) since it
// may have been completed any time between checking in and checking out.
export async function checkOut(userId, delayReason = "") {
  await connectDB();

  const record = await DailyCheckIn.findOne({ user: userId, date: todayKey() });
  if (!record) throw httpError("You haven't checked in today", 404);
  if (record.checkedOutAt) throw httpError("You've already checked out today", 400);

  // Self-heal a pre-existing record left over from before the one-task-per-day
  // schema change — it has no `task`, so it can never pass validation on
  // save(). Drop it and ask for a fresh check-in instead of erroring forever.
  if (!record.task) {
    await DailyCheckIn.deleteOne({ _id: record._id });
    throw httpError("Your check-in record was out of date — please check in again", 409);
  }

  const task = await Task.findById(record.task).select("status title").lean();
  const isDone = task?.status === TASK_STATUS.DONE;
  const reason = delayReason.trim();

  if (!isDone && !reason) {
    throw httpError(
      `A delay reason is required for "${task?.title || "your task"}"`,
      400
    );
  }

  record.delayReason = isDone ? "" : reason;
  record.checkedOutAt = new Date();
  await record.save();

  return DailyCheckIn.findById(record._id).populate(TASK_POPULATE).lean();
}

export async function getTeamCheckIns(date = todayKey()) {
  await connectDB();
  const records = await DailyCheckIn.find({ date })
    .populate("user", "name email image role")
    .populate(TASK_POPULATE)
    .sort({ checkedInAt: -1 })
    .lean();
  // Drop any pre-existing record left over from before the one-task-per-day
  // schema change (no `task`) rather than showing a blank row.
  return records.filter((r) => r.task);
}

export async function getCheckInHistory(userId, limit = 30) {
  await connectDB();
  const records = await DailyCheckIn.find({ user: userId })
    .populate(TASK_POPULATE)
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  return records.filter((r) => r.task);
}

// Cross-references live Task state (not the check-in snapshot) so admins
// see current work even for developers who haven't formally checked in.
export async function getInProgressByDeveloper() {
  await connectDB();

  const tasks = await Task.find({ status: { $ne: TASK_STATUS.DONE } })
    .populate("assignee", "name email image")
    .populate("createdBy", "name email image")
    .sort({ updatedAt: -1 })
    .lean();

  const byDeveloper = new Map();
  for (const task of tasks) {
    if (!task.assignee) continue;
    const key = task.assignee._id.toString();
    if (!byDeveloper.has(key)) {
      byDeveloper.set(key, { developer: task.assignee, tasks: [] });
    }
    byDeveloper.get(key).tasks.push(task);
  }

  return Array.from(byDeveloper.values());
}

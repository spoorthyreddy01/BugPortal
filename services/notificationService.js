import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Dedupes recipients and drops the actor themself, so triggering your own
// event (e.g. resolving an issue you also reported) never notifies you.
export async function notifyUsers({
  recipientIds,
  type,
  issueId,
  triggeredBy,
  message,
}) {
  await connectDB();

  const uniqueRecipients = [
    ...new Set((recipientIds || []).filter(Boolean).map(String)),
  ].filter((id) => id !== triggeredBy?.toString());

  if (!uniqueRecipients.length) return [];

  const docs = uniqueRecipients.map((recipient) => ({
    recipient,
    type,
    issue: issueId,
    triggeredBy: triggeredBy || null,
    message,
  }));

  return Notification.insertMany(docs);
}

export async function listNotificationsForUser(
  userId,
  { page = 1, limit = 20 } = {}
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("triggeredBy", "name email image")
      .populate("issue", "title")
      .lean(),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getUnreadCount(userId) {
  await connectDB();
  return Notification.countDocuments({ recipient: userId, read: false });
}

export async function markAsRead(notificationId, userId) {
  await connectDB();

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) throw httpError("Notification not found", 404);
  return notification;
}

export async function markAllAsRead(userId) {
  await connectDB();
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );
  return { success: true };
}

export async function deleteNotification(notificationId, userId) {
  await connectDB();

  const result = await Notification.deleteOne({
    _id: notificationId,
    recipient: userId,
  });

  if (result.deletedCount === 0) {
    throw httpError("Notification not found", 404);
  }

  return { success: true };
}

export async function clearAllNotifications(userId) {
  await connectDB();
  await Notification.deleteMany({ recipient: userId });
  return { success: true };
}

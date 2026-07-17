import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Issue from "@/models/Issue";
import ActivityLog from "@/models/ActivityLog";
import { notifyUsers } from "./notificationService";
import { ACTIVITY_TYPES, NOTIFICATION_TYPES } from "@/config/constants";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function listCommentsByIssue(issueId) {
  await connectDB();
  return Comment.find({ issue: issueId })
    .sort({ createdAt: 1 })
    .populate("author", "name email image")
    .lean();
}

export async function createComment(issueId, text, authorId, authorName) {
  await connectDB();

  if (!text || !text.trim()) {
    throw httpError("Comment text is required", 400);
  }

  const comment = await Comment.create({
    issue: issueId,
    author: authorId,
    text: text.trim(),
  });

  await ActivityLog.create({
    issue: issueId,
    type: ACTIVITY_TYPES.COMMENT_ADDED,
    actor: authorId,
    message: "Added a comment",
  });

  try {
    const issue = await Issue.findById(issueId)
      .select("title reporter currentDeveloper")
      .lean();
    if (issue) {
      await notifyUsers({
        recipientIds: [issue.reporter, issue.currentDeveloper],
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        issueId,
        triggeredBy: authorId,
        message: `${authorName || "Someone"} commented on "${issue.title}"`,
      });
    }
  } catch (err) {
    console.error(`Notification failed for comment on issue ${issueId}:`, err);
  }

  return Comment.findById(comment._id)
    .populate("author", "name email image")
    .lean();
}

export async function updateComment(commentId, text, userId) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw httpError("Comment not found", 404);
  if (comment.author.toString() !== userId) {
    throw httpError("You can only edit your own comments", 403);
  }
  if (!text || !text.trim()) {
    throw httpError("Comment text is required", 400);
  }

  comment.text = text.trim();
  comment.editedAt = new Date();
  await comment.save();

  return Comment.findById(comment._id)
    .populate("author", "name email image")
    .lean();
}

export async function deleteComment(commentId, userId) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw httpError("Comment not found", 404);
  if (comment.author.toString() !== userId) {
    throw httpError("You can only delete your own comments", 403);
  }

  await Comment.deleteOne({ _id: commentId });
  return { success: true };
}

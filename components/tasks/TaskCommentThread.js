"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function TaskCommentThread({ taskId, comments: initial }) {
  const [comments, setComments] = useState(initial);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/tasks/${taskId}/comments`, {
        text: commentText,
      });
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Comments
      </h3>
      <ul className="flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c._id} className="text-sm">
            <p className="text-zinc-800 dark:text-zinc-200">
              <span className="font-medium">
                {c.author?.name || c.author?.email}
              </span>{" "}
              {c.text}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
            </p>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No comments yet
          </p>
        )}
      </ul>
      <form onSubmit={addComment} className="flex gap-2 pt-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 dark:bg-white px-3 py-2 text-sm font-medium text-white dark:text-zinc-900 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}

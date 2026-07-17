"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, Loader2, Check, X } from "lucide-react";

function Avatar({ user }) {
  if (user?.image) {
    return (
      <Image
        src={user.image}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full"
      />
    );
  }
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
      {(user?.name || user?.email || "?")[0]?.toUpperCase()}
    </div>
  );
}

export default function CommentItem({ comment }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwn = session?.user?.id === comment.author?._id;

  const saveEdit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axios.patch(`/api/comments/${comment._id}`, { text });
      setEditing(false);
      toast.success("Comment updated");
      router.refresh();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update comment";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this comment?")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/api/comments/${comment._id}`);
      toast.success("Comment deleted");
      router.refresh();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete comment";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar user={comment.author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {comment.author?.name || comment.author?.email}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
            {comment.editedAt && " (edited)"}
          </span>
        </div>

        {editing ? (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-900 dark:bg-white px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setText(comment.text);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {comment.text}
          </p>
        )}

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

        {isOwn && !editing && (
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

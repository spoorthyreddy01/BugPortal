import CommentItem from "./CommentItem";

export default function CommentList({ comments }) {
  if (!comments.length) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-600">
        No comments yet
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <CommentItem key={c._id} comment={c} />
      ))}
    </div>
  );
}

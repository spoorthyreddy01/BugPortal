import Skeleton from "@/components/ui/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex justify-between gap-3">
        <Skeleton className="h-10 w-72 rounded-md" />
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 last:border-0"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

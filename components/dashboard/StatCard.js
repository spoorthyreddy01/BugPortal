export default function StatCard({ label, value, icon: Icon, tone = "default" }) {
  const toneClasses =
    tone === "critical"
      ? "text-red-600 dark:text-red-400"
      : "text-zinc-900 dark:text-zinc-50";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${toneClasses}`}>
        {value}
      </div>
    </div>
  );
}

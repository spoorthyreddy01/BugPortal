// Thin rounded-end bars with a direct value label per bar, so identity/value
// is never color-alone (relief rule for the lower-contrast palette slots).
export default function HorizontalBarChart({ data, emptyLabel = "No data yet" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const isEmpty = data.every((d) => d.value === 0);

  if (isEmpty) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400">
            {d.label}
          </span>
          <div className="relative h-2.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

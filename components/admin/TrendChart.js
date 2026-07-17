const CREATED_COLOR = "#2a78d6";
const RESOLVED_COLOR = "#008300";

export default function TrendChart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.created, d.resolved]));
  const isEmpty = data.every((d) => d.created === 0 && d.resolved === 0);

  if (isEmpty) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
        No issue activity in this period
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: CREATED_COLOR }}
          />
          Created
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: RESOLVED_COLOR }}
          />
          Resolved
        </span>
      </div>

      <div className="flex items-end gap-2 overflow-x-auto pb-2">
        {data.map((d) => (
          <div
            key={d.date}
            className="flex shrink-0 flex-col items-center gap-1"
            style={{ width: 28 }}
          >
            <div className="flex items-end gap-0.5" style={{ height: 100 }}>
              <div
                className="w-2.5 rounded-t"
                style={{
                  height: `${(d.created / max) * 100}%`,
                  minHeight: d.created > 0 ? 2 : 0,
                  backgroundColor: CREATED_COLOR,
                }}
                title={`${d.date}: ${d.created} created`}
              />
              <div
                className="w-2.5 rounded-t"
                style={{
                  height: `${(d.resolved / max) * 100}%`,
                  minHeight: d.resolved > 0 ? 2 : 0,
                  backgroundColor: RESOLVED_COLOR,
                }}
                title={`${d.date}: ${d.resolved} resolved`}
              />
            </div>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-600">
              {new Date(d.date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

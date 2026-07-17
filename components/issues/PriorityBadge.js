import { PRIORITY_CHART_COLORS, PRIORITY_LABELS } from "@/utils/chartColors";

export default function PriorityBadge({ priority }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
      style={{ backgroundColor: PRIORITY_CHART_COLORS[priority] }}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

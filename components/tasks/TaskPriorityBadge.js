import {
  TASK_PRIORITY_CHART_COLORS,
  TASK_PRIORITY_LABELS,
} from "@/utils/chartColors";

export default function TaskPriorityBadge({ priority }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
      style={{ backgroundColor: TASK_PRIORITY_CHART_COLORS[priority] }}
    >
      {TASK_PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

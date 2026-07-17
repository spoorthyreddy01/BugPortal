import { STATUS_CHART_COLORS, STATUS_LABELS } from "@/utils/chartColors";

export default function StatusBadge({ status }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
      style={{ backgroundColor: STATUS_CHART_COLORS[status] }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

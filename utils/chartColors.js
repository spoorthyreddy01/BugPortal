import { ISSUE_STATUS, ISSUE_PRIORITY } from "@/config/constants";

export const STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: "Open",
  [ISSUE_STATUS.IN_PROGRESS]: "In Progress",
  [ISSUE_STATUS.NEED_MORE_INFO]: "Need More Info",
  [ISSUE_STATUS.TESTING]: "Testing",
  [ISSUE_STATUS.RESOLVED]: "Resolved",
  [ISSUE_STATUS.CLOSED]: "Closed",
};

// Fixed categorical order (never cycled) + neutral gray for the inactive
// "closed" state, per the validated default palette.
export const STATUS_CHART_COLORS = {
  [ISSUE_STATUS.OPEN]: "#2a78d6",
  [ISSUE_STATUS.IN_PROGRESS]: "#eda100",
  [ISSUE_STATUS.NEED_MORE_INFO]: "#eb6834",
  [ISSUE_STATUS.TESTING]: "#1baf7a",
  [ISSUE_STATUS.RESOLVED]: "#008300",
  [ISSUE_STATUS.CLOSED]: "#898781",
};

export const PRIORITY_LABELS = {
  [ISSUE_PRIORITY.CRITICAL]: "Critical",
  [ISSUE_PRIORITY.HIGH]: "High",
  [ISSUE_PRIORITY.MEDIUM]: "Medium",
  [ISSUE_PRIORITY.LOW]: "Low",
};

// Reserved status palette (mode-invariant) — priority is a severity scale,
// so it borrows good/warning/serious/critical rather than the categorical set.
export const PRIORITY_CHART_COLORS = {
  [ISSUE_PRIORITY.CRITICAL]: "#d03b3b",
  [ISSUE_PRIORITY.HIGH]: "#ec835a",
  [ISSUE_PRIORITY.MEDIUM]: "#fab219",
  [ISSUE_PRIORITY.LOW]: "#0ca30c",
};

// Single sequential hue for magnitude comparisons (e.g. issues per project,
// where projects are ranked, not differentiated by identity).
export const SEQUENTIAL_CHART_COLOR = "#2a78d6";

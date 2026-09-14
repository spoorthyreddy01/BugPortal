import {
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  TASK_STATUS,
  TASK_PRIORITY,
} from "@/config/constants";

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

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: "To Do",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.IN_REVIEW]: "In Review",
  [TASK_STATUS.DONE]: "Done",
};

export const TASK_STATUS_CHART_COLORS = {
  [TASK_STATUS.TODO]: "#898781",
  [TASK_STATUS.IN_PROGRESS]: "#2a78d6",
  [TASK_STATUS.IN_REVIEW]: "#eda100",
  [TASK_STATUS.DONE]: "#008300",
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.URGENT]: "Urgent",
  [TASK_PRIORITY.HIGH]: "High",
  [TASK_PRIORITY.MEDIUM]: "Medium",
  [TASK_PRIORITY.LOW]: "Low",
};

export const TASK_PRIORITY_CHART_COLORS = {
  [TASK_PRIORITY.URGENT]: "#d03b3b",
  [TASK_PRIORITY.HIGH]: "#ec835a",
  [TASK_PRIORITY.MEDIUM]: "#fab219",
  [TASK_PRIORITY.LOW]: "#0ca30c",
};

export const ROLES = {
  ADMIN: "admin",
  DEVELOPER: "developer",
  REPORTER: "reporter",
};

export const ROLE_VALUES = Object.values(ROLES);

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const ISSUE_PRIORITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const ISSUE_PRIORITY_VALUES = Object.values(ISSUE_PRIORITY);

export const ISSUE_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  NEED_MORE_INFO: "need_more_info",
  TESTING: "testing",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export const ISSUE_STATUS_VALUES = Object.values(ISSUE_STATUS);

export const TASK_PRIORITY = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const TASK_PRIORITY_VALUES = Object.values(TASK_PRIORITY);

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
};

export const TASK_STATUS_VALUES = Object.values(TASK_STATUS);

export const TASK_RECURRENCE = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

export const TASK_RECURRENCE_VALUES = Object.values(TASK_RECURRENCE);

export const DEFAULT_PROJECTS = [
  "Fix4Ever Website",
  "CRM Portal",
  "Campus Intern Platform",
  "Fix4Ever App",
  "B2B Dashboard",
];

export const SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL || "spoorthy@fix4ever.com";

export const MAX_UPLOAD_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || 25
);

export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "video/mp4",
];

export const ACTIVITY_TYPES = {
  ISSUE_CREATED: "issue_created",
  ISSUE_UPDATED: "issue_updated",
  STARTED_WORKING: "started_working",
  STOPPED_WORKING: "stopped_working",
  COMMENT_ADDED: "comment_added",
  ATTACHMENT_UPLOADED: "attachment_uploaded",
  ISSUE_RESOLVED: "issue_resolved",
  ISSUE_REOPENED: "issue_reopened",
  ATTACHMENT_CLEANUP: "attachment_cleanup_completed",
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_ASSIGNED: "task_assigned",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_COMMENT_ADDED: "task_comment_added",
  TASK_COMPLETED: "task_completed",
  TASK_REOPENED: "task_reopened",
  TASK_DUE_SOON: "task_due_soon",
};

export const NOTIFICATION_TYPES = {
  ISSUE_CREATED: "issue_created",
  STARTED_WORKING: "started_working",
  COMMENT_ADDED: "comment_added",
  ISSUE_RESOLVED: "issue_resolved",
  ISSUE_REOPENED: "issue_reopened",
  ISSUE_DELETED: "issue_deleted",
  TASK_ASSIGNED: "task_assigned",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_COMMENT_ADDED: "task_comment_added",
  TASK_COMPLETED: "task_completed",
  TASK_DUE_SOON: "task_due_soon",
};

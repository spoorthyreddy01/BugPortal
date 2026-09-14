import { notFound } from "next/navigation";
import {
  getTaskById,
  getTaskActivity,
  listTaskComments,
} from "@/services/taskService";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import TaskWorkflowPanel from "@/components/tasks/TaskWorkflowPanel";
import TaskChecklistSection from "@/components/tasks/TaskChecklistSection";
import TaskCommentThread from "@/components/tasks/TaskCommentThread";
import TaskActivitySection from "@/components/tasks/TaskActivitySection";
import { TASK_STATUS_LABELS } from "@/utils/chartColors";

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  const [task, activity, comments] = await Promise.all([
    getTaskById(id),
    getTaskActivity(id),
    listTaskComments(id),
  ]);
  if (!task) notFound();

  const serializedTask = JSON.parse(JSON.stringify(task));
  const serializedActivity = JSON.parse(JSON.stringify(activity));
  const serializedComments = JSON.parse(JSON.stringify(comments));

  return (
    <div className="w-full max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {task.project?.name || "No project"}
          </p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {task.title}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <TaskPriorityBadge priority={task.priority} />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Created by {task.createdBy?.name || task.createdBy?.email} ·{" "}
            {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>

        <TaskWorkflowPanel task={serializedTask} />

        {task.description && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Description
            </h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-sm">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Assignee</p>
            <p className="text-zinc-800 dark:text-zinc-200">
              {task.assignee?.name || task.assignee?.email || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Due date</p>
            <p className="text-zinc-800 dark:text-zinc-200">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Repeats</p>
            <p className="capitalize text-zinc-800 dark:text-zinc-200">
              {task.recurrence?.frequency || "none"}
            </p>
          </div>
        </div>

        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <TaskChecklistSection
            taskId={task._id.toString()}
            subtasks={serializedTask.subtasks}
            createdById={task.createdBy?._id?.toString()}
            assigneeId={task.assignee?._id?.toString()}
          />
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <TaskCommentThread
            taskId={task._id.toString()}
            comments={serializedComments}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <TaskActivitySection
            taskId={task._id.toString()}
            activity={serializedActivity}
            createdById={task.createdBy?._id?.toString()}
            assigneeId={task.assignee?._id?.toString()}
          />
        </div>
      </div>
    </div>
  );
}

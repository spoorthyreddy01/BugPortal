import { notFound } from "next/navigation";
import { getIssueById, getIssueActivity } from "@/services/issueService";
import { listAttachmentsByIssue } from "@/services/attachmentService";
import { listCommentsByIssue } from "@/services/commentService";
import PriorityBadge from "@/components/issues/PriorityBadge";
import StatusBadge from "@/components/issues/StatusBadge";
import IssueWorkflowPanel from "@/components/issues/IssueWorkflowPanel";
import ActivityTimeline from "@/components/issues/ActivityTimeline";
import AttachmentList from "@/components/issues/AttachmentList";
import CommentList from "@/components/comments/CommentList";
import CommentForm from "@/components/comments/CommentForm";

export default async function IssueDetailPage({ params }) {
  const { id } = await params;
  const [issue, activity, attachments, comments] = await Promise.all([
    getIssueById(id),
    getIssueActivity(id),
    listAttachmentsByIssue(id),
    listCommentsByIssue(id),
  ]);
  if (!issue) notFound();

  const serializedIssue = JSON.parse(JSON.stringify(issue));
  const serializedActivity = JSON.parse(JSON.stringify(activity));
  const serializedAttachments = JSON.parse(JSON.stringify(attachments));
  const serializedComments = JSON.parse(JSON.stringify(comments));

  return (
    <div className="w-full max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {issue.project?.name}
            {issue.module ? ` · ${issue.module}` : ""}
          </p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {issue.title}
            </h1>
            <div className="flex shrink-0 gap-2">
              <PriorityBadge priority={issue.priority} />
              <StatusBadge status={issue.status} />
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Reported by {issue.reporter?.name || issue.reporter?.email} ·{" "}
            {new Date(issue.createdAt).toLocaleDateString()}
          </p>
        </div>

        <IssueWorkflowPanel issue={serializedIssue} />

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Description
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {(issue.expectedResult || issue.actualResult) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {issue.expectedResult && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Expected Result
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {issue.expectedResult}
                </p>
              </div>
            )}
            {issue.actualResult && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Actual Result
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {issue.actualResult}
                </p>
              </div>
            )}
          </div>
        )}

        {(issue.browser || issue.operatingSystem || issue.appVersion) && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Environment
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {issue.browser && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    Browser
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">
                    {issue.browser}
                  </dd>
                </div>
              )}
              {issue.operatingSystem && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    Operating System
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">
                    {issue.operatingSystem}
                  </dd>
                </div>
              )}
              {issue.appVersion && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    App Version
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">
                    {issue.appVersion}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            Attachments
          </h2>
          <AttachmentList attachments={serializedAttachments} />
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Comments
          </h2>
          <CommentList comments={serializedComments} />
          <CommentForm issueId={issue._id.toString()} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Activity Timeline
          </h2>
          <ActivityTimeline activity={serializedActivity} />
        </div>
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getIssueById } from "@/services/issueService";
import { ROLES } from "@/config/constants";
import IssueForm from "@/components/issues/IssueForm";

export default async function EditIssuePage({ params }) {
  const { id } = await params;
  const session = await auth();
  const issue = await getIssueById(id);
  if (!issue) notFound();

  const isReporter = issue.reporter?._id?.toString() === session.user.id;
  const isAdmin = session.user.role === ROLES.ADMIN;
  if (!isReporter && !isAdmin) redirect(`/issues/${id}`);

  await connectDB();
  const projects = await Project.find({ isArchived: false })
    .sort({ name: 1 })
    .lean();

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Edit Issue
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Fix a mistake or add detail — the reporter (or an admin) can update
        this issue at any time.
      </p>
      <IssueForm
        projects={JSON.parse(JSON.stringify(projects))}
        issue={JSON.parse(JSON.stringify(issue))}
      />
    </div>
  );
}

import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import IssueForm from "@/components/issues/IssueForm";

export default async function NewIssuePage() {
  await connectDB();
  const projects = await Project.find({ isArchived: false })
    .sort({ name: 1 })
    .lean();

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Report an Issue
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Give as much detail as you can — it helps developers fix it faster.
      </p>
      <IssueForm projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { listIssues } from "@/services/issueService";
import IssueFilters from "@/components/issues/IssueFilters";
import IssueList from "@/components/issues/IssueList";
import Pagination from "@/components/shared/Pagination";
import { ROLES, USER_STATUS } from "@/config/constants";

export default async function MyIssuesPage({ searchParams }) {
  const session = await auth();
  const sp = await searchParams;
  const params = {
    q: sp.q || "",
    project: sp.project || "",
    status: sp.status || "",
    priority: sp.priority || "",
    workingDeveloper: sp.workingDeveloper || "",
    sort: sp.sort || "-createdAt",
    page: Number(sp.page || 1),
    reporter: session.user.id,
  };

  await connectDB();
  const [projects, developers, { issues, total, page, pages }] =
    await Promise.all([
      Project.find({ isArchived: false }).sort({ name: 1 }).lean(),
      User.find({
        role: { $in: [ROLES.DEVELOPER, ROLES.ADMIN] },
        status: USER_STATUS.ACTIVE,
      })
        .sort({ name: 1 })
        .lean(),
      listIssues(params),
    ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            My Reported Issues
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {total} issue{total !== 1 ? "s" : ""} reported by you
          </p>
        </div>
        <Link
          href="/issues/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Report Issue
        </Link>
      </div>

      <IssueFilters
        projects={JSON.parse(JSON.stringify(projects))}
        developers={JSON.parse(JSON.stringify(developers))}
        current={params}
      />

      <IssueList issues={issues} />

      <Pagination page={page} pages={pages} />
    </div>
  );
}

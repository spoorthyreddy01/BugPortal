import { auth } from "@/lib/auth";
import { listProjectsWithCounts } from "@/services/projectService";
import ProjectsList from "@/components/projects/ProjectsList";
import { ROLES } from "@/config/constants";

export default async function ProjectsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Admins can see (and restore) archived projects; everyone else only
  // sees active ones — matches the issue-creation dropdown, which already
  // excludes archived projects.
  const projects = await listProjectsWithCounts({ includeArchived: isAdmin });

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Projects
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ProjectsList initialProjects={JSON.parse(JSON.stringify(projects))} />
    </div>
  );
}

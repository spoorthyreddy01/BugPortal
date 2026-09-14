import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { listTasksForBoard, listTasks } from "@/services/taskService";
import TaskToolbar from "@/components/tasks/TaskToolbar";
import TaskBoard from "@/components/tasks/TaskBoard";
import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";
import Pagination from "@/components/shared/Pagination";
import { USER_STATUS } from "@/config/constants";

export default async function TasksPage({ searchParams }) {
  const sp = await searchParams;
  const view = sp.view === "list" ? "list" : "board";
  const filters = {
    project: sp.project || "",
    priority: sp.priority || "",
    assignee: sp.assignee || "",
  };

  await connectDB();
  const [projects, members] = await Promise.all([
    Project.find({ isArchived: false }).sort({ name: 1 }).lean(),
    User.find({ status: USER_STATUS.ACTIVE }).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Plan, assign, and track work
          </p>
        </div>
        <TaskToolbar
          projects={JSON.parse(JSON.stringify(projects))}
          members={JSON.parse(JSON.stringify(members))}
          view={view}
        />
      </div>

      <TaskFilters
        projects={JSON.parse(JSON.stringify(projects))}
        members={JSON.parse(JSON.stringify(members))}
        current={filters}
      />

      {view === "board" ? (
        <BoardView filters={filters} />
      ) : (
        <ListView filters={filters} page={Number(sp.page || 1)} />
      )}
    </div>
  );
}

async function BoardView({ filters }) {
  const board = await listTasksForBoard(filters);
  // TaskBoard seeds its state from this prop via useState, which only reads
  // the initial value on mount — a key tied to the filters forces a remount
  // (and a fresh useState seed) whenever the filters actually change, since
  // otherwise the already-mounted board would keep showing stale data.
  return (
    <TaskBoard
      key={JSON.stringify(filters)}
      initialBoard={JSON.parse(JSON.stringify(board))}
    />
  );
}

async function ListView({ filters, page }) {
  const { tasks, pages } = await listTasks({ ...filters, page, limit: 50 });
  return (
    <>
      <TaskList key={JSON.stringify({ filters, page })} tasks={JSON.parse(JSON.stringify(tasks))} />
      <Pagination page={page} pages={pages} />
    </>
  );
}

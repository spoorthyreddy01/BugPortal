import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { listTasks } from "@/services/taskService";
import TaskList from "@/components/tasks/TaskList";
import Pagination from "@/components/shared/Pagination";

export default async function MyTasksPage({ searchParams }) {
  const session = await auth();
  const sp = await searchParams;
  const page = Number(sp.page || 1);

  await connectDB();
  const { tasks, total, pages } = await listTasks({
    assignee: session.user.id,
    page,
    limit: 50,
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My Tasks
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {total} task{total !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      <TaskList tasks={JSON.parse(JSON.stringify(tasks))} />

      <Pagination page={page} pages={pages} />
    </div>
  );
}

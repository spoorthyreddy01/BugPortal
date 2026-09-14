import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { getTaskById } from "@/services/taskService";
import { ROLES, USER_STATUS } from "@/config/constants";
import TaskForm from "@/components/tasks/TaskForm";

export default async function EditTaskPage({ params }) {
  const { id } = await params;
  const session = await auth();
  const task = await getTaskById(id);
  if (!task) notFound();

  const isCreator = task.createdBy?._id?.toString() === session.user.id;
  const isAssignee = task.assignee?._id?.toString() === session.user.id;
  const isAdmin = session.user.role === ROLES.ADMIN;
  if (!isCreator && !isAssignee && !isAdmin) redirect(`/tasks/${id}`);

  await connectDB();
  const [projects, members] = await Promise.all([
    Project.find({ isArchived: false }).sort({ name: 1 }).lean(),
    User.find({ status: USER_STATUS.ACTIVE }).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Edit Task
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        The creator, assignee, or an admin can update this task.
      </p>
      <TaskForm
        projects={JSON.parse(JSON.stringify(projects))}
        members={JSON.parse(JSON.stringify(members))}
        task={JSON.parse(JSON.stringify(task))}
      />
    </div>
  );
}

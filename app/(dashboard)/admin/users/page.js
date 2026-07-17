import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UsersTable from "@/components/admin/UsersTable";

function serialize(user) {
  return {
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString() ?? null,
    updatedAt: user.updatedAt?.toISOString() ?? null,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
  };
}

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Users
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Manage who can access Bug Portal. Only active users can sign in.
      </p>
      <UsersTable initialUsers={users.map(serialize)} />
    </div>
  );
}

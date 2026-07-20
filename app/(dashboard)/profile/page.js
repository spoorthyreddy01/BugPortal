import Image from "next/image";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/userService";
import AccountRemovedNotice from "@/components/auth/AccountRemovedNotice";
import { Inbox, CheckCircle2, ListTodo } from "lucide-react";

const ROLE_LABELS = { admin: "Admin", developer: "Developer", reporter: "Reporter" };

export default async function ProfilePage() {
  const session = await auth();

  let profile;
  try {
    profile = await getUserProfile(session.user.id);
  } catch (err) {
    if (err.status === 404) {
      return <AccountRemovedNotice />;
    }
    throw err;
  }

  const { user, reportedCount, resolvedCount, activeCount } = profile;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your account details and activity.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-medium text-zinc-600 dark:text-zinc-300">
            {(user.name || user.email)[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {user.name || "—"}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
          <span className="mt-1 inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-2">
          <Inbox className="h-4 w-4 text-zinc-400" />
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {reportedCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Issues Reported
          </span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-2">
          <CheckCircle2 className="h-4 w-4 text-zinc-400" />
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {resolvedCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Issues Resolved
          </span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-2">
          <ListTodo className="h-4 w-4 text-zinc-400" />
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {activeCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Currently Working On
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Account
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              Last Login
            </dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "Never"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              Member Since
            </dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {new Date(user.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
          Name, email, and photo are managed by your Google account. Role is
          managed by an administrator.
        </p>
      </div>
    </div>
  );
}

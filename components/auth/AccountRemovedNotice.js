"use client";

import { signOut } from "next-auth/react";

export default function AccountRemovedNotice() {
  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center flex flex-col items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Your account is no longer available
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your account may have been removed or deactivated by an
          administrator. Please sign out and, if this is unexpected, contact
          an admin.
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Access Not Authorized
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Your account has not been authorized to access this platform. Please
        contact the administrator.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4"
      >
        Back to login
      </Link>
    </div>
  );
}

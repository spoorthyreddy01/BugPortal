"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const { count } = useUnreadNotificationCount();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6">
      <div className="md:hidden text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Bug Portal
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <ThemeToggle />

        <Link
          href="/notifications"
          className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {user?.image ? (
            <Image
              src={user.image}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {user?.name || user?.email}
          </span>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Bug,
  ListChecks,
  ClipboardList,
  FolderKanban,
  Bell,
  UserCircle,
  Settings,
  Users,
  BarChart3,
  Activity,
  X,
} from "lucide-react";
import { ROLES } from "@/config/constants";

const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.DEVELOPER]: "Developer",
  [ROLES.REPORTER]: "Reporter",
};

const ROLE_BADGE_STYLES = {
  [ROLES.ADMIN]:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  [ROLES.DEVELOPER]:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  [ROLES.REPORTER]:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: Bug },
  { href: "/my-issues", label: "My Reported Issues", icon: ListChecks },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV_ITEMS = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/team-activity", label: "Team Activity", icon: Activity },
];

function NavLink({ item, pathname }) {
  const Icon = item.icon;
  const active =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ isOpen = false, onClose } = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-transform duration-300 ease-in-out md:static md:z-auto md:w-60 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-2 py-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
              <Bug className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Bug Portal
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
              Admin
            </div>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      {user && (
        <div className="flex items-center gap-3 border-t border-zinc-200 dark:border-zinc-800 px-2 pt-4">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {(user.name || user.email)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {user.name || user.email}
            </p>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES[ROLES.REPORTER]
              }`}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      )}
      </aside>
    </>
  );
}

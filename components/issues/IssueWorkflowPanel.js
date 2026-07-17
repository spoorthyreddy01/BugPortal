"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Play, Square, CheckCircle2, RotateCcw } from "lucide-react";
import { ROLES, ISSUE_STATUS } from "@/config/constants";

const ACTION_SUCCESS_MESSAGES = {
  "start-working": "You started working on this issue",
  "stop-working": "You stopped working on this issue",
  resolve: "Issue marked as resolved",
  reopen: "Issue reopened",
};

function Avatar({ user }) {
  if (user?.image) {
    return (
      <Image
        src={user.image}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full"
      />
    );
  }
  return (
    <div className="h-7 w-7 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
      {(user?.name || user?.email || "?")[0]?.toUpperCase()}
    </div>
  );
}

function ActionButton({ children, onClick, loading, icon: Icon, variant = "solid" }) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50";
  const solid =
    "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90";
  const outline =
    "border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variant === "outline" ? outline : solid}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

export default function IssueWorkflowPanel({ issue }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user;
  const isDeveloperRole =
    !!user && [ROLES.DEVELOPER, ROLES.ADMIN].includes(user.role);
  const isCurrentDeveloper =
    !!issue.currentDeveloper &&
    !!user &&
    issue.currentDeveloper._id === user.id;
  const isReporter = !!user && issue.reporter?._id === user.id;
  const isAdmin = user?.role === ROLES.ADMIN;

  const canStartWorking =
    isDeveloperRole &&
    !issue.currentDeveloper &&
    ![ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(issue.status);
  const canStopWorking = isCurrentDeveloper;
  const canResolve =
    (isCurrentDeveloper || isAdmin) && issue.status !== ISSUE_STATUS.RESOLVED;
  const canReopen =
    [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(issue.status) &&
    (isReporter || isCurrentDeveloper || isAdmin);

  const callAction = async (action) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`/api/issues/${issue._id}/${action}`);
      toast.success(ACTION_SUCCESS_MESSAGES[action] || "Done");
      router.refresh();
    } catch (err) {
      const message = err.response?.data?.error || "Action failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {issue.currentDeveloper && issue.status !== ISSUE_STATUS.RESOLVED && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
          <Avatar user={issue.currentDeveloper} />
          <div className="text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-300">
              {issue.currentDeveloper.name || issue.currentDeveloper.email} is
              currently working on this issue.
            </p>
            {issue.startedWorkingAt && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Started{" "}
                {formatDistanceToNow(new Date(issue.startedWorkingAt), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {issue.status === ISSUE_STATUS.RESOLVED && issue.currentDeveloper && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <Avatar user={issue.currentDeveloper} />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-300">
              Resolved by{" "}
              {issue.currentDeveloper.name || issue.currentDeveloper.email}
            </p>
            {issue.resolvedAt && (
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Resolved{" "}
                {formatDistanceToNow(new Date(issue.resolvedAt), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {!issue.currentDeveloper && issue.status === ISSUE_STATUS.OPEN && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Working by: Nobody yet
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {canStartWorking && (
          <ActionButton
            onClick={() => callAction("start-working")}
            loading={loading}
            icon={Play}
          >
            Start Working
          </ActionButton>
        )}
        {canStopWorking && (
          <ActionButton
            onClick={() => callAction("stop-working")}
            loading={loading}
            icon={Square}
            variant="outline"
          >
            Stop Working
          </ActionButton>
        )}
        {canResolve && (
          <ActionButton
            onClick={() => callAction("resolve")}
            loading={loading}
            icon={CheckCircle2}
          >
            Mark as Resolved
          </ActionButton>
        )}
        {canReopen && (
          <ActionButton
            onClick={() => callAction("reopen")}
            loading={loading}
            icon={RotateCcw}
            variant="outline"
          >
            Reopen Issue
          </ActionButton>
        )}
      </div>
    </div>
  );
}

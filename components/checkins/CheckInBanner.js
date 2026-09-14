"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { CalendarCheck, LogOut, CheckCircle2 } from "lucide-react";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";
import { ROLES } from "@/config/constants";

export default function CheckInBanner() {
  const { data: session, status } = useSession();
  const [state, setState] = useState(undefined);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const user = session?.user;
  const eligible =
    !!user && [ROLES.DEVELOPER, ROLES.ADMIN].includes(user.role);

  const refresh = () => {
    axios
      .get("/api/checkins")
      .then(({ data }) => setState({ activeTask: data.activeTask, checkIn: data.checkIn }))
      .catch(() => setState(null));
  };

  useEffect(() => {
    if (!eligible) return;
    refresh();
  }, [eligible]);

  if (status !== "authenticated" || !eligible || state === undefined) {
    return null;
  }

  const { activeTask, checkIn } = state || {};

  if (!checkIn) {
    return (
      <>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-5 w-5 text-zinc-400" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {activeTask
                ? `You haven't checked in today — continue "${activeTask.title}"?`
                : "You haven't checked in today — what are you working on?"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCheckIn(true)}
            className="shrink-0 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
          >
            Check In
          </button>
        </div>
        {showCheckIn && (
          <CheckInModal
            activeTask={activeTask}
            onClose={() => setShowCheckIn(false)}
            onCheckedIn={(record) => {
              setState({ activeTask, checkIn: record });
              setShowCheckIn(false);
            }}
          />
        )}
      </>
    );
  }

  if (!checkIn.checkedOutAt) {
    return (
      <>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Working on: <span className="font-medium">{checkIn.task?.title}</span>
              {checkIn.carriedOver && (
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                  (carried over)
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCheckOut(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
        {showCheckOut && (
          <CheckOutModal
            checkIn={checkIn}
            onClose={() => setShowCheckOut(false)}
            onCheckedOut={(record) => {
              setState({ activeTask, checkIn: record });
              setShowCheckOut(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You&apos;re checked out for today. See you tomorrow.
      </p>
    </div>
  );
}

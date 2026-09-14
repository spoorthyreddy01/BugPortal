"use client";

import { useState } from "react";
import axios from "axios";

// The moment a developer's one active task is marked Done, this checks
// whether they now have zero active tasks — if so, the check-in modal
// should reopen immediately to force declaring what's next, per the
// one-task-at-a-time rule. Call `checkAfterDone` right after any action
// that might move a task to "done".
export function usePostCompletionCheckIn() {
  const [visible, setVisible] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const checkAfterDone = async (assigneeId, currentUserId) => {
    if (!assigneeId || !currentUserId || assigneeId !== currentUserId) return;
    try {
      const { data } = await axios.get("/api/checkins");
      if (!data.activeTask) {
        setActiveTask(null);
        setVisible(true);
      }
    } catch {
      // Best-effort — worst case they see the dashboard banner instead.
    }
  };

  return {
    checkAfterDone,
    promptVisible: visible,
    promptActiveTask: activeTask,
    closePrompt: () => setVisible(false),
  };
}

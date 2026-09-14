import {
  Inbox,
  CircleDot,
  ListTodo,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users as UsersIcon,
  CalendarClock,
} from "lucide-react";
import {
  getSummaryCounts,
  getIssuesByProject,
  getIssuesByStatus,
  getIssuesByPriority,
  getRecentIssues,
  getRecentActivity,
} from "@/services/dashboardService";
import {
  getTaskSummaryCounts,
  getTasksByStatus,
  getTasksByPriority,
  getRecentTasks,
} from "@/services/taskService";
import StatCard from "@/components/dashboard/StatCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import RecentIssuesList from "@/components/dashboard/RecentIssuesList";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import RecentTasksList from "@/components/dashboard/RecentTasksList";
import CheckInBanner from "@/components/checkins/CheckInBanner";
import {
  STATUS_LABELS,
  STATUS_CHART_COLORS,
  PRIORITY_LABELS,
  PRIORITY_CHART_COLORS,
  SEQUENTIAL_CHART_COLOR,
  TASK_STATUS_LABELS,
  TASK_STATUS_CHART_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_CHART_COLORS,
} from "@/utils/chartColors";

export default async function DashboardPage() {
  const [
    counts,
    byProject,
    byStatus,
    byPriority,
    recentIssues,
    recentActivity,
    taskCounts,
    taskByStatus,
    taskByPriority,
    recentTasks,
  ] = await Promise.all([
    getSummaryCounts(),
    getIssuesByProject(),
    getIssuesByStatus(),
    getIssuesByPriority(),
    getRecentIssues(),
    getRecentActivity(),
    getTaskSummaryCounts(),
    getTasksByStatus(),
    getTasksByPriority(),
    getRecentTasks(),
  ]);

  const taskStatusChartData = taskByStatus.map((s) => ({
    label: TASK_STATUS_LABELS[s.status],
    value: s.value,
    color: TASK_STATUS_CHART_COLORS[s.status],
  }));

  const taskPriorityChartData = taskByPriority.map((p) => ({
    label: TASK_PRIORITY_LABELS[p.priority],
    value: p.value,
    color: TASK_PRIORITY_CHART_COLORS[p.priority],
  }));

  const statusChartData = byStatus.map((s) => ({
    label: STATUS_LABELS[s.status],
    value: s.value,
    color: STATUS_CHART_COLORS[s.status],
  }));

  const priorityChartData = byPriority.map((p) => ({
    label: PRIORITY_LABELS[p.priority],
    value: p.value,
    color: PRIORITY_CHART_COLORS[p.priority],
  }));

  const projectChartData = byProject.map((p) => ({
    label: p.label,
    value: p.value,
    color: SEQUENTIAL_CHART_COLOR,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Overview of everything happening across Fix4Ever projects.
        </p>
      </div>

      <CheckInBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Issues" value={counts.total} icon={Inbox} />
        <StatCard label="Open Issues" value={counts.open} icon={CircleDot} />
        <StatCard
          label="In Progress"
          value={counts.inProgress}
          icon={ListTodo}
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={CheckCircle2}
        />
        <StatCard label="Closed" value={counts.closed} icon={XCircle} />
        <StatCard
          label="Critical Issues"
          value={counts.critical}
          icon={AlertTriangle}
          tone="critical"
        />
        <StatCard
          label="Available Issues"
          value={counts.available}
          icon={Inbox}
        />
        <StatCard
          label="Being Worked On"
          value={counts.beingWorked}
          icon={UsersIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Issues
          </h2>
          <RecentIssuesList issues={recentIssues} />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Activity
          </h2>
          <RecentActivityList activity={recentActivity} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Issues by Project
          </h2>
          <HorizontalBarChart
            data={projectChartData}
            emptyLabel="No issues reported yet"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Issues by Status
          </h2>
          <HorizontalBarChart
            data={statusChartData}
            emptyLabel="No issues reported yet"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Issues by Priority
          </h2>
          <HorizontalBarChart
            data={priorityChartData}
            emptyLabel="No issues reported yet"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tasks
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={taskCounts.total} icon={ListTodo} />
        <StatCard label="To Do" value={taskCounts.todo} icon={Inbox} />
        <StatCard
          label="In Progress"
          value={taskCounts.inProgress}
          icon={CircleDot}
        />
        <StatCard
          label="Due Soon"
          value={taskCounts.dueSoon}
          icon={CalendarClock}
          tone="critical"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Tasks by Status
          </h2>
          <HorizontalBarChart
            data={taskStatusChartData}
            emptyLabel="No tasks yet"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Tasks by Priority
          </h2>
          <HorizontalBarChart
            data={taskPriorityChartData}
            emptyLabel="No tasks yet"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Tasks
          </h2>
          <RecentTasksList tasks={JSON.parse(JSON.stringify(recentTasks))} />
        </div>
      </div>
    </div>
  );
}

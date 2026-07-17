import { Clock, RotateCcw, CheckCircle2 } from "lucide-react";
import {
  getResolutionMetrics,
  getReopenRate,
  getDeveloperPerformance,
  getIssuesTrend,
} from "@/services/analyticsService";
import StatCard from "@/components/dashboard/StatCard";
import TrendChart from "@/components/admin/TrendChart";

export default async function AnalyticsPage() {
  const [resolution, reopen, developers, trend] = await Promise.all([
    getResolutionMetrics(),
    getReopenRate(),
    getDeveloperPerformance(),
    getIssuesTrend(14),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Team performance and issue trends across all projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Avg Resolution Time"
          value={`${resolution.avgResolutionHours}h`}
          icon={Clock}
        />
        <StatCard
          label="Issues Resolved"
          value={resolution.resolvedCount}
          icon={CheckCircle2}
        />
        <StatCard
          label="Reopen Rate"
          value={`${reopen.rate}%`}
          icon={RotateCcw}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Issues Created vs Resolved (last 14 days)
        </h2>
        <TrendChart data={trend} />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Developer Performance
        </h2>
        {developers.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No active developers yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2 font-medium">Developer</th>
                  <th className="pb-2 font-medium">Resolved</th>
                  <th className="pb-2 font-medium">Currently Working On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {developers.map((dev) => (
                  <tr key={dev._id}>
                    <td className="py-2.5 text-zinc-800 dark:text-zinc-200">
                      {dev.name || dev.email}
                    </td>
                    <td className="py-2.5 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {dev.resolvedCount}
                    </td>
                    <td className="py-2.5 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {dev.activeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

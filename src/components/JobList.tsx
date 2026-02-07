"use client";

import type { CronJob } from "@/lib/types";

interface JobListProps {
  jobs: CronJob[];
}

function formatSchedule(job: CronJob): string {
  if (job.scheduleKind === "cron" && job.scheduleExpr) {
    return `${job.scheduleExpr} (${job.timezone || "UTC"})`;
  }
  if (job.scheduleKind === "every" && job.everyMs) {
    const hours = Math.floor(job.everyMs / (1000 * 60 * 60));
    const minutes = Math.floor((job.everyMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Every ${hours}h`;
    return `Every ${minutes}m`;
  }
  if (job.scheduleKind === "once" && job.onceAtMs) {
    return `Once at ${new Date(job.onceAtMs).toLocaleString()}`;
  }
  return "Unknown";
}

export function JobList({ jobs }: JobListProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">All Jobs ({jobs.length})</h3>
      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`p-3 rounded bg-gray-800 border-l-2 ${
              job.enabled ? "border-green-500" : "border-gray-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    job.lastStatus === "ok"
                      ? "bg-green-400"
                      : job.lastStatus === "error"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                />
                <span className="font-medium text-white">{job.name}</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  job.enabled ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"
                }`}
              >
                {job.enabled ? "enabled" : "disabled"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatSchedule(job)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

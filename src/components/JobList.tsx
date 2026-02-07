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
  const enabledCount = jobs.filter((j) => j.enabled).length;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-[13px] font-semibold text-white">Scheduled Jobs</h3>
        </div>
        <span className="text-[10px] font-medium text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
          {enabledCount}/{jobs.length} active
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {jobs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <svg className="w-8 h-8 text-gray-700 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-xs text-gray-600">No jobs configured</p>
            <p className="text-[10px] text-gray-700 mt-1">Connect to Caesar gateway to see jobs</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="px-4 py-3 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      job.lastStatus === "ok"
                        ? "bg-emerald-400"
                        : job.lastStatus === "error"
                        ? "bg-rose-400"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-[13px] font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                    {job.name}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                    job.enabled
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
                  }`}
                >
                  {job.enabled ? "active" : "paused"}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1 font-mono pl-3.5">
                {formatSchedule(job)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

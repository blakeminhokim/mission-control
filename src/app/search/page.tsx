"use client";

import { useState, useEffect, useMemo } from "react";
import type { CronJob } from "@/lib/types";

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
  return "Unknown schedule";
}

type FilterType = "all" | "cron" | "every" | "once";
type FilterStatus = "all" | "ok" | "error" | "pending";

export default function SearchPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/cron");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setJobs(data.jobs || []);
        }
      } catch {
        setError("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (query && !job.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (typeFilter !== "all" && job.scheduleKind !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        const jobStatus = job.lastStatus || "pending";
        if (statusFilter !== jobStatus) return false;
      }
      return true;
    });
  }, [jobs, query, typeFilter, statusFilter]);

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "cron", label: "Cron" },
    { value: "every", label: "Interval" },
    { value: "once", label: "One-shot" },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All Status" },
    { value: "ok", label: "Healthy" },
    { value: "error", label: "Error" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <div className="flex flex-col h-full pb-16 lg:pb-0">
      <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-5 max-w-[1100px] mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-white">Search</h1>
          <p className="text-xs text-gray-500 mt-0.5">Find and filter scheduled jobs</p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-500 hover:text-gray-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 items-center">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider mr-1">Type</span>
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    typeFilter === opt.value
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-white/[0.06] self-center mx-1" />
            <div className="flex gap-1 items-center">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider mr-1">Status</span>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    statusFilter === opt.value
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl animate-shimmer h-[80px]" />
            ))}
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="text-[11px] text-gray-500">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
              {(query || typeFilter !== "all" || statusFilter !== "all") && " matching filters"}
            </div>

            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  {jobs.length === 0 ? "No jobs found" : "No matching jobs"}
                </h3>
                <p className="text-xs text-gray-600 text-center max-w-xs">
                  {jobs.length === 0
                    ? "Connect to the Caesar gateway to see scheduled jobs."
                    : "Try adjusting your search query or filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            job.lastStatus === "ok"
                              ? "bg-emerald-400"
                              : job.lastStatus === "error"
                              ? "bg-rose-400"
                              : "bg-gray-500"
                          }`}
                        />
                        <div>
                          <h3 className="text-[13px] font-medium text-gray-200 group-hover:text-white transition-colors">
                            {job.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {formatSchedule(job)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            job.scheduleKind === "cron"
                              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                              : job.scheduleKind === "every"
                              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {job.scheduleKind}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            job.enabled
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
                          }`}
                        >
                          {job.enabled ? "active" : "paused"}
                        </span>
                      </div>
                    </div>
                    {job.lastError && (
                      <div className="mt-2.5 ml-4.5 text-[11px] font-mono text-rose-400/80 bg-rose-500/10 border border-rose-500/15 rounded-lg px-2.5 py-1.5 truncate">
                        {job.lastError}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

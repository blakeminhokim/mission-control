"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "../components/Calendar";
import { JobList } from "../components/JobList";
import { TokenTracker } from "../components/TokenTracker";
import type { CronJob } from "../lib/types";

export default function Home() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      setError("Failed to fetch cron jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="flex flex-col h-full pb-16 lg:pb-0">
      <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-5 max-w-[1400px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Monitor Caesar&apos;s scheduled tasks and usage</p>
          </div>
          <div className="text-[11px] text-gray-500 font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Stats Row */}
        <TokenTracker />

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-fade-in">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-rose-300">{error}</p>
              <p className="text-[10px] text-rose-400/60 mt-0.5">Check that OPENCLAW_GATEWAY_URL is set correctly in Railway variables</p>
            </div>
            <button
              onClick={fetchJobs}
              className="text-[10px] font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content: Calendar + Job List */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-0">
          {/* Calendar */}
          <div className="flex-1 min-h-[400px]">
            <Calendar jobs={jobs} loading={loading} onRefresh={fetchJobs} />
          </div>

          {/* Job List - side panel on desktop, below on mobile */}
          <div className="lg:w-80 flex-shrink-0">
            <JobList jobs={jobs} />
          </div>
        </div>
      </div>
    </div>
  );
}

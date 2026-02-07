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
  const [showJobList, setShowJobList] = useState(false);

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
    <div className="flex flex-col lg:flex-row h-full pb-16 lg:pb-0">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Token Tracker - prominent on mobile */}
        <TokenTracker />

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Mobile: Toggle job list */}
        <button
          onClick={() => setShowJobList(!showJobList)}
          className="lg:hidden flex items-center justify-between bg-gray-900 rounded-lg p-4"
        >
          <span className="font-medium">
            Scheduled Jobs ({jobs.length})
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showJobList ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile: Collapsible job list */}
        {showJobList && (
          <div className="lg:hidden bg-gray-900 rounded-lg p-4">
            <JobList jobs={jobs} />
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1 min-h-[400px]">
          <Calendar jobs={jobs} loading={loading} onRefresh={fetchJobs} />
        </div>
      </div>

      {/* Desktop: Right Sidebar - Job List */}
      <div className="hidden lg:block w-80 border-l border-gray-800 p-4 overflow-y-auto">
        <JobList jobs={jobs} />
      </div>
    </div>
  );
}

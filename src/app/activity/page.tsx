"use client";

import { useState, useEffect } from "react";

interface Session {
  id: string;
  createdAt?: number;
  updatedAt?: number;
  status: string;
  model?: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  messageCount: number;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}

function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setSessions(data.sessions || []);
        }
      } catch {
        setError("Failed to fetch activity data");
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0);
  const totalCost = sessions.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="flex flex-col h-full pb-16 lg:pb-0">
      <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-5 max-w-[1100px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Activity</h1>
            <p className="text-xs text-gray-500 mt-0.5">Recent sessions and token usage history</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Tokens</div>
              <div className="text-sm font-bold text-indigo-300 font-mono">{formatTokens(totalTokens)}</div>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Cost</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">${totalCost.toFixed(4)}</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-fade-in">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl animate-shimmer h-[72px]" />
            ))}
          </div>
        ) : sessions.length === 0 && !error ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">No activity yet</h3>
            <p className="text-xs text-gray-600 text-center max-w-xs">
              Sessions will appear here once Caesar starts processing requests through the gateway.
            </p>
          </div>
        ) : (
          /* Session List */
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Session</div>
              <div className="col-span-2 text-right">Tokens</div>
              <div className="col-span-2 text-right">Cost</div>
              <div className="col-span-2 text-right">Messages</div>
              <div className="col-span-2 text-right">Time</div>
            </div>

            {/* Session Rows */}
            {sessions.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group items-center"
              >
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      session.status === "completed" || session.status === "ok"
                        ? "bg-emerald-400"
                        : session.status === "error" || session.status === "failed"
                        ? "bg-rose-400"
                        : session.status === "running" || session.status === "active"
                        ? "bg-indigo-400 animate-pulse-dot"
                        : "bg-gray-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] text-gray-200 font-mono truncate group-hover:text-white transition-colors">
                      {session.id.slice(0, 12)}...
                    </div>
                    {session.model && (
                      <div className="text-[10px] text-gray-600">{session.model}</div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[13px] font-mono text-indigo-300">
                    {formatTokens(session.totalTokens)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[13px] font-mono text-emerald-300">
                    ${session.cost.toFixed(4)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[13px] text-gray-400">
                    {session.messageCount}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[11px] text-gray-500">
                    {session.createdAt ? timeAgo(session.createdAt) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

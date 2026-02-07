"use client";

import { useState, useEffect } from "react";

interface Usage {
  todayTokens: number;
  todayCost: number;
  sessions: number;
}

export function TokenTracker() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        if (!data.error) {
          setUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-800 rounded w-32"></div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Token Usage
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatTokens(usage.todayTokens)}
          </div>
          <div className="text-xs text-gray-500">tokens</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatCost(usage.todayCost)}
          </div>
          <div className="text-xs text-gray-500">cost</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">
            {usage.sessions}
          </div>
          <div className="text-xs text-gray-500">sessions</div>
        </div>
      </div>
    </div>
  );
}

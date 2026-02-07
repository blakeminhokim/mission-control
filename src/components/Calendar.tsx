"use client";

import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  addHours,
  isToday,
} from "date-fns";
import type { CronJob, CalendarEvent } from "@/lib/types";

// Parse cron expression to get next occurrences in a date range
function parseCronToEvents(job: CronJob, weekStart: Date, weekEnd: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (job.scheduleKind === "cron" && job.scheduleExpr) {
    // Simple cron parsing for common patterns
    // Format: minute hour day month weekday
    const parts = job.scheduleExpr.split(" ");
    if (parts.length >= 5) {
      const [minute, hour, , , weekday] = parts;
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      for (const day of days) {
        // Check if this day matches the cron weekday (0 = Sunday)
        const dayOfWeek = day.getDay();
        if (weekday === "*" || parseInt(weekday) === dayOfWeek) {
          const eventDate = new Date(day);
          eventDate.setHours(parseInt(hour) || 0, parseInt(minute) || 0, 0, 0);

          events.push({
            id: `${job.id}-${eventDate.getTime()}`,
            title: job.name,
            start: eventDate,
            end: addHours(eventDate, 1),
            type: "scheduled",
            status: job.lastStatus === "error" ? "error" : job.lastStatus === "ok" ? "ok" : "pending",
            job,
          });
        }
      }
    }
  } else if (job.scheduleKind === "every" && job.everyMs) {
    // Interval-based job - show next run if within week
    if (job.nextRunAtMs) {
      const nextRun = new Date(job.nextRunAtMs);
      if (nextRun >= weekStart && nextRun <= weekEnd) {
        events.push({
          id: `${job.id}-${nextRun.getTime()}`,
          title: `${job.name} (every ${formatInterval(job.everyMs)})`,
          start: nextRun,
          end: addHours(nextRun, 1),
          type: "interval",
          status: job.lastStatus === "error" ? "error" : job.lastStatus === "ok" ? "ok" : "pending",
          job,
        });
      }
    }
  } else if (job.scheduleKind === "once" && job.onceAtMs) {
    const onceDate = new Date(job.onceAtMs);
    if (onceDate >= weekStart && onceDate <= weekEnd) {
      events.push({
        id: `${job.id}-${onceDate.getTime()}`,
        title: job.name,
        start: onceDate,
        end: addHours(onceDate, 1),
        type: "oneshot",
        status: job.lastStatus === "error" ? "error" : job.lastStatus === "ok" ? "ok" : "pending",
        job,
      });
    }
  }

  return events;
}

function formatInterval(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

interface CalendarProps {
  jobs: CronJob[];
  loading: boolean;
  onRefresh: () => void;
}

export function Calendar({ jobs, loading, onRefresh }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate events from jobs
  const events = useMemo(() => {
    return jobs.flatMap((job) => parseCronToEvents(job, weekStart, weekEnd));
  }, [jobs, weekStart, weekEnd]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(event.start, "yyyy-MM-dd");
      const existing = map.get(key) || [];
      map.set(key, [...existing, event]);
    }
    return map;
  }, [events]);

  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPrevWeek}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            >
              ← Prev
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            >
              Next →
            </button>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⟳</span> Loading...
            </>
          ) : (
            <>↻ Refresh</>
          )}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-gray-700">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(dayKey) || [];
          const today = isToday(day);

          return (
            <div
              key={dayKey}
              className={`flex flex-col bg-gray-800 min-h-[200px] ${
                today ? "ring-2 ring-blue-500 ring-inset" : ""
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-2 text-center border-b border-gray-700 ${
                  today ? "bg-blue-900/50" : ""
                }`}
              >
                <div className="text-xs text-gray-400">{format(day, "EEE")}</div>
                <div
                  className={`text-lg font-medium ${
                    today ? "text-blue-400" : "text-white"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Events */}
              <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors ${
                      event.type === "scheduled"
                        ? "bg-purple-900/60 hover:bg-purple-800/60 border-l-2 border-purple-500"
                        : event.type === "interval"
                        ? "bg-cyan-900/60 hover:bg-cyan-800/60 border-l-2 border-cyan-500"
                        : "bg-amber-900/60 hover:bg-amber-800/60 border-l-2 border-amber-500"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          event.status === "ok"
                            ? "bg-green-400"
                            : event.status === "error"
                            ? "bg-red-400"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="font-medium truncate">{event.title}</span>
                    </div>
                    <div className="text-gray-400 mt-1">
                      {format(event.start, "HH:mm")}
                    </div>
                  </button>
                ))}
                {dayEvents.length === 0 && (
                  <div className="text-gray-600 text-xs text-center py-4">
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    selectedEvent.type === "scheduled"
                      ? "bg-purple-700"
                      : selectedEvent.type === "interval"
                      ? "bg-cyan-700"
                      : "bg-amber-700"
                  }`}
                >
                  {selectedEvent.type}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    selectedEvent.status === "ok"
                      ? "bg-green-700"
                      : selectedEvent.status === "error"
                      ? "bg-red-700"
                      : "bg-gray-700"
                  }`}
                >
                  {selectedEvent.status}
                </span>
                {!selectedEvent.job.enabled && (
                  <span className="px-2 py-1 rounded text-xs bg-gray-700">
                    disabled
                  </span>
                )}
              </div>

              <div>
                <div className="text-gray-400">Schedule</div>
                <div className="text-white">
                  {selectedEvent.job.scheduleKind === "cron"
                    ? `${selectedEvent.job.scheduleExpr} (${selectedEvent.job.timezone || "UTC"})`
                    : selectedEvent.job.scheduleKind === "every"
                    ? `Every ${formatInterval(selectedEvent.job.everyMs!)}`
                    : `Once at ${format(new Date(selectedEvent.job.onceAtMs!), "PPpp")}`}
                </div>
              </div>

              <div>
                <div className="text-gray-400">Next Run</div>
                <div className="text-white">
                  {selectedEvent.job.nextRunAtMs
                    ? format(new Date(selectedEvent.job.nextRunAtMs), "PPpp")
                    : "N/A"}
                </div>
              </div>

              {selectedEvent.job.lastRunAtMs && (
                <div>
                  <div className="text-gray-400">Last Run</div>
                  <div className="text-white">
                    {format(new Date(selectedEvent.job.lastRunAtMs), "PPpp")}
                  </div>
                </div>
              )}

              {selectedEvent.job.lastError && (
                <div>
                  <div className="text-gray-400">Last Error</div>
                  <div className="text-red-400 text-xs font-mono bg-red-900/20 p-2 rounded">
                    {selectedEvent.job.lastError}
                  </div>
                </div>
              )}

              {selectedEvent.job.payloadText && (
                <div>
                  <div className="text-gray-400">Payload</div>
                  <div className="text-gray-300 text-xs font-mono bg-gray-900 p-2 rounded whitespace-pre-wrap">
                    {selectedEvent.job.payloadText.slice(0, 500)}
                    {selectedEvent.job.payloadText.length > 500 && "..."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

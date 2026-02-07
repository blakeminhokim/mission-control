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

function parseCronToEvents(job: CronJob, weekStart: Date, weekEnd: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (job.scheduleKind === "cron" && job.scheduleExpr) {
    const parts = job.scheduleExpr.split(" ");
    if (parts.length >= 5) {
      const [minute, hour, , , weekday] = parts;
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      for (const day of days) {
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

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const events = useMemo(() => {
    return jobs.flatMap((job) => parseCronToEvents(job, weekStart, weekEnd));
  }, [jobs, weekStart, weekEnd]);

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
    <div className="flex flex-col h-full rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-white">
            {format(weekStart, "MMM d")} &ndash; {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevWeek}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Previous week"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Next week"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] hover:text-white disabled:opacity-40 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-white/[0.04]">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(dayKey) || [];
          const today = isToday(day);

          return (
            <div
              key={dayKey}
              className={`flex flex-col min-h-[220px] ${today ? "bg-indigo-500/[0.04]" : ""}`}
            >
              {/* Day Header */}
              <div className={`px-2.5 py-2.5 text-center border-b border-white/[0.04]`}>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-lg font-semibold mt-0.5 ${
                    today ? "text-indigo-400" : "text-gray-300"
                  }`}
                >
                  {today ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">
                      {format(day, "d")}
                    </span>
                  ) : (
                    format(day, "d")
                  )}
                </div>
              </div>

              {/* Events */}
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-all duration-150 group ${
                      event.type === "scheduled"
                        ? "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
                        : event.type === "interval"
                        ? "bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
                        : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          event.status === "ok"
                            ? "bg-emerald-400"
                            : event.status === "error"
                            ? "bg-rose-400"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="font-medium truncate text-gray-200 group-hover:text-white">
                        {event.title}
                      </span>
                    </div>
                    <div className="text-gray-500 mt-0.5 font-mono text-[10px]">
                      {format(event.start, "HH:mm")}
                    </div>
                  </button>
                ))}
                {dayEvents.length === 0 && (
                  <div className="flex items-center justify-center h-full min-h-[60px]">
                    <span className="text-gray-700 text-[10px]">No events</span>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="glass-strong rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedEvent.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      selectedEvent.type === "scheduled"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : selectedEvent.type === "interval"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {selectedEvent.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      selectedEvent.status === "ok"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : selectedEvent.status === "error"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {selectedEvent.status}
                  </span>
                  {!selectedEvent.job.enabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      disabled
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              <div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Schedule</div>
                <div className="text-gray-200 font-mono text-xs">
                  {selectedEvent.job.scheduleKind === "cron"
                    ? `${selectedEvent.job.scheduleExpr} (${selectedEvent.job.timezone || "UTC"})`
                    : selectedEvent.job.scheduleKind === "every"
                    ? `Every ${formatInterval(selectedEvent.job.everyMs!)}`
                    : `Once at ${format(new Date(selectedEvent.job.onceAtMs!), "PPpp")}`}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Next Run</div>
                <div className="text-gray-200 text-xs">
                  {selectedEvent.job.nextRunAtMs
                    ? format(new Date(selectedEvent.job.nextRunAtMs), "PPpp")
                    : "N/A"}
                </div>
              </div>

              {selectedEvent.job.lastRunAtMs && (
                <div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Last Run</div>
                  <div className="text-gray-200 text-xs">
                    {format(new Date(selectedEvent.job.lastRunAtMs), "PPpp")}
                  </div>
                </div>
              )}

              {selectedEvent.job.lastError && (
                <div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Last Error</div>
                  <div className="text-rose-300 text-xs font-mono bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                    {selectedEvent.job.lastError}
                  </div>
                </div>
              )}

              {selectedEvent.job.payloadText && (
                <div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Payload</div>
                  <div className="text-gray-300 text-xs font-mono bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-lg whitespace-pre-wrap">
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

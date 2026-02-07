export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  scheduleKind: "cron" | "every" | "once";
  scheduleExpr?: string;
  everyMs?: number;
  onceAtMs?: number;
  timezone?: string;
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastStatus?: string;
  lastError?: string;
  payloadKind: string;
  payloadText?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "scheduled" | "interval" | "oneshot";
  status: "ok" | "error" | "pending";
  job: CronJob;
}

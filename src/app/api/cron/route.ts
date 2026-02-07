import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface CronJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: {
    kind: "cron" | "every" | "once";
    expr?: string;
    tz?: string;
    everyMs?: number;
    onceAtMs?: number;
  };
  sessionTarget: string;
  wakeMode: string;
  payload: {
    kind: string;
    text?: string;
    message?: string;
  };
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    lastError?: string;
  };
}

export interface CronListResponse {
  jobs: CronJob[];
}

// Transform raw OpenClaw response to simplified format
function transformJobs(data: CronListResponse) {
  return data.jobs.map((job) => ({
    id: job.id,
    name: job.name,
    enabled: job.enabled,
    scheduleKind: job.schedule.kind,
    scheduleExpr: job.schedule.expr,
    everyMs: job.schedule.everyMs,
    onceAtMs: job.schedule.onceAtMs,
    timezone: job.schedule.tz,
    nextRunAtMs: job.state.nextRunAtMs,
    lastRunAtMs: job.state.lastRunAtMs,
    lastStatus: job.state.lastStatus,
    lastError: job.state.lastError,
    payloadKind: job.payload.kind,
    payloadText: job.payload.text || job.payload.message,
  }));
}

export async function GET() {
  try {
    // For local dev: use OpenClaw CLI directly
    // For Railway: set OPENCLAW_GATEWAY_URL and we'll add WebSocket support later
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
    
    if (gatewayUrl) {
      // TODO: Implement WebSocket-based gateway call
      // For now, return an error indicating this isn't implemented yet
      return NextResponse.json(
        { 
          error: "Remote gateway access not yet implemented. Deploy alongside OpenClaw or run locally.",
          jobs: [] 
        },
        { status: 501 }
      );
    }

    // Local mode: call OpenClaw CLI
    const { stdout } = await execAsync("openclaw cron list --json", {
      timeout: 10000,
    });
    const data: CronListResponse = JSON.parse(stdout);
    const jobs = transformJobs(data);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron jobs. Is OpenClaw gateway running?", jobs: [] },
      { status: 500 }
    );
  }
}

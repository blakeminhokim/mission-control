import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule?: {
    kind?: string;
    expr?: string;
    everyMs?: number;
    tz?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastError?: string;
  };
  payload?: {
    kind?: string;
    text?: string;
    message?: string;
  };
}

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(GATEWAY_TOKEN && { Authorization: `Bearer ${GATEWAY_TOKEN}` }),
      },
      body: JSON.stringify({
        method: "cron.list",
        params: { includeDisabled: true },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gateway returned ${res.status}`);
    }

    const data = await res.json();
    
    // Transform cron jobs for the frontend
    const jobs = (data.result?.jobs || []).map((job: CronJob) => ({
      id: job.id,
      name: job.name,
      enabled: job.enabled,
      scheduleKind: job.schedule?.kind,
      scheduleExpr: job.schedule?.expr || `${job.schedule?.everyMs}ms`,
      timezone: job.schedule?.tz || "UTC",
      nextRunAtMs: job.state?.nextRunAtMs,
      lastRunAtMs: job.state?.lastRunAtMs,
      lastStatus: job.state?.lastStatus,
      lastError: job.state?.lastError,
      payloadKind: job.payload?.kind,
      payloadText: job.payload?.text || job.payload?.message,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json(
      { error: "Failed to connect to OpenClaw gateway", jobs: [] },
      { status: 500 }
    );
  }
}

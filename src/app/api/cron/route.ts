import { NextResponse } from "next/server";
import { callGateway } from "../../../lib/gateway";

export async function GET() {
  try {
    const result = await callGateway("cron.list", { includeDisabled: true });
    
    // Transform cron jobs for the frontend
    const jobs = (result?.jobs || []).map((job: any) => ({
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
      { error: error instanceof Error ? error.message : "Failed to connect", jobs: [] },
      { status: 500 }
    );
  }
}

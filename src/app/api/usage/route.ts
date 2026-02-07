import { NextResponse } from "next/server";
import { callGateway } from "../../../lib/gateway";

export async function GET() {
  try {
    const result = await callGateway("sessions.list", { limit: 10, messageLimit: 0 });
    const sessions = result?.sessions || [];

    // Aggregate usage from recent sessions
    let totalTokens = 0;
    let totalCost = 0;

    sessions.forEach((session: any) => {
      if (session.usage) {
        totalTokens += session.usage.totalTokens || 0;
        totalCost += session.usage.cost?.total || 0;
      }
    });

    return NextResponse.json({
      todayTokens: totalTokens,
      todayCost: totalCost,
      sessions: sessions.length,
    });
  } catch (error) {
    console.error("Failed to fetch usage:", error);
    return NextResponse.json(
      { todayTokens: 0, todayCost: 0, sessions: 0, error: error instanceof Error ? error.message : "Failed to connect" },
      { status: 500 }
    );
  }
}

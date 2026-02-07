import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface Session {
  usage?: {
    totalTokens?: number;
    cost?: {
      total?: number;
    };
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
        method: "sessions.list",
        params: { limit: 10, messageLimit: 0 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gateway returned ${res.status}`);
    }

    const data = await res.json();
    const sessions = data.result?.sessions || [];

    // Aggregate usage from recent sessions
    let totalTokens = 0;
    let totalCost = 0;

    sessions.forEach((session: Session) => {
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
      { todayTokens: 0, todayCost: 0, sessions: 0, error: "Failed to connect" },
      { status: 500 }
    );
  }
}

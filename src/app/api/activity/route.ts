import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface GatewaySession {
  id: string;
  createdAt?: number;
  updatedAt?: number;
  status?: string;
  model?: string;
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    cost?: {
      total?: number;
    };
  };
  messageCount?: number;
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
        params: { limit: 50, messageLimit: 0 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gateway returned ${res.status}`);
    }

    const data = await res.json();
    const sessions = (data.result?.sessions || []).map((s: GatewaySession) => ({
      id: s.id,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      status: s.status || "unknown",
      model: s.model,
      totalTokens: s.usage?.totalTokens || 0,
      promptTokens: s.usage?.promptTokens || 0,
      completionTokens: s.usage?.completionTokens || 0,
      cost: s.usage?.cost?.total || 0,
      messageCount: s.messageCount || 0,
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return NextResponse.json(
      { error: "Failed to connect to OpenClaw gateway", sessions: [] },
      { status: 500 }
    );
  }
}

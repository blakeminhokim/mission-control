import { NextResponse } from "next/server";
import { callGateway } from "../../../lib/gateway";

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
    const result = await callGateway("sessions.list", { limit: 50, messageLimit: 0 }) as { sessions?: GatewaySession[] } | null;
    const sessions = (result?.sessions || []).map((s: GatewaySession) => ({
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
      { error: error instanceof Error ? error.message : "Failed to connect", sessions: [] },
      { status: 500 }
    );
  }
}

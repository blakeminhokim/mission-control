import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";

export async function GET() {
  let gatewayStatus = "unknown";

  try {
    const res = await fetch(`${GATEWAY_URL}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "ping", params: {} }),
      signal: AbortSignal.timeout(3000),
    });
    gatewayStatus = res.ok ? "connected" : `error:${res.status}`;
  } catch {
    gatewayStatus = "unreachable";
  }

  return NextResponse.json({
    status: "ok",
    timestamp: Date.now(),
    gateway: {
      url: GATEWAY_URL,
      status: gatewayStatus,
    },
  });
}

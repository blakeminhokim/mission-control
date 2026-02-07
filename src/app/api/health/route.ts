import { NextResponse } from "next/server";
import { callGateway } from "../../../lib/gateway";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";

export async function GET() {
  let gatewayStatus = "unknown";

  try {
    await callGateway("ping", {});
    gatewayStatus = "connected";
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

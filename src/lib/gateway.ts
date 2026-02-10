const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:3000";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface RpcResponse {
  result?: unknown;
  error?: { message: string; code?: number };
}

export async function callGateway(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const url = `${GATEWAY_URL.replace(/\/$/, "")}/tools/invoke`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(GATEWAY_TOKEN && { Authorization: `Bearer ${GATEWAY_TOKEN}` }),
    },
    body: JSON.stringify({ method, params }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gateway returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const data: RpcResponse = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "RPC error");
  }

  return data.result;
}

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:3000";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface ToolContent {
  type: string;
  text?: string;
}

interface ToolResponse {
  ok: boolean;
  result?: { content?: ToolContent[] };
  error?: string;
}

export async function callGateway(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const url = `${GATEWAY_URL.replace(/\/$/, "")}/tools/invoke`;

  // Convert dot-notation RPC methods to underscore tool names
  // e.g. "cron.list" → "cron_list", "sessions.list" → "sessions_list"
  const tool = method.replace(/\./g, "_");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(GATEWAY_TOKEN && { Authorization: `Bearer ${GATEWAY_TOKEN}` }),
    },
    body: JSON.stringify({ tool, args: params }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gateway returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const data: ToolResponse = await res.json();

  if (!data.ok || data.error) {
    throw new Error(data.error || "Tool invocation failed");
  }

  // Extract result from content array — the gateway wraps results
  // as { content: [{ type: "text", text: "<json>" }] }
  const content = data.result?.content;
  if (content && content.length > 0 && content[0].text) {
    try {
      return JSON.parse(content[0].text);
    } catch {
      return content[0].text;
    }
  }

  return data.result;
}

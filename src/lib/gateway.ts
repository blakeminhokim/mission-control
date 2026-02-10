import WebSocket from "ws";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:8080";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

// Convert URL to WebSocket URL, preserving security
function getWsUrl(): string {
  const url = new URL(GATEWAY_URL);
  if (url.protocol === "https:" || url.protocol === "wss:") {
    url.protocol = "wss:";
  } else {
    url.protocol = "ws:";
  }
  return url.toString();
}

interface RpcMessage {
  type: string;
  id: string;
  result?: unknown;
  error?: { message: string; code?: number };
}

export async function callGateway(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    const requestId = `mc-${Date.now()}`;
    let connected = false;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Gateway connection timeout"));
    }, 10000);

    ws.on("open", () => {
      // Send connect handshake
      ws.send(JSON.stringify({
        type: "req",
        id: "connect",
        method: "connect",
        params: {
          minProtocol: 3,
          maxProtocol: 3,
          client: {
            id: "mission-control",
            version: "1.0.0",
            platform: "web",
            mode: "operator",
          },
          role: "operator",
          ...(GATEWAY_TOKEN && { token: GATEWAY_TOKEN }),
        },
      }));
    });

    ws.on("message", (data) => {
      try {
        const msg: RpcMessage = JSON.parse(data.toString());

        // Handle connect response
        if (msg.id === "connect" && msg.type === "res") {
          if (msg.error) {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(msg.error.message || "Connect failed"));
            return;
          }
          connected = true;
          // Now send the actual request
          ws.send(JSON.stringify({
            type: "req",
            id: requestId,
            method,
            params,
          }));
          return;
        }

        // Handle our request response
        if (msg.id === requestId && msg.type === "res") {
          clearTimeout(timeout);
          ws.close();
          if (msg.error) {
            reject(new Error(msg.error.message || "RPC error"));
          } else {
            resolve(msg.result);
          }
        }
      } catch {
        // Ignore parse errors for other messages
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      if (!connected) {
        reject(new Error("Connection closed before connect"));
      }
    });
  });
}

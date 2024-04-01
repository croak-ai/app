import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { HonoConfig } from "../../config";
import { cors } from "hono/cors";
import { WebSocketMessage } from "./web-socket-req-messages-types";
import verifyWebSocketRequest from "./verify-websocket-request";
import { Bindings } from "../../config";

export class CroakDurableObject {
  value: number = 0;
  state: DurableObjectState;
  app: Hono<HonoConfig> = new Hono<HonoConfig>();

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<number>("value");
      this.value = stored || 0;
    });
    this.app.use(
      "*",
      cors({
        origin: "*",
        maxAge: 86400, // 86400 seconds = 1 day
      }),
    );
    this.app.get(
      "/ws/connect",
      upgradeWebSocket((c) => {
        return {
          onMessage: async (event, ws) => {
            try {
              let messageData = event.data;

              // Ensure messageData is a string before attempting to parse it as JSON
              if (messageData instanceof Blob) {
                messageData = await messageData.text();
              } else if (messageData instanceof ArrayBuffer) {
                messageData = new TextDecoder().decode(messageData);
              } else if (messageData instanceof SharedArrayBuffer) {
                messageData = new TextDecoder().decode(
                  new Uint8Array(messageData),
                );
              }

              const message = JSON.parse(messageData);

              const clerkAuth = await verifyWebSocketRequest({
                token: message.token,
                jwksUrl: env.CLERK_JWKS_URL,
                KV: env.GLOBAL_KV,
              });

              const WebSocketMessage: WebSocketMessage = message;
              // Handle different types of WebSocket messages
              switch (WebSocketMessage.type) {
                case "HEARTBEAT":
                  console.log(`Heartbeat status: ${message.status}`);
                  break;
                case "CHAT_MESSAGE":
                  console.log(`Chat message: ${message.text}`);
                  break;
                default:
                  console.error("Unknown message type");
              }
            } catch (e) {
              console.log(e);
              ws.send("Error: while processing ws message");
            }
          },
          onClose: () => {
            console.log("Connection closed");
          },
          onError: (err) => {
            console.error("Error encountered");
          },
        };
      }),
    );

    this.app.get("/ws/increment", async (c) => {
      const currentValue = ++this.value;
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/ws/decrement", async (c) => {
      const currentValue = --this.value;
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/", async (c) => {
      return c.text(this.value.toString());
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}

import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { WebSocketMessage } from "./web-socket-req-messages-types";
import verifyWebSocketRequest from "./verify-websocket-request";
import { Bindings } from "../../config";
import { WSContext } from "hono/ws";
import { HeartbeatStatusType } from "./web-socket-req-messages-types";
import getDbConnection from "./get-durable-object-db-connection";
import { user } from "@acme/db/schema/tenant";
import { eq } from "drizzle-orm";

type UserStatus = {
  status: HeartbeatStatusType;
  updated: number; // Unix timestamp in milliseconds
};

export class CroakDurableObject {
  value: number = 0;
  state: DurableObjectState;
  app: Hono = new Hono();
  connections: Record<string, WSContext> = {}; // Store active WebSocket connections mapped by userId
  currentStatuses: Record<string, UserStatus> = {}; // Store current status of each user

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

            const userId = clerkAuth.sub;

            this.connections[userId] = ws;

            const WebSocketMessage: WebSocketMessage = message;
            // Handle different types of WebSocket messages
            switch (WebSocketMessage.type) {
              case "HEARTBEAT":
                const newStatus = WebSocketMessage.status;

                if (
                  !this.currentStatuses[userId] ||
                  this.currentStatuses[userId].status !== newStatus
                ) {
                  this.currentStatuses[userId] = {
                    status: newStatus,
                    updated: Date.now(),
                  };

                  const db = await getDbConnection({
                    payload: clerkAuth,
                    bindings: env,
                  });

                  await db
                    .update(user)
                    .set({
                      lastKnownStatus: newStatus,
                      lastKnownStatusConfirmedAt: Date.now(),
                      lastKnownStatusSwitchedAt: Date.now(),
                      updatedAt: Date.now(),
                    })
                    .where(eq(user.userId, userId));
                  break;
                }

                const intervalMs = Number(
                  env.DURABLE_OBJECT_HEARTBEAT_UPDATE_INTERVAL_MS,
                );

                if (
                  this.currentStatuses[userId].updated + intervalMs <
                  Date.now()
                ) {
                  this.currentStatuses[userId] = {
                    status: newStatus,
                    updated: Date.now(),
                  };

                  const db = await getDbConnection({
                    payload: clerkAuth,
                    bindings: env,
                  });

                  await db
                    .update(user)
                    .set({
                      lastKnownStatusConfirmedAt: Date.now(),
                      updatedAt: Date.now(),
                    })
                    .where(eq(user.userId, userId));
                  break;
                }

                break;

              default:
                console.error("Unknown message type");
            }
          },
          onClose: (event, ws) => {
            const userId = Object.keys(this.connections).find(
              (key) => this.connections[key] === ws,
            );

            if (userId) {
              delete this.connections[userId];
            }
          },
          onError: (err, ws) => {
            ws.send("An error occurred while processing a websocket message.");

            console.error("WebSocket error: ", err);
          },
        };
      }),
    );

    this.app.get("/ws/message-sent/:messageId", async (c) => {
      // const messageId = c.req.param("messageId");
      // const db = getDbConnection({
      //   payload: c.request,
      //   bindings: env,
      // });
      // await db
      //   .update(user)
      //   .set({
      //     lastMessageSentAt: Date.now(),
      //     updatedAt: Date.now(),
      //   })
      //   .where(eq(user.userId, c.request.sub));
      // return c.text("Message sent");
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

import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { ChatMessage } from "./web-socket-req-messages-types";
import verifyWebSocketRequest from "./verify-websocket-request";
import { Bindings } from "../../config";
import { WSContext } from "hono/ws";
import type {
  ErrorMessageType,
  HeartbeatStatusType,
  WebSocketMessageType,
} from "./web-socket-req-messages-types";

import { user, message } from "@acme/db/schema/tenant";
import { eq } from "drizzle-orm";
import { getDbConnection } from "../../functions/db";

type UserStatus = {
  status: HeartbeatStatusType;
  updated: number; // Unix timestamp in milliseconds
};

export class CroakDurableObject {
  value: number = 0;
  state: DurableObjectState;
  app: Hono = new Hono();
  connections: Record<string, Record<string, WSContext>> = {}; // userId -> websocketId -> WSContext
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
      upgradeWebSocket(async (c) => {
        const token = c.req.query("token");

        if (!token) {
          throw new Error("Unauthorized: Token not found in query");
        }

        const clerkAuth = await verifyWebSocketRequest({
          token,
          jwksUrl: env.CLERK_JWKS_URL,
          KV: env.GLOBAL_KV,
        });

        if (!clerkAuth.org_id) {
          throw new Error("Unauthorized: Organization ID not found in token");
        }

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

            const { token, websocketId } = message;

            const clerkAuth = await verifyWebSocketRequest({
              token,
              jwksUrl: env.CLERK_JWKS_URL,
              KV: env.GLOBAL_KV,
            });

            const userId = clerkAuth.sub;

            const organizationId = clerkAuth.org_id;

            if (!organizationId) {
              throw new Error("Organization ID not found in the context.");
            }

            // Add connection to the user's list of connections
            if (!this.connections[userId]) {
              this.connections[userId] = {};
            }
            // Check if the websocketId already exists to avoid duplicates
            if (!this.connections[userId][websocketId]) {
              this.connections[userId][websocketId] = ws;
            }

            const WebSocketMessage: WebSocketMessageType = message;
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
                    organizationId,
                    env,
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
                    organizationId,
                    env,
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
            const userId = Object.keys(this.connections).find((key) =>
              Object.values(this.connections[key]).some(
                (connection) => connection === ws,
              ),
            );

            if (userId) {
              // Find the websocketId for the closed connection
              const websocketId = Object.keys(this.connections[userId]).find(
                (id) => this.connections[userId][id] === ws,
              );

              // Remove the closed connection using websocketId
              if (websocketId) {
                delete this.connections[userId][websocketId];
              }

              // If the user has no more connections, delete the user from the connections record
              if (Object.keys(this.connections[userId]).length === 0) {
                delete this.connections[userId];
              }
            }
          },
          onError: (err, ws) => {
            const message: ErrorMessageType = {
              type: "ERROR",
              message:
                "An error occurred while processing a websocket message.",
            };
            ws.send(JSON.stringify(message));

            console.error("WebSocket error: ", err);
          },
        };
      }),
    );

    this.app.post("/ws/message-sent", async (c) => {
      const json = await c.req.json();

      const newMessageResult = ChatMessage.parse(json);

      Object.values(this.connections).forEach((wsList) => {
        Object.values(wsList).forEach((ws) => {
          ws.send(JSON.stringify(newMessageResult));
          console.log("Message sent to connection.");
        });
      });
      return c.text("Message sent to all connections");
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

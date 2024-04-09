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

import { user, unGroupedMessage, message } from "@acme/db/schema/tenant";
import { eq, asc } from "drizzle-orm";
import { getDbConnection } from "../../functions/db";
import { SingularMessage, groupMessage } from "./groupMessage";
import { DBClientType } from "@acme/db";

type UserStatus = {
  status: HeartbeatStatusType;
  updated: number; // Unix timestamp in milliseconds
};

export class CroakDurableObject {
  state: DurableObjectState;
  app: Hono = new Hono();
  connections: Record<string, Record<string, WSContext>> = {}; // userId -> websocketId -> WSContext
  currentStatuses: Record<string, UserStatus> = {}; // Store current status of each user
  isProcessingMessages: boolean = false;

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
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
        });
      });

      return c.text("Message sent to all connections.");

      const { orgId } = newMessageResult;

      const db = await getDbConnection({
        organizationId: orgId,
        env,
      });

      const unGroupedMessages = await db
        .select({
          id: message.id,
          userId: message.userId,
          channelId: message.channelId,
          message: message.message,
          createdAt: message.createdAt,
          nameOfUser: user.fullName,
        })
        .from(unGroupedMessage)
        .orderBy(asc(message.createdAt))
        .innerJoin(message, eq(unGroupedMessage.messageId, message.id))
        .leftJoin(user, eq(message.userId, user.userId)) // This join should allow access to user.fullName
        .limit(1);

      if (unGroupedMessages.length === 0) {
        return;
      }

      const newMessage = unGroupedMessages[0];

      if (!this.isProcessingMessages) {
        this.processMessages({
          db,
          env,
          newMessage,
        });
      }

      return c.text("Message sent to all connections.");
    });
  }

  async processMessages({
    db,
    env,
    newMessage,
  }: {
    db: DBClientType;
    env: Bindings;
    newMessage: SingularMessage;
  }) {
    this.isProcessingMessages = true;

    await groupMessage({
      db,
      env,
      newMessage,
    });

    const unGroupedMessages = await db
      .select({
        id: message.id,
        userId: message.userId,
        channelId: message.channelId,
        message: message.message,
        createdAt: message.createdAt,
        nameOfUser: user.fullName,
      })
      .from(unGroupedMessage)
      .orderBy(asc(message.createdAt))
      .innerJoin(message, eq(unGroupedMessage.messageId, message.id))
      .leftJoin(user, eq(message.userId, user.userId)) // This join should allow access to user.fullName
      .limit(1);

    if (unGroupedMessages.length === 0) {
      this.isProcessingMessages = false;
      return;
    }

    const updatedNewMessage = unGroupedMessages[0];

    console.log(`Processing message ${updatedNewMessage.id}`);
    this.processMessages({
      db,
      env,
      newMessage: updatedNewMessage,
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}

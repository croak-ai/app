import { user } from "@acme/db/schema/tenant";

export type HeartbeatStatusType = typeof user.$inferInsert.lastKnownStatus;

export type HeartbeatMessage = {
  type: "HEARTBEAT";
  status: HeartbeatStatusType;
};

export type ChatMessage = {
  type: "CHAT_MESSAGE";
  text: string;
};

// Union type for all message types
export type WebSocketMessage = HeartbeatMessage | ChatMessage;

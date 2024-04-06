import { z } from "zod";
import { LastKnownStatusEnum } from "@acme/db/schema/tenant";
import { user, selectMessageSchema } from "@acme/db/schema/tenant";

export const MessageUserInfo = z.object({
  userId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Something you might notice is every message has a "websocketId" field. This is used to identify the websocket connection that sent the message.
// This is not secure field and should never be used for authentication.
// The purpose of it is to help identify for the frontend which websocket connection sent the message.
// This is useful for when you have multiple websocket connections open under the same user and you want to know which one sent the message.

export const HeartbeatMessage = z.object({
  websocketId: z.string(),
  type: z.literal("HEARTBEAT"),
  status: LastKnownStatusEnum,
});

export const ChatMessage = z.object({
  websocketId: z.string(),
  type: z.literal("CHAT_MESSAGE"),
  newMessage: selectMessageSchema,
  user: MessageUserInfo,
  orgId: z.string(),
});

export const ErrorMessage = z.object({
  websocketId: z.string().optional(),
  type: z.literal("ERROR"),
  message: z.string(),
});

// Union type for all message types
export const WebSocketMessage = z.discriminatedUnion("type", [
  HeartbeatMessage,
  ChatMessage,
]);

export type MessageUserInfoType = z.infer<typeof MessageUserInfo>;
export type HeartbeatStatusType = z.infer<typeof LastKnownStatusEnum>;
export type MessageInfoType = z.infer<typeof selectMessageSchema>;
export type HeartbeatMessageType = z.infer<typeof HeartbeatMessage>;
export type ChatMessageType = z.infer<typeof ChatMessage>;
export type ErrorMessageType = z.infer<typeof ErrorMessage>;
export type WebSocketMessageType = z.infer<typeof WebSocketMessage>;

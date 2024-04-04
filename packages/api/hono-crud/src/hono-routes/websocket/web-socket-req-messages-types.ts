import { z } from "zod";
import { LastKnownStatusEnum } from "@acme/db/schema/tenant";
import { user, selectMessageSchema } from "@acme/db/schema/tenant";

export const MessageUserInfo = z.object({
  userId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const HeartbeatMessage = z.object({
  type: z.literal("HEARTBEAT"),
  status: LastKnownStatusEnum,
});

export const ChatMessage = z.object({
  type: z.literal("CHAT_MESSAGE"),
  newMessage: selectMessageSchema,
  user: MessageUserInfo,
  orgId: z.string(),
});

export const ErrorMessage = z.object({
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

export type HeartbeatMessage = {
  type: "HEARTBEAT";
  status: "ONLINE" | "AWAY" | "MOBILE";
};

export type ChatMessage = {
  type: "CHAT_MESSAGE";
  text: string;
};

// Union type for all message types
export type WebSocketMessage = HeartbeatMessage | ChatMessage;

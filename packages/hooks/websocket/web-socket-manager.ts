import { WebSocketMessageType } from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";
import { v4 as uuidv4 } from "uuid";

type FinalMessageType = WebSocketMessageType & {
  token: string;
};

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private messageHandlers: ((message: WebSocketMessageType) => void)[] = [];
  private websocketId: string = uuidv4();

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(url: string, token: string): WebSocket {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(
        `${url}?token=${encodeURIComponent(
          token,
        )}&websocketId=${encodeURIComponent(this.websocketId)}`,
      );
      this.configureSocket();
    }
    return this.socket;
  }

  public getWebSocketId(): string {
    return this.websocketId;
  }

  private configureSocket(): void {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach((handler) => handler(data));
    };

    this.socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.log("WebSocket connection closed.");
      // Handle connection closure
    };
  }

  public addMessageHandler(
    handler: (message: WebSocketMessageType) => void,
  ): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(
    handler: (message: WebSocketMessageType) => void,
  ): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  public sendMessage(message: FinalMessageType): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageWithId = {
        ...message,
        websocketId: this.websocketId,
      };
      this.socket.send(JSON.stringify(messageWithId));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketManager;

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import WebSocketManager from "./web-socket-manager"; // Adjust the path accordingly
import { WebSocketMessageType } from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";

interface WebSocketContextType {
  sendMessage: (message: WebSocketMessageType) => void;
  addMessageHandler: (handler: (message: WebSocketMessageType) => void) => void;
  removeMessageHandler: (
    handler: (message: WebSocketMessageType) => void,
  ) => void;
  websocketId: string; // Add this line
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider = ({
  children,
  url,
}: {
  children: ReactNode;
  url: string;
}) => {
  const { getToken } = useAuth();
  const webSocketManager = WebSocketManager.getInstance();
  const [isConnected, setIsConnected] = useState(false); // State to track connection status
  const websocketId = webSocketManager.getWebSocketId();

  useEffect(() => {
    const initWebSocket = async () => {
      const token = await getToken();
      if (token) {
        const connectWebSocket = () => {
          const socket = webSocketManager.connect(url, token);

          socket.onopen = () => {
            setIsConnected(true);
          };

          socket.onclose = () => {
            setIsConnected(false);
          };
        };

        connectWebSocket();
      }
    };

    initWebSocket();

    return () => {
      webSocketManager.disconnect();
    };
  }, []);

  const sendMessage = useCallback(async (message: WebSocketMessageType) => {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found.");
    }
    const finalMessage = { token, ...message };
    webSocketManager.sendMessage(finalMessage);
  }, []);

  const addMessageHandler = useCallback(
    (handler: (message: WebSocketMessageType) => void) => {
      webSocketManager.addMessageHandler(handler);
    },
    [],
  );

  const removeMessageHandler = useCallback(
    (handler: (message: any) => void) => {
      webSocketManager.removeMessageHandler(handler);
    },
    [],
  );

  if (!isConnected) {
    return <div>Connecting</div>;
  }

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        addMessageHandler,
        removeMessageHandler,
        websocketId,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

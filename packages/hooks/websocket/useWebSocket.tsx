import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { WebSocketMessage } from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";

interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void;
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
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5; // Maximum number of reconnection attempts
  const reconnectDelay = 3000; // Delay before attempting to reconnect, in milliseconds
  const heartbeatInterval = 20000; // Interval for sending heartbeat messages, in milliseconds

  const sendMessage = useCallback(
    async (message: WebSocketMessage) => {
      const token = await getToken(); // Assuming getToken is an async function that fetches the current token
      if (!token) {
        console.error("No token available for WebSocket connection.");
        return;
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const messageWithToken = { ...message, token }; // Append the token to the message
        socketRef.current.send(JSON.stringify(messageWithToken));
      }
    },
    [getToken],
  );

  useEffect(() => {
    let heartbeatTimer: NodeJS.Timeout; // Specify the type for heartbeatTimer

    const connectWebSocket = async () => {
      setReconnectAttempts(0); // Reset reconnection attempts when manually connecting

      const token = await getToken();
      if (!token) {
        console.error("No token available for WebSocket connection.");
        return;
      }

      // Check if WebSocket is already open or in the process of connecting
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log("WebSocket is already open or connecting.");
        return;
      }

      const ws = new WebSocket(`${url}?token=${encodeURIComponent(token)}`);

      ws.onmessage = (event) => {
        const message = event.data;
        console.log("Message from server:", message);
      };

      ws.onopen = () => {
        console.log("WebSocket connection established.");
        setIsConnected(true);

        sendMessage({ type: "HEARTBEAT", status: "ONLINE" });

        heartbeatTimer = setInterval(() => {
          sendMessage({ type: "HEARTBEAT", status: "ONLINE" });
        }, heartbeatInterval);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
        setIsConnected(false);
        socketRef.current = null;
        clearInterval(heartbeatTimer); // Clear the heartbeat timer

        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            console.log(
              `Attempting to reconnect... (Attempt ${reconnectAttempts + 1})`,
            );
            setReconnectAttempts((prevAttempts) => prevAttempts + 1);
            connectWebSocket();
          }, reconnectDelay);
        } else {
          console.log(
            "Maximum reconnect attempts reached. Not attempting to reconnect.",
          );
        }
      };

      socketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      socketRef.current?.close();
      clearInterval(heartbeatTimer); // Ensure the heartbeat timer is cleared on cleanup
    };
  }, [url, getToken, reconnectAttempts]); // Add reconnectAttempts to the dependency array

  if (!isConnected) {
    return <div>Connecting to WebSocket...</div>;
  }

  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
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

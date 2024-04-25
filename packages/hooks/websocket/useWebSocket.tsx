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
import { Progress } from "@acme/ui/components/ui/progress";
import { Button } from "@acme/ui/components/ui/button";
import LoadingScreen from "@acme/ui/components/bonus/loading-screen";
import { RefreshCw } from "lucide-react";

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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const initWebSocket = async () => {
      const token = await getToken();
      if (token && !isConnected && connectionAttempts <= 5) {
        // Check if not already connected before connecting
        const connectWebSocket = async () => {
          // Wait if there have been connection attempts already
          if (connectionAttempts > 0) {
            const waitTime = 1.25 * (connectionAttempts - 1); // Total wait time in seconds
            const updateInterval = 100; // Update progress every 100 ms
            const totalUpdates = (waitTime * 1000) / updateInterval; // Total number of updates
            let currentUpdate = 0;

            const updateProgress = () => {
              if (currentUpdate <= totalUpdates) {
                setProgress((currentUpdate / totalUpdates) * 100); // Update progress as a percentage
                currentUpdate++;
                setTimeout(updateProgress, updateInterval);
              }
            };

            await new Promise((resolve) => {
              setTimeout(resolve, waitTime * 1000);
              updateProgress(); // Start updating progress
            });
          }

          setProgress(100);

          const socket = webSocketManager.connect(url, token);

          socket.onopen = () => {
            setIsConnected(true);
            setConnectionAttempts(0);
          };

          socket.onclose = () => {
            setIsConnected(false);
          };

          socket.onerror = (error) => {
            setIsConnected(false);
            setConnectionAttempts(connectionAttempts + 1);
          };
        };

        await connectWebSocket();
      }
    };

    initWebSocket();

    return () => {
      if (isConnected) {
        // Only disconnect if currently connected
        webSocketManager.disconnect();
      }
    };
  }, [isConnected, connectionAttempts]); // Add isConnected as a dependency

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

  if (connectionAttempts > 5) {
    return (
      <LoadingScreen>
        <div>
          <div className="my-4">
            Connection failed. Please check your internet connection.
          </div>
          <div className="flex justify-center">
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                setConnectionAttempts(0);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </LoadingScreen>
    );
  }

  if (connectionAttempts > 0) {
    return (
      <LoadingScreen>
        <div>
          {`Attempting to reconnect... Attempt #${connectionAttempts}`}
          <Progress value={progress} className="my-4" />
        </div>
      </LoadingScreen>
    );
  }

  if (!isConnected) {
    return (
      <LoadingScreen>
        <div>Connecting</div>
      </LoadingScreen>
    );
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

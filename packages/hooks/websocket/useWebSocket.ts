import { useEffect, useState, useCallback } from "react";

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback(
    (message: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    },
    [socket],
  );

  return { sendMessage };
};

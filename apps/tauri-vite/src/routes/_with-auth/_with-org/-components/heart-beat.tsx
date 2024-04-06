import React, { useEffect, useState } from "react";
import { useWebSocket } from "@croak/hooks-websocket/useWebSocket";
import { useIdleTimer } from "react-idle-timer";

interface HeartBeatProps {
  children: React.ReactNode;
}

const HeartBeat: React.FC<HeartBeatProps> = ({ children }) => {
  const { sendMessage, websocketId } = useWebSocket();
  const [status, setStatus] = useState<"ONLINE" | "AWAY">("ONLINE");
  const heartbeatInterval = 20000; // 20 seconds
  const idleTimeout = 60000; // 1 minute

  const sendHeartbeat = () => {
    sendMessage({
      websocketId,
      type: "HEARTBEAT",
      status: status,
    });
  };

  useIdleTimer({
    onIdle: () => setStatus("AWAY"),
    onActive: () => setStatus("ONLINE"),
    onMessage: sendHeartbeat,
    timeout: idleTimeout,
    crossTab: true,
  });

  useEffect(() => {
    sendHeartbeat(); // Send the first heartbeat immediately
    const intervalId = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      //   console.log(
      //     `Remaining time: ${Math.ceil(getRemainingTime() / 1000)} seconds`,
      //   );
      //   console.log(`Is last active tab: ${isLastActiveTab()}`);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
};

export default HeartBeat;

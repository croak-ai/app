import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import { WebSocketProvider } from "@croak/hooks-websocket/useWebSocket";
import HeartBeat from "./-components/heart-beat";
import OrgLayout from "@/routes/_with-auth/_with-org/-components/org-layout";
const VITE_HONO_WS_URL = import.meta.env.VITE_HONO_WS_URL;

if (!VITE_HONO_WS_URL) {
  throw new Error("Missing VITE_HONO_WS_URL");
}
export const Route = createLazyFileRoute("/_with-auth/_with-org")({
  component: () => (
    <WebSocketProvider url={VITE_HONO_WS_URL}>
      <HeartBeat>
        <OrgLayout>
          <Outlet />
        </OrgLayout>
      </HeartBeat>
    </WebSocketProvider>
  ),
});

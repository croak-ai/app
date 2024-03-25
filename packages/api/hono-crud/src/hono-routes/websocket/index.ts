import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";

export const websocket = new Hono<HonoConfig>();
// Custom middleware to check for a valid org ID
const validateAuth = async (c: Context<HonoConfig>, next: Function) => {
  console.log(JSON.stringify(c));
  const auth = getAuth(c);

  if (!auth || !auth.orgId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
};

websocket.get(
  "/",
  upgradeWebSocket((c: Context<HonoConfig>) => {
    const doId = c.env.CROAK_DURABLE_OBJECT.idFromName("croak");
    const croak = c.env.CROAK_DURABLE_OBJECT.get(doId);

    return {
      onMessage: (event, ws) => {
        ws.send(`HI`);
      },
      onClose: () => {
        console.log("Connection closed");
      },
      onError: (err) => {
        console.error("Error encountered");
      },
    };
  }),
);

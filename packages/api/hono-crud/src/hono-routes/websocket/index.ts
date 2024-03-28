import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import verifyWebSocketRequest from "./verify-websocket-request";

export const websocket = new Hono<HonoConfig>();

// Custom middleware to check for a valid token in the query params
const validateAuth = async (c: Context<HonoConfig>, next: Function) => {
  const token = c.req.query("token");

  if (!token) {
    throw new HTTPException(401, {
      message: "Unauthorized: No token provided",
    });
  }

  try {
    await verifyWebSocketRequest({
      token,
      c,
    });
  } catch (e) {
    console.log(e);
  }

  await next();
};

websocket.get(
  "/",
  validateAuth,
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

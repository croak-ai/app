import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { HTTPException } from "hono/http-exception";
import verifyWebSocketRequest from "./verify-websocket-request";

export const websocketForwarder = new Hono<HonoConfig>();

websocketForwarder.get("*", async (c) => {
  const auth = await verifyWebSocketRequest({
    token: c.req.query("token"),
    jwksUrl: c.env.CLERK_JWKS_URL,
    KV: c.env.GLOBAL_KV,
  });

  const orgId = auth.org_id;

  if (!orgId) {
    throw new HTTPException(401, {
      message: "Unauthorized: Organization ID not found in token",
    });
  }

  const id = c.env.CROAK_DURABLE_OBJECT.idFromName(orgId);
  const obj = c.env.CROAK_DURABLE_OBJECT.get(id);
  return obj.fetch(c.req.raw);
});

import {
  OrganizationMembershipWebhookEvent,
  UserWebhookEvent,
  type EmailAddressJSON,
} from "@clerk/backend";
import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { createDbClient } from "@acme/db";
import { verifyWebhook } from "../../functions/webhook/verifyWebhook";

import { HTTPException } from "hono/http-exception";
import { user } from "@acme/db/schema/tenant";
import { eq } from "@acme/db";
import { getDbAuthToken } from "../../functions/db";
import { fetchUserMemberships } from "../../functions/webhook/fetchUserMemberships";
import { updateOrgUser } from "../../functions/webhook/updateOrgUser";
import { upgradeWebSocket } from "hono/cloudflare-workers";

export const websocket = new Hono<HonoConfig>();

websocket.get(
  "/",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send(JSON.stringify(c));
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

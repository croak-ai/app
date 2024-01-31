import type { EmailAddressJSON, WebhookEvent } from "@clerk/backend";
import { Hono } from "hono";
import { Webhook } from "svix";
import type { HonoConfig } from "../config";
import { createDb } from "../functions/db";
import { HTTPException } from "hono/http-exception";

/*
Verify integrity of webhook using svix
Connect to org database using orgId in request
Insert data received into org DB
*/
export const webhook = new Hono<HonoConfig>().post("/", async (c) => {
  const WEBHOOK_SECRET = c.env.CLERK_WEBHOOK_SECRET_KEY;

  if (!WEBHOOK_SECRET) {
    throw new HTTPException(401, {
      message: "Please add WEBHOOK_SECRET from Clerk Dashboard to .dev.vars",
    });
  }

  /* Extract req body as text, extract req headers */
  const textBody = await c.req.text();
  const svix_id = c.req.header("svix-id");
  const svix_timestamp = c.req.header("svix-timestamp");
  const svix_signature = c.req.header("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new HTTPException(401, {
      message: "Request does not have the correct svix headers",
    });
  }

  const webhook = new Webhook(WEBHOOK_SECRET);
  try {
    const event = webhook.verify(textBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    throw new HTTPException(401, {
      message: "Unable to verify integrity of Clerk webhook",
    });
  }
  const jsonBody = await c.req.json();
  const { type } = jsonBody;
  const { data } = jsonBody;

  //Grab orgId
  const orgId = data.organization.id;
  //const orgId = data.
  const db = createDb({ c, orgId });

  // switch (event.type) {
  //   case "user.created":
  //     await db.insert(users).values({
  //       id: event.data.id,
  //       firstName: event.data.first_name,
  //       lastName: event.data.last_name,
  //       email: getPrimaryEmail(
  //         event.data.email_addresses,
  //         event.data.primary_email_address_id,
  //       ),
  //     });
  //     return c.text(`User with id ${event.data.id} created`, 200);
  //   case "user.updated":
  //     await db
  //       .update(users)
  //       .set({
  //         firstName: event.data.first_name,
  //         lastName: event.data.last_name,
  //         email: getPrimaryEmail(
  //           event.data.email_addresses,
  //           event.data.primary_email_address_id,
  //         ),
  //       })
  //       .where(eq(users.id, event.data.id));
  //     return c.text(`User with id ${event.data.id} deleted`, 200);
  //   case "user.deleted":
  //     if (!event.data.deleted) return c.text("User not deleted", 400);
  //     if (!event.data.id) return c.text("Missing user id", 400);
  //     await db.delete(users).where(eq(users.id, event.data.id));
  //     return c.text(`User with id ${event.data.id} deleted`, 200);
  //   default:
  //     return c.text("Invalid event type", 400);
  // }
});

function getPrimaryEmail(emails: EmailAddressJSON[], primaryEmailId: string) {
  const primaryEmail = emails.find(
    (e) => e.id === primaryEmailId,
  )?.email_address;

  // This in theory should never happen since users need to provide an email address to sign up
  if (!primaryEmail) {
    throw new Error("No primary email found");
  }

  return primaryEmail;
}

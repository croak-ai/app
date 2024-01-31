import type { EmailAddressJSON, WebhookEvent } from "@clerk/backend";
import { Hono } from "hono";
import { Webhook } from "svix";
import type { HonoConfig } from "../config";
import { createDb } from "../functions/db";
import { HTTPException } from "hono/http-exception";
import { verifyWebhook } from "../functions/webhook/verifyWebhook";

/*
Verify integrity of webhook using svix
Connect to org database using orgId in request
Insert data received into org DB
*/
export const webhook = new Hono<HonoConfig>().post("/", async (c) => {
  const event = await verifyWebhook(c);

  console.log("WEBHOOK VERIFIED");
  const jsonBody = await c.req.json();
  const { data } = jsonBody;

  console.log(event.type);
  console.log(data);

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

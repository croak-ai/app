import type { EmailAddressJSON } from "@clerk/backend";
import { Hono } from "hono";
import type { HonoConfig } from "../config";
import { createDb } from "../functions/db";
import { verifyWebhook } from "../functions/webhook/verifyWebhook";
import { HTTPException } from "hono/http-exception";
import { Context } from "../trpc";
import { user } from "@packages/db/schema/tenant";
import { eq } from "@packages/db";

/*
Verify integrity of webhook using svix
Connect to org database using orgId in request
Insert data received into org DB
*/
export const webhook = new Hono<HonoConfig>().post("/", async (c) => {
  try {
    const event = await verifyWebhook(c);
    const userData = event.data.public_user_data;
    const userId = parseInt(userData.user_id);

    console.log("WEBHOOK VERIFIED");

    //Grab orgId (String for testing purposes)
    const orgId = "org_2beC7yJZqgXIXisWvhNJFbWie4Q"; //data.organization.id;
    const db = createDb({ c, orgId });

    switch (event.type) {
      case "organizationMembership.created":
        await db.insert(user).values({
          userId,
          role: event.data.role,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.identifier,
          imageUrl: userData.image_url,
          profileImageUrl: userData.profile_image_url,
          createdAt: event.data.created_at,
          updatedAt: event.data.updated_at,
          deletedAt: null,
        });
        return c.text(`User with id ${userId} created`, 200);
      case "organizationMembership.updated":
        await db
          .update(user)
          .set({
            userId,
            role: event.data.role,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.identifier,
            imageUrl: userData.image_url,
            profileImageUrl: userData.profile_image_url,
            createdAt: event.data.created_at,
            updatedAt: event.data.updated_at,
            deletedAt: null,
          })
          .where(eq(user.userId, userId));
        return c.text(`User with id ${event.data.id} updated`, 200);
      case "organizationMembership.deleted":
        await db.delete(user).where(eq(user.userId, userId));
        return c.text(`User with id ${userData.user_id} deleted`, 200);
      default:
        return c.text("Invalid event type", 400);
    }

    return c.text("working");
  } catch (err) {
    throw new HTTPException(500, {
      message: "Error in Clerk webhook",
    });
  }
});

// function getPrimaryEmail(emails: EmailAddressJSON[], primaryEmailId: string) {
//   const primaryEmail = emails.find(
//     (e) => e.id === primaryEmailId,
//   )?.email_address;

//   // This in theory should never happen since users need to provide an email address to sign up
//   if (!primaryEmail) {
//     throw new Error("No primary email found");
//   }

//   return primaryEmail;
// }

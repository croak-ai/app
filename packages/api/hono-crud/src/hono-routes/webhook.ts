import type { EmailAddressJSON } from "@clerk/backend";
import { Hono } from "hono";
import type { HonoConfig } from "../config";
import { createDb } from "../functions/db";
import { verifyWebhook } from "../functions/webhook/verifyWebhook";
import { HTTPException } from "hono/http-exception";
import { Context } from "../trpc";
import { user } from "@packages/db/schema/tenant";

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
        return c.text(`User with id ${event.data.id} created`, 200);
      case "organizationMembership.updated":
        await db
          .update(users)
          .set({
            firstName: event.data.first_name,
            lastName: event.data.last_name,
            email: getPrimaryEmail(
              event.data.email_addresses,
              event.data.primary_email_address_id,
            ),
          })
          .where(eq(users.id, event.data.id));
        return c.text(`User with id ${event.data.id} deleted`, 200);
      case "organizationMembership.deleted":
        if (!event.data.deleted) return c.text("User not deleted", 400);
        if (!event.data.id) return c.text("Missing user id", 400);
        await db.delete(users).where(eq(users.id, event.data.id));
        return c.text(`User with id ${event.data.id} deleted`, 200);
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

type OrganizationMembershipEvent = {
  data: {
    created_at: number;
    id: string;
    object: string;
    organization: {
      created_at: number;
      created_by: string;
      id: string;
      image_url: string;
      logo_url: string;
      name: string;
      object: string;
      public_metadata: Record<string, unknown>;
      slug: string;
      updated_at: number;
    };
    public_user_data: {
      first_name: string;
      identifier: string;
      image_url: string;
      last_name: string;
      profile_image_url: string;
      user_id: string;
    };
    role: string;
    updated_at: number;
  };
  object: string;
  type: string;
};

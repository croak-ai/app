import { Context } from "hono";
import { HonoConfig } from "../../config";
import { WebhookEvent } from "@clerk/backend";
import { HTTPException } from "hono/http-exception";
import { Webhook } from "svix";

export async function verifyWebhook(
  c: Context<HonoConfig>,
): Promise<OrganizationMembershipEvent> {
  try {
    const WEBHOOK_SECRET = c.env.CLERK_WEBHOOK_SECRET_KEY;

    if (!WEBHOOK_SECRET) {
      throw new HTTPException(401, {
        message: "Please add WEBHOOK_SECRET from Clerk Dashboard to .dev.vars",
      });
    }
    //Clone the req object so we can still read json in main webhook route
    const textBody = await c.req.raw.text();
    const svix_id = c.req.header("svix-id");
    const svix_timestamp = c.req.header("svix-timestamp");
    const svix_signature = c.req.header("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new HTTPException(401, {
        message: "Request does not have the correct svix headers",
      });
    }

    const webhook = new Webhook(WEBHOOK_SECRET);
    return webhook.verify(textBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as OrganizationMembershipEvent;
    /* Catch known errors first else catch and throw unknown error */
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, {
        message: `Unable to verify integrity of Clerk webhook \n ${error}`,
      });
    }
  }
}

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

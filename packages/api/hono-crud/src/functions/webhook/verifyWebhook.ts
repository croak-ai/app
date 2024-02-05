import { Context } from "hono";
import { HonoConfig } from "../../config";
import { HTTPException } from "hono/http-exception";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";

export async function verifyWebhook(
  WEBHOOK_SECRET: string,
  c: Context<HonoConfig>,
): Promise<WebhookEvent> {
  try {
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
    }) as WebhookEvent;
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

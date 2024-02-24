import { Hono } from "hono";
import { cors } from "hono/cors";

import type { HonoConfig } from "./config";
import { clerk } from "./hono-middleware/clerk";
import { trpc } from "./hono-middleware/trpc";
import { HTTPException } from "hono/http-exception";
import { clerkWebhook } from "./hono-routes/webhook/clerkWebhook";
import type {
  ScheduledEvent,
  ExecutionContext,
} from "@cloudflare/workers-types";
import { clerkSync } from "./functions/cron/clerk-sync";

const app = new Hono<HonoConfig>()
  .get("/", (c) => {
    return c.text("Hello world");
  })
  .use(
    "*",
    cors({
      origin: ["http://localhost:3000", "http://localhost:1420"],
    }),
  )
  .use("*", clerk)
  .use("/trpc/*", trpc)
  .route("/webhook", clerkWebhook);

/* Error handling */
app.onError((err, c) => {
  //Catch defined errors
  if (err instanceof HTTPException) {
    console.error(err.stack);
    return err.getResponse();
  }
  //Default to 500 if uncaught
  return c.text(`Internal Server error ${err}`, 500);
});

export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: any, ctx: ExecutionContext) => {
    ctx.waitUntil(Promise.resolve(clerkSync({ apiKey: env.CLERK_SECRET_KEY })));
  },
};

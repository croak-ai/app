import { Hono } from "hono";
import { cors } from "hono/cors";

import type { HonoConfig } from "./config";
import { clerk } from "./hono-middleware/clerk";
import { trpc } from "./hono-middleware/trpc";
import { HTTPException } from "hono/http-exception";
import { clerkWebhook } from "./hono-routes/webhook/clerkWebhook";

/* 
Cors origin set to any for now because of weird enviornment specific issues.
Should be localhost:3000 and localhost:1420 
*/
const app = new Hono<HonoConfig>()
  .get("/", (c) => {
    return c.text("Hello world");
  })
  .use(
    "*",
    cors({
      origin: "*",
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

export { app };

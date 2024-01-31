import { Hono } from "hono";
import { cors } from "hono/cors";

import type { HonoConfig } from "./config";
import { clerk } from "./hono-middleware/clerk";
import { trpc } from "./hono-middleware/trpc";
import { webhook } from "./hono-routes/webhook";
import { HTTPException } from "hono/http-exception";

const app = new Hono<HonoConfig>()
  .get("/", (c) => {
    return c.text("Hello world");
  })
  .use(
    "*",
    cors({
      origin: [
        // Admin tool dev server
        "http://localhost:3000",
        // Club website dev server
        "http://localhost:3001",
        // Knight Hacks 2024 dev server
        "http://localhost:3002",
        // Admin tool production server
        "https://knighthacks-admin.pages.dev",
        "https://admin.knighthacks.org",
      ],
    }),
  )
  .use("*", clerk)
  .use("/trpc/*", trpc)
  .route("/webhook", webhook);

/* Error handling */
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    //Display custom error message
    console.error("Error: ", err.message);
    return err.getResponse();
  }
  //Default to 500 if uncaught
  return c.text("Internal Server error", 500);
});

export { app };

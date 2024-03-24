import { DurableObjectState } from "@cloudflare/workers-types";
import { Hono } from "hono";

type UserStatus = "online" | "away" | "do not disturb";

export class CroakDurableObject {
  userStates: Map<string, { status: UserStatus; lastUpdate: number }> =
    new Map();
  state: DurableObjectState;
  app: Hono = new Hono();

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored =
        await this.state.storage?.get<
          Map<string, { status: UserStatus; lastUpdate: number }>
        >("userStates");
      this.userStates = stored || new Map();
    });

    this.app.get("/update/:userId/:status", async (c) => {
      const userId = c.req.param("userId");
      const status = c.req.param("status") as UserStatus;
      if (["online", "away", "do not disturb"].includes(status)) {
        const currentTime = Date.now();
        this.userStates.set(userId, { status, lastUpdate: currentTime });
        await this.state.storage?.put("userStates", this.userStates);
        return c.text(`User ${userId} status updated to ${status}`);
      } else {
        return c.text(`Invalid status`, 400);
      }
    });

    this.app.get("/list", async (c) => {
      const currentTime = Date.now();
      this.userStates.forEach((value, key) => {
        if (currentTime - value.lastUpdate > 120000) {
          /* @ TODO we need to update the user table in the database to reflect the "last seen" status of the user */
          /* We need to also invalidate the tanstack query's cache for the clients as well */

          this.userStates.delete(key); // Cleanup expired users
        }
      });
      await this.state.storage?.put("userStates", this.userStates);
      return c.json([...this.userStates]);
    });
  }

  async fetch(request: Request) {
    // Handle normal HTTP requests
    return this.app.fetch(request);
  }
}

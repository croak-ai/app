import { DurableObjectState } from "@cloudflare/workers-types";
import { Hono } from "hono";

export class CroakDurableObject {
  value: number = 0;
  state: DurableObjectState;
  app: Hono = new Hono();

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<number>("value");
      this.value = stored || 0;
    });

    this.app.get("/increment", async (c) => {
      const currentValue = ++this.value;
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/decrement", async (c) => {
      const currentValue = -(-this.value);
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/", async (c) => {
      return c.text(this.value.toString());
    });
  }

  async fetch(request: Request) {
    // Check if the request is a WebSocket upgrade request
    if (request.headers.get("Upgrade") === "websocket") {
      // Get the WebSocket pair
      const { 0: client, 1: server } = new WebSocketPair();
      // Example of handling WebSocket messages
      server.addEventListener("message", async (event) => {
        // Echo the received message back to the client
        server.send(`Echo: ${event.data}`);
      });
      // Close event listener
      server.addEventListener("close", () => {
        console.log("WebSocket closed");
      });
      // Return the response to upgrade to WebSocket
      return new Response(null, {
        status: 101,
        headers: {
          Connection: "Upgrade",
          Upgrade: "websocket",
        },
      });
    }
    // Handle normal HTTP requests
    return this.app.fetch(request);
  }
}

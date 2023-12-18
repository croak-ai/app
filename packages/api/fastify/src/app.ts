import fastify from "fastify";
import router from "./router";

import { createClient } from "@libsql/client";

export * from "drizzle-orm";

const url = "libsql://t-2zxiuje7ew7a907upsn1bftqtzr-walshington.turso.io";
const authToken =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJIb3hhQTVxdEVlNlVfMUpUaVV5UWFBIn0.ibkYKHvMvsVxamq6JxKJDIPiapbzOEBF07MmbQVITWOhvwD_CS7IdrBC_vfT6yyt_PO5Uhk4KR3rJ9cN2ySICg";

const server = fastify({
  // Logger only for production
  logger: true,
});

server.register(router);

const client = createClient({
  url,
  authToken,
});

export { server, client };

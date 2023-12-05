import { type Config } from "drizzle-kit";
import { TURSO_DB_URL, TURSO_DB_AUTH_TOKEN } from "./env";
import { schema } from "./index";

export default {
  out: "./migrations",
  schema: "./schema",
  driver: "turso",
  dbCredentials: {
    url: TURSO_DB_URL,
    authToken: TURSO_DB_AUTH_TOKEN,
  },
  breakpoints: true,
} satisfies Config;

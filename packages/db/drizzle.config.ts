import { type Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "./schema",
  driver: "turso",
  breakpoints: true,
} satisfies Config;

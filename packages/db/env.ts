import { parseEnv, z } from "znv";
import dotenv from "dotenv";

// Load environment variables from .env file at the root of your project
dotenv.config({ path: "../../.env" });

export const { TURSO_DB_URL, TURSO_DB_AUTH_TOKEN } = parseEnv(process.env, {
  TURSO_DB_URL: z.string().url(),

  TURSO_DB_AUTH_TOKEN: {
    schema: z.string().min(1),
    description: "turso db tokens create $DB_NAME",
  },
});

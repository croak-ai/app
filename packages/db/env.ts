import { parseEnv, z } from "znv";
import dotenv from "dotenv";

// Load environment variables from .env file at the root of your project
dotenv.config({ path: "../../.env" });

type GroupSecretType = { name: string; secret: string };

let MIGRATIONS_TURSO_ORG_DB_GROUPS: GroupSecretType[] | undefined;
if (process.env.MIGRATIONS_TURSO_ORG_DB_GROUPS) {
  try {
    const parsed = JSON.parse(process.env.MIGRATIONS_TURSO_ORG_DB_GROUPS);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) => item.hasOwnProperty("name") && item.hasOwnProperty("secret"),
      )
    ) {
      MIGRATIONS_TURSO_ORG_DB_GROUPS = parsed as GroupSecretType[];
    } else {
      console.error("TURSO_ORG_DB_GROUPS is not in the correct format");
    }
  } catch (e) {
    console.error("Failed to parse TURSO_ORG_DB_GROUPS:", e);
  }
}

export { MIGRATIONS_TURSO_ORG_DB_GROUPS };

export const {
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_API_BASE_URL,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} = parseEnv(process.env, {
  MIGRATIONS_TURSO_ORG_SLUG: z.string().min(1).optional(),

  MIGRATIONS_TURSO_API_BASE_URL: {
    schema: z.string().min(1).url().optional(),
  },

  MIGRATIONS_TURSO_AUTH_TOKEN: {
    schema: z.string().min(1).optional(),
  },
});

import { parseEnv, z } from "znv";
import dotenv from "dotenv";

// Load environment variables from .env file at the root of your project
dotenv.config({ path: "./.env" });

type GroupSecretType = { name: string; secret: string };

const envResult = parseEnv(process.env, {
  MIGRATIONS_TURSO_ORG_SLUG: z.string().min(1).optional(),
  MIGRATIONS_TURSO_AUTH_TOKEN: {
    schema: z.string().min(1).optional(),
  },
});

if (!envResult.MIGRATIONS_TURSO_ORG_SLUG) {
  console.error(
    "Please set up the MIGRATIONS_TURSO_ORG_SLUG environment variables.",
  );
}

if (!envResult.MIGRATIONS_TURSO_AUTH_TOKEN) {
  console.error(
    "Please set up the MIGRATIONS_TURSO_AUTH_TOKEN environment variables.",
  );
}

export const { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } =
  envResult;

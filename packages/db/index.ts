import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { TURSO_DB_URL, TURSO_DB_AUTH_TOKEN } from "./env";

import * as post from "./schema/post";

export const schema = { ...post };

export * from "drizzle-orm";

const client = createClient({
  url: TURSO_DB_URL,
  authToken: TURSO_DB_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

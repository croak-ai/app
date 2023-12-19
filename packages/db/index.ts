import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as test from "./schema/test";

export const schema = { ...test };

export * from "drizzle-orm";

export function createDbClient(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

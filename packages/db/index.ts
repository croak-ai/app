import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as post from "./schema/post";

export const schema = { ...post };

export * from "drizzle-orm";

export function createDbClient(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

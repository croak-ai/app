import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as tenant from "./schema/tenant";

export const schema = { ...tenant };

export * from "drizzle-orm";

export function createDbClient(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

// DB client type
export type DBClientType = ReturnType<typeof createDbClient>;

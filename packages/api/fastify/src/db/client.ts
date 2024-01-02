import { createClient } from "@libsql/client";

const url = process.env.TURSO_DB_REPLICA_PATH || "";
const syncUrl = process.env.TURSO_DB_SYNC_URL || "";
const authToken = process.env.TURSO_DB_TOKEN || "";

const db = createClient({
  url,
  syncUrl,
  authToken,
});

await db.sync();

export default db;

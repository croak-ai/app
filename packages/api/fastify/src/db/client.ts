import { createClient } from "@libsql/client";

export * from "drizzle-orm";

const url = "file:src/db/sync/sync.db";
const syncUrl = "libsql://t-2zxiuje7ew7a907upsn1bftqtzr-walshington.turso.io";
const authToken =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJIb3hhQTVxdEVlNlVfMUpUaVV5UWFBIn0.ibkYKHvMvsVxamq6JxKJDIPiapbzOEBF07MmbQVITWOhvwD_CS7IdrBC_vfT6yyt_PO5Uhk4KR3rJ9cN2ySICg";

export const client = createClient({
  url,
  syncUrl,
  authToken,
});

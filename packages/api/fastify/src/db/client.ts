import { createClient } from "@libsql/client";

export * from "drizzle-orm";

const url = "file:src/db/sync/sync.db";
const syncUrl = "libsql://t-2zxiuje7ew7a907upsn1bftqtzr-walshington.turso.io";
// const authToken =
//   "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJIb3hhQTVxdEVlNlVfMUpUaVV5UWFBIn0.ibkYKHvMvsVxamq6JxKJDIPiapbzOEBF07MmbQVITWOhvwD_CS7IdrBC_vfT6yyt_PO5Uhk4KR3rJ9cN2ySICg";

const authToken =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJnaWQiOiJkNGNhZjhhYi05M2I5LTExZWUtYTM0MS02YWNiMmFlZjI4M2QiLCJpYXQiOiIyMDIzLTEyLTE5VDIyOjI3OjQ0LjI1NjQ3ODgyM1oifQ.QslOcv6KCqz7jYrg_LHpydzbR0nFuKaLBoPNoO7KDHKetYNtdvO2zuDWs7OI7oI19Wd0ljvgGjuxvh8fhgnxAg";
export const client = createClient({
  url,
  syncUrl,
  authToken,
});

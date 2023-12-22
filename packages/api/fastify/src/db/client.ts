import { createClient } from "@libsql/client";

const url = "file:src/db/sync/sync.db";
const syncUrl = "libsql://t-2zxiuje7ew7a907upsn1bftqtzr-walshington.turso.io";
const authToken =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJnaWQiOiJkNGNhZjhhYi05M2I5LTExZWUtYTM0MS02YWNiMmFlZjI4M2QiLCJpYXQiOiIyMDIzLTEyLTE5VDIyOjI3OjQ0LjI1NjQ3ODgyM1oifQ.QslOcv6KCqz7jYrg_LHpydzbR0nFuKaLBoPNoO7KDHKetYNtdvO2zuDWs7OI7oI19Wd0ljvgGjuxvh8fhgnxAg";

const db = createClient({
  url,
  syncUrl,
  authToken,
});

export default db;

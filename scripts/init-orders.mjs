import { Pool } from "pg";
import { ORDER_SCHEMA } from "../server/payments/core.ts";
process.loadEnvFile();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL eksik");
  await pool.query(ORDER_SCHEMA);
  console.log("Sipariş tablosu hazır.");
} catch {
  console.error("Sipariş tablosu hazırlanamadı. PostgreSQL bağlantısını kontrol edin.");
  process.exitCode = 1;
} finally {
  await pool.end();
}

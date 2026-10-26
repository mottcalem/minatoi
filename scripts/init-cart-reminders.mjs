import { Pool } from "pg";
import { CART_REMINDER_SCHEMA } from "../server/notifications/cartReminders.ts";
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL eksik");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
try {
  await pool.query(CART_REMINDER_SCHEMA);
  console.log("Sepet hatırlatma tabloları hazır.");
} finally {
  await pool.end();
}

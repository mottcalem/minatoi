// Update only the reviewed Zen pilot and the two existing sample products.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { Pool } from "pg";
import {
  readProductRows,
  writeProductRows,
  validateProducts,
} from "../server/utils/productRepository.ts";
process.loadEnvFile();
const premium = JSON.parse(
  await readFile(new URL("../data/imports/premium-cam-tablo.json", import.meta.url), "utf8"),
);
const pilot = JSON.parse(
  await readFile(new URL("../data/imports/zen-koleksiyonu.json", import.meta.url), "utf8"),
);
const targets = new Set([
  ...pilot.map((p) => p.slug),
  "miki-fare-afis-cam-tablo-af114",
  "karakalem-kara-kedi-cam-tablo-kd123",
]);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
const db = await pool.connect();
try {
  await db.query("BEGIN");
  await db.query("LOCK TABLE products IN ACCESS EXCLUSIVE MODE");
  const before = await readProductRows(db);
  assert.equal(before.filter((p) => targets.has(p.slug)).length, 21);
  const after = before.map((p) => (targets.has(p.slug) ? { ...p, ...premium } : p));
  validateProducts(after);
  const dir = new URL("../data/import-backups.local/", import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(
    new URL(`before-premium-${Date.now()}.json`, dir),
    JSON.stringify(before, null, 2),
  );
  await db.query(
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS size_prices jsonb CHECK (jsonb_typeof(size_prices) = 'array')",
  );
  await writeProductRows(db, after);
  assert.deepEqual(await readProductRows(db), after);
  await db.query("COMMIT");
  console.log(
    "Updated and verified 21 products: shared premium copy, six features, four size prices. Backup saved.",
  );
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  db.release();
  await pool.end();
}

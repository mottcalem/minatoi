import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { Pool } from "pg";
import {
  readProductRows,
  writeProductRows,
  validateProducts,
} from "../server/utils/productRepository.ts";
import { readCategoryRows } from "../server/utils/categoryRepository.ts";
import { priceCart } from "../server/payments/core.ts";
process.loadEnvFile();
const incoming = JSON.parse(
  await readFile(new URL("../data/imports/all-products.json", import.meta.url), "utf8"),
);
validateProducts(incoming);
assert.equal(incoming.length, 243);
for (const p of incoming) {
  assert.equal(p.images[0], p.image);
  assert.equal(p.features.length, 6);
  assert.equal(p.sizePrices.length, 4);
  for (const image of p.images)
    await readFile(new URL("../public" + decodeURIComponent(image), import.meta.url));
  for (const variant of p.sizePrices)
    assert.equal(
      priceCart([{ slug: p.slug, size: variant.size, quantity: 1 }], [p]).amount,
      variant.price * 100,
    );
}
if (!process.argv.includes("--apply")) {
  console.log(
    "Validated 243 unique products, all image paths, and all 972 size prices. Pass --apply to import.",
  );
  process.exit(0);
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
const db = await pool.connect();
try {
  await db.query("BEGIN");
  await db.query("LOCK TABLE products, categories IN SHARE ROW EXCLUSIVE MODE");
  const before = await readProductRows(db);
  const categories = await readCategoryRows(db);
  const backupDir = new URL("../data/import-backups.local/", import.meta.url);
  await mkdir(backupDir, { recursive: true });
  await writeFile(
    new URL(`before-full-import-${Date.now()}.json`, backupDir),
    JSON.stringify({ products: before, categories }, null, 2),
  );
  await db.query(
    "INSERT INTO categories(slug,label,description,position) SELECT 'genel','Genel','',COALESCE(MAX(position),-1)+1 FROM categories ON CONFLICT(slug) DO NOTHING",
  );
  await db.query(
    "UPDATE categories SET label='Patili Dostlara Özel' WHERE slug='patili-dostalara-ozel'",
  );
  const validCategories = new Set((await readCategoryRows(db)).map((c) => c.slug));
  assert(incoming.every((p) => validCategories.has(p.category)));
  const incomingBySlug = new Map(incoming.map((p) => [p.slug, p]));
  const previousSlugs = new Set(before.map((p) => p.slug));
  const merged = before.map((p) =>
    incomingBySlug.has(p.slug) ? { ...p, ...incomingBySlug.get(p.slug) } : p,
  );
  merged.push(...incoming.filter((p) => !previousSlugs.has(p.slug)));
  await writeProductRows(db, merged);
  const saved = await readProductRows(db);
  assert.deepEqual(saved, merged);
  assert.deepEqual(
    saved.filter((p) => !incomingBySlug.has(p.slug)),
    before.filter((p) => !incomingBySlug.has(p.slug)),
  );
  assert.equal(saved.filter((p) => incomingBySlug.has(p.slug)).length, 243);
  await db.query("COMMIT");
  console.log(
    JSON.stringify(
      {
        added: incoming.filter((p) => !previousSlugs.has(p.slug)).length,
        updated: incoming.filter((p) => previousSlugs.has(p.slug)).length,
        total: saved.length,
        categoryCounts: saved.reduce((counts, p) => {
          counts[p.category] = (counts[p.category] ?? 0) + 1;
          return counts;
        }, {}),
      },
      null,
      2,
    ),
  );
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  db.release();
  await pool.end();
}

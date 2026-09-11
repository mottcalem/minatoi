// Reviewed pilot only. Run with --apply to write to the configured database.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { validateProducts, readProductRows, writeProductRows } from '../server/utils/productRepository.ts';
process.loadEnvFile();
const incoming = JSON.parse(await readFile(new URL('../data/imports/zen-koleksiyonu.json', import.meta.url), 'utf8'));
validateProducts(incoming);
assert.equal(incoming.length, 19);
assert(incoming.every(p => p.category === 'zen-koleksiyonu' && p.images.length === 4 && p.image === p.images[0]));
for (const p of incoming) for (const url of p.images) await readFile(new URL('../public' + decodeURIComponent(url), import.meta.url));
if (!process.argv.includes('--apply')) { console.log('Validated 19 Zen products and 76 image paths. Use --apply to import.'); process.exit(0); }
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const db = await pool.connect();
try {
  await db.query('BEGIN');
  await db.query('LOCK TABLE products IN SHARE ROW EXCLUSIVE MODE');
  assert.equal((await db.query("SELECT slug FROM categories WHERE slug='zen-koleksiyonu'")).rowCount, 1);
  const before = await readProductRows(db);
  const bySlug = new Map(incoming.map(p => [p.slug, p]));
  const merged = before.map(p => bySlug.get(p.slug) ?? p);
  const existing = new Set(before.map(p => p.slug));
  merged.push(...incoming.filter(p => !existing.has(p.slug)));
  const backupDir = new URL('../data/import-backups.local/', import.meta.url);
  await mkdir(backupDir, { recursive: true });
  await writeFile(new URL(`products-${Date.now()}.json`, backupDir), JSON.stringify(before, null, 2));
  await writeProductRows(db, merged);
  const after = await readProductRows(db);
  assert.deepEqual(after, merged);
  assert.deepEqual(after.filter(p => !bySlug.has(p.slug)), before.filter(p => !bySlug.has(p.slug)));
  await db.query('COMMIT');
  console.log(`Imported ${incoming.length} Zen products; preserved ${before.filter(p => !bySlug.has(p.slug)).length} other products. Verified database round trip.`);
} catch (error) { await db.query('ROLLBACK'); throw error; }
finally { db.release(); await pool.end(); }

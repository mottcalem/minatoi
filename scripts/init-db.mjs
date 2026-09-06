import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import {
  PRODUCT_SCHEMA,
  readProductRows,
  writeProductRows,
  validateProducts,
} from "../server/utils/productRepository.ts";
import {
  ANNOUNCEMENT_SCHEMA,
  readAnnouncementRows,
  writeAnnouncementRows,
  validateAnnouncements,
} from "../server/utils/announcementRepository.ts";
import { DEFAULT_ANNOUNCEMENTS } from "../src/data/announcements.ts";
import {
  CATEGORY_SCHEMA,
  CATEGORY_IMAGE_MIGRATION,
  readCategoryRows,
  writeCategoryRows,
  validateCategories,
} from "../server/utils/categoryRepository.ts";
import { DEFAULT_CATEGORIES } from "../src/data/categories.ts";

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (!process.env.DATABASE_URL) throw new Error(".env dosyasına DATABASE_URL ekleyin.");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
let client;
try {
  client = await pool.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(17890505)");
  await client.query(`CREATE TABLE IF NOT EXISTS minatoi_content (
    key text PRIMARY KEY CHECK (key IN ('products', 'banners')),
    content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'array'),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await client.query("LOCK TABLE minatoi_content IN SHARE ROW EXCLUSIVE MODE");
  await client.query(PRODUCT_SCHEMA);
  await client.query("ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check");
  await client.query(ANNOUNCEMENT_SCHEMA);
  await client.query(CATEGORY_SCHEMA);
  await client.query(CATEGORY_IMAGE_MIGRATION);
  // Hero içerik satırı: anahtar listesini genişlet ve nesne (object) içeriğe izin ver.
  // DROP + ADD sırası tekrar çalıştırmaya güvenlidir (idempotent).
  await client.query(
    "ALTER TABLE minatoi_content DROP CONSTRAINT IF EXISTS minatoi_content_key_check",
  );
  await client.query(
    "ALTER TABLE minatoi_content DROP CONSTRAINT IF EXISTS minatoi_content_content_check",
  );
  await client.query(
    "ALTER TABLE minatoi_content ADD CONSTRAINT minatoi_content_key_check CHECK (key IN ('products', 'banners', 'hero'))",
  );
  await client.query(
    "ALTER TABLE minatoi_content ADD CONSTRAINT minatoi_content_content_check CHECK (jsonb_typeof(content) IN ('array', 'object'))",
  );
  const migration = "001_products_rows";
  const applied = await client.query("SELECT 1 FROM schema_migrations WHERE version=$1", [
    migration,
  ]);
  if (!applied.rowCount) {
    const existing = await client.query("SELECT count(*)::int AS count FROM products");
    if (existing.rows[0].count) throw new Error("products tablosu zaten dolu; üzerine yazılmadı.");
    const legacy = await client.query("SELECT content FROM minatoi_content WHERE key='products'");
    const source = legacy.rowCount
      ? legacy.rows[0].content
      : JSON.parse(await readFile(new URL("../public/products.json", import.meta.url), "utf8"));
    validateProducts(source);
    await writeProductRows(client, source);
    assert.deepStrictEqual(
      await readProductRows(client),
      source,
      "Ürün aktarımı kaynakla eşleşmedi.",
    );
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [migration]);
    console.log(`${source.length} ürün kayıpsız olarak satırlara dönüştürüldü.`);
  } else {
    console.log("Ürün şeması zaten güncel; var olan satırlar korundu.");
  }
  let banners = [];
  try {
    banners = JSON.parse(await readFile(new URL("../data/banners.json", import.meta.url), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  banners = banners.filter((banner) => banner.image !== "/images/banners/banner-minatoi.png");
  await client.query(
    "INSERT INTO minatoi_content (key, content) VALUES ('banners', $1::jsonb) ON CONFLICT (key) DO NOTHING",
    [JSON.stringify(banners)],
  );
  const announcementMigration = "002_announcements";
  const announcementApplied = await client.query(
    "SELECT 1 FROM schema_migrations WHERE version=$1",
    [announcementMigration],
  );
  if (!announcementApplied.rowCount) {
    const existing = await client.query("SELECT count(*)::int AS count FROM announcements");
    if (!existing.rows[0].count) {
      const legacy = await client.query(
        "SELECT content FROM minatoi_content WHERE key='announcements'",
      );
      if (legacy.rowCount) {
        validateAnnouncements(legacy.rows[0].content);
        await writeAnnouncementRows(client, legacy.rows[0].content);
        assert.deepStrictEqual(
          await readAnnouncementRows(client),
          legacy.rows[0].content,
          "Duyuru aktarımı kaynakla eşleşmedi.",
        );
        console.log("minatoi_content içindeki duyurular satırlara aktarıldı.");
      } else {
        await writeAnnouncementRows(client, DEFAULT_ANNOUNCEMENTS);
        console.log("Varsayılan duyurular eklendi.");
      }
    }
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [
      announcementMigration,
    ]);
  } else {
    console.log("Duyuru şeması zaten güncel; var olan satırlar korundu.");
  }
  const categoryMigration = "003_categories";
  const categoryApplied = await client.query("SELECT 1 FROM schema_migrations WHERE version=$1", [
    categoryMigration,
  ]);
  if (!categoryApplied.rowCount) {
    const existing = await client.query("SELECT count(*)::int AS count FROM categories");
    if (!existing.rows[0].count) {
      const legacy = await client.query(
        "SELECT content FROM minatoi_content WHERE key='categories'",
      );
      if (legacy.rowCount) {
        validateCategories(legacy.rows[0].content);
        await writeCategoryRows(client, legacy.rows[0].content);
        assert.deepStrictEqual(
          await readCategoryRows(client),
          legacy.rows[0].content,
          "Kategori aktarımı kaynakla eşleşmedi.",
        );
        console.log("minatoi_content içindeki kategoriler satırlara aktarıldı.");
      } else {
        await writeCategoryRows(client, DEFAULT_CATEGORIES);
        console.log("Varsayılan kategoriler eklendi.");
      }
    }
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [categoryMigration]);
  } else {
    console.log("Kategori şeması zaten güncel; var olan satırlar korundu.");
  }
  await client.query("COMMIT");
  const result =
    await client.query(`SELECT 'products' AS table_name, count(*)::int AS rows FROM products
    UNION ALL SELECT 'product_images', count(*)::int FROM product_images
    UNION ALL SELECT 'product_features', count(*)::int FROM product_features
    UNION ALL SELECT 'announcements', count(*)::int FROM announcements
    UNION ALL SELECT 'categories', count(*)::int FROM categories`);
  console.table(result.rows);
} catch (error) {
  if (client) await client.query("ROLLBACK");
  console.error("Veritabanı hazırlanamadı:", error.code ?? error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}

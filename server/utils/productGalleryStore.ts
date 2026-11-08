import { databaseConfigured, getPool } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_PRODUCT_GALLERY,
  type ProductGallerySettings,
} from "../../src/data/productGallery";
import { productGallerySchema } from "../../src/data/productGallerySchema";

const file = resolve(process.cwd(), "data", "product-gallery.json");
// Dedicated single-row settings table: existing installations need no manual migration.
async function database() {
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS product_gallery_settings (
    id integer PRIMARY KEY CHECK (id = 1), content jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  return pool;
}
export async function readProductGallery(): Promise<ProductGallerySettings> {
  if (databaseConfigured()) {
    const result = await (
      await database()
    ).query("SELECT content FROM product_gallery_settings WHERE id = 1");
    return result.rowCount
      ? productGallerySchema.parse(result.rows[0].content)
      : DEFAULT_PRODUCT_GALLERY;
  }
  try {
    return productGallerySchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_PRODUCT_GALLERY;
    throw error;
  }
}
export async function writeProductGallery(content: ProductGallerySettings) {
  const validated = productGallerySchema.parse(content);
  if (databaseConfigured()) {
    await (
      await database()
    ).query(
      `INSERT INTO product_gallery_settings (id, content) VALUES (1, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`,
      [JSON.stringify(validated)],
    );
    return;
  }
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(validated), "utf8");
  await rename(temporary, file);
}

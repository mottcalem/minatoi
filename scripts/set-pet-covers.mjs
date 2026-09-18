import assert from "node:assert/strict";
import { Pool } from "pg";
import { readProductRows, writeProductRows } from "../server/utils/productRepository.ts";

process.loadEnvFile();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const db = await pool.connect();

try {
  await db.query("BEGIN");
  await db.query("LOCK TABLE products IN SHARE ROW EXCLUSIVE MODE");
  const before = await readProductRows(db);
  const targets = before.filter((product) => product.category === "patili-dostalara-ozel");
  assert(targets.length > 0, "Patili Dostlara Özel ürünleri bulunamadı.");
  const after = before.map((product) => {
    if (product.category !== "patili-dostalara-ozel") return product;
    const cover = product.images.find((image) => /_1\.png$/i.test(image));
    assert(cover, `${product.name} için telefonlu kapak görseli bulunamadı.`);
    return { ...product, image: cover, images: [cover, ...product.images.filter((image) => image !== cover)] };
  });
  await writeProductRows(db, after);
  await db.query("COMMIT");
  console.log(`Updated ${targets.length} Patili Dostlara Özel cover images.`);
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  db.release();
  await pool.end();
}

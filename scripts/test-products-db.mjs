import { Pool } from "pg";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PRODUCT_SCHEMA, readProductRows, writeProductRows } from "../server/utils/productRepository.ts";

process.loadEnvFile();
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL eksik.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
let client;
try {
  client = await pool.connect();
  const original = await readProductRows(client);
  assert.ok(original.length, "Kontrol edilecek ürün yok.");
  await client.query("BEGIN");
  const schema = `product_test_${randomUUID().replaceAll("-", "")}`;
  await client.query(`CREATE SCHEMA ${schema}`);
  await client.query(`SET LOCAL search_path TO ${schema}`);
  await client.query(PRODUCT_SCHEMA);
  await writeProductRows(client, original);
  assert.deepStrictEqual(await readProductRows(client), original);
  console.log("PASS: Tüm mevcut alanların ve sıralamanın kayıpsız dönüşümü.");

  const first = original[0];
  const beforeId = (await client.query("SELECT id FROM products WHERE slug=$1", [first.slug])).rows[0].id;
  const changed = structuredClone(original);
  changed[0] = { ...changed[0], name: "Güncelleme kontrolü", price: 123.45, oldPrice: 150.99,
    badge: "", featured: false, images: ["/ikinci.jpg", "/ilk.jpg"], features: ["B", "A"] };
  await writeProductRows(client, changed);
  assert.deepStrictEqual(await readProductRows(client), changed);
  assert.equal((await client.query("SELECT id FROM products WHERE slug=$1", [first.slug])).rows[0].id, beforeId);
  console.log("PASS: Güncelleme, sabit ürün ID'si, ondalıklı fiyat ve görsel/özellik sırası.");

  const added = { ...first, slug: "integration-test", name: "Yeni ürün", features: [], images: [],
    wallet: { techSpecs: [{ label: "Boyut", value: "10 cm" }], materials: ["Deri"], care: [], boxContents: [], summary: [] },
    glasses: { series: "urban", techSpecs: [], filterInfo: { type: "G", category: "3", lightTransmission: "18%", notes: [] }, materials: [], care: [], usage: [], safety: [], boxContents: [], summary: [] } };
  const catalog = [added, ...changed.toReversed()];
  await writeProductRows(client, catalog);
  assert.deepStrictEqual(await readProductRows(client), catalog);
  console.log("PASS: Ürün ekleme, liste sırası ve isteğe bağlı detay alanları.");

  const absent = { ...first, slug: "optional-test" };
  for (const key of ["images", "oldPrice", "badge", "featured"]) delete absent[key];
  await writeProductRows(client, [absent]);
  assert.deepStrictEqual(await readProductRows(client), [absent]);
  assert.equal((await client.query("SELECT count(*)::int AS n FROM product_images")).rows[0].n, 0);
  assert.equal((await client.query("SELECT count(*)::int AS n FROM product_features")).rows[0].n, first.features.length);
  console.log("PASS: Silme, bağlı kayıtların temizlenmesi ve eksik alanların korunması.");

  await assert.rejects(writeProductRows(client, [absent, absent]), /tekrarlı/);
  await assert.rejects(writeProductRows(client, [{ ...absent, price: -1 }]), /fiyat/);
  await assert.rejects(writeProductRows(client, [{ ...absent, unexpected: true }]), /Desteklenmeyen/);
  assert.deepStrictEqual(await readProductRows(client), [absent]);

  await client.query("SAVEPOINT failed_write");
  await assert.rejects(writeProductRows(client, [{ ...absent, name: "Kaydedilmemeli", features: ["\u0000"] }]));
  await client.query("ROLLBACK TO SAVEPOINT failed_write");
  assert.deepStrictEqual(await readProductRows(client), [absent]);
  await client.query("SAVEPOINT foreign_key_check");
  await assert.rejects(client.query("INSERT INTO product_images VALUES (-1, 0, '/orphan.jpg')"), { code: "23503" });
  await client.query("ROLLBACK TO SAVEPOINT foreign_key_check");
  console.log("PASS: Hatalı verinin reddi, foreign key ve başarısız kaydın geri alınması.");

  await writeProductRows(client, []);
  assert.deepStrictEqual(await readProductRows(client), []);
  assert.equal((await client.query("SELECT count(*)::int AS n FROM product_features")).rows[0].n, 0);
  await client.query("ROLLBACK");
  assert.deepStrictEqual(await readProductRows(client), original);
  console.log("PASS: Boş katalog. Test şeması geri alındı; asıl ürün verileri değişmedi.");
} catch (error) {
  if (client) await client.query("ROLLBACK");
  console.error("Ürün veritabanı testi başarısız:", error.code ?? error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}

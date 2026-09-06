import { readProductRows, writeProductRows, validateProducts } from "./productRepository";
import { sanitizeRichText } from "./sanitizeHtml";
import { databaseConfigured, getPool, withTransaction } from "./database";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";

const ROOT = resolve(process.cwd());
const PUBLIC_JSON = resolve(ROOT, "public", "products.json");
const DATA_JSON = resolve(ROOT, "data", "products.json");

// Her iki konuma da yazar (senkron tutar)
export async function writeProducts(data: unknown): Promise<void> {
  validateProducts(data);
  // Rich text açıklamalar kayıt anında allowlist ile temizlenir.
  const sanitized = data.map((product: { description?: string } & Record<string, unknown>) => ({
    ...product,
    description: sanitizeRichText(product.description ?? ""),
  }));
  if (databaseConfigured()) {
    await withTransaction((client) => writeProductRows(client, sanitized));
    return;
  }
  const content = JSON.stringify(sanitized, null, 2);

  // public dizininin var olduğundan emin ol
  const publicDir = dirname(PUBLIC_JSON);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  await writeFile(PUBLIC_JSON, content, "utf-8");

  try {
    const dataDir = dirname(DATA_JSON);
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(DATA_JSON, content, "utf-8");
  } catch (e) {
    console.warn("[writeProducts] data/ write failed:", e);
  }
}

// İlk bulunan kaynaktan okur
export async function readProducts(): Promise<import("../../src/data/products").Product[]> {
  if (databaseConfigured()) return readProductRows(getPool());
  const paths = [PUBLIC_JSON, DATA_JSON];

  for (const p of paths) {
    try {
      const content = await readFile(p, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.log(`[readProducts] ${p} not found, trying next...`);
    }
  }

  console.warn("[readProducts] No products.json found, returning empty array");
  return [];
}

import type { PoolClient } from "pg";
import type { Product } from "../../src/data/products";

type Database = Pick<PoolClient, "query">;

export const PRODUCT_SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (length(slug) > 0),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  old_price numeric CHECK (old_price >= 0),
  image text NOT NULL,
  short_description text NOT NULL,
  description text NOT NULL,
  shopier_url text NOT NULL,
  badge text,
  featured boolean,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  images_present boolean NOT NULL DEFAULT true,
  sizes text[] NOT NULL DEFAULT '{}',
  wallet_details jsonb CHECK (jsonb_typeof(wallet_details) = 'object'),
  glasses_details jsonb CHECK (jsonb_typeof(glasses_details) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_sort_order_idx ON products(sort_order, id);
CREATE TABLE IF NOT EXISTS product_images (
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  image_url text NOT NULL,
  PRIMARY KEY (product_id, position)
);
CREATE TABLE IF NOT EXISTS product_features (
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  feature text NOT NULL,
  PRIMARY KEY (product_id, position)
);
CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`;

const supportedFields = new Set([
  "slug",
  "name",
  "category",
  "price",
  "oldPrice",
  "image",
  "images",
  "shortDescription",
  "description",
  "features",
  "sizes",
  "shopierUrl",
  "badge",
  "featured",
  "wallet",
  "glasses",
]);

export function validateProducts(data: unknown): asserts data is Product[] {
  if (!Array.isArray(data)) throw new Error("Ürün listesi geçersiz.");
  const slugs = new Set<string>();
  for (const item of data) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error("Ürün kaydı geçersiz.");
    if (Object.keys(item).some((key) => !supportedFields.has(key)))
      throw new Error(
        "Desteklenmeyen ürün alanı bulundu; veri kaybını önlemek için kayıt durduruldu.",
      );
    for (const field of [
      "slug",
      "name",
      "category",
      "image",
      "shortDescription",
      "description",
      "shopierUrl",
    ]) {
      if (typeof item[field] !== "string") throw new Error(`Ürün alanı geçersiz: ${field}`);
    }
    if (!item.slug || slugs.has(item.slug))
      throw new Error("Ürün adresleri boş veya tekrarlı olamaz.");
    slugs.add(item.slug);
    if (typeof item.category !== "string" || !item.category.trim())
      throw new Error("Ürün kategorisi geçersiz.");
    for (const field of ["price", "oldPrice"]) {
      if (field === "oldPrice" && item[field] === undefined) continue;
      if (typeof item[field] !== "number" || !Number.isFinite(item[field]) || item[field] < 0)
        throw new Error("Ürün fiyatı geçersiz.");
    }
    for (const field of ["images", "features"]) {
      if (field === "images" && item[field] === undefined) continue;
      if (
        !Array.isArray(item[field]) ||
        item[field].some((value: unknown) => typeof value !== "string")
      )
        throw new Error(`Ürün listesi geçersiz: ${field}`);
    }
    if (item.badge !== undefined && typeof item.badge !== "string")
      throw new Error("Ürün etiketi geçersiz.");
    if (item.featured !== undefined && typeof item.featured !== "boolean")
      throw new Error("Öne çıkan ürün bilgisi geçersiz.");
    if (
      item.sizes !== undefined &&
      (!Array.isArray(item.sizes) || item.sizes.some((s: unknown) => typeof s !== "string"))
    )
      throw new Error("Ölçü varyasyonları geçersiz.");
    for (const field of ["wallet", "glasses"]) {
      if (
        item[field] !== undefined &&
        (!item[field] || typeof item[field] !== "object" || Array.isArray(item[field]))
      )
        throw new Error("Ürün detayları geçersiz.");
    }
  }
}

export async function readProductRows(db: Database): Promise<Product[]> {
  const result = await db.query(`
    SELECT p.*,
      COALESCE((SELECT jsonb_agg(i.image_url ORDER BY i.position) FROM product_images i WHERE i.product_id = p.id), '[]'::jsonb) AS images,
      COALESCE((SELECT jsonb_agg(f.feature ORDER BY f.position) FROM product_features f WHERE f.product_id = p.id), '[]'::jsonb) AS features
    FROM products p ORDER BY p.sort_order, p.id
  `);
  return result.rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    shortDescription: row.short_description,
    description: row.description,
    shopierUrl: row.shopier_url,
    features: row.features,
    ...(row.images_present ? { images: row.images } : {}),
    ...(row.old_price !== null ? { oldPrice: Number(row.old_price) } : {}),
    ...(row.badge !== null ? { badge: row.badge } : {}),
    ...(row.featured !== null ? { featured: row.featured } : {}),
    ...(Array.isArray(row.sizes) && row.sizes.length ? { sizes: row.sizes } : {}),
    ...(row.wallet_details !== null ? { wallet: row.wallet_details } : {}),
    ...(row.glasses_details !== null ? { glasses: row.glasses_details } : {}),
  }));
}

// Caller owns the transaction: the complete catalog and child rows change atomically.
export async function writeProductRows(db: Database, data: unknown): Promise<void> {
  validateProducts(data);
  await db.query("LOCK TABLE products IN SHARE ROW EXCLUSIVE MODE");
  for (const [position, product] of data.entries()) {
    const result = await db.query(
      `
      INSERT INTO products (slug, name, category, price, old_price, image, short_description, description,
        shopier_url, badge, featured, sort_order, images_present, sizes, wallet_details, glasses_details)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::text[],$15::jsonb,$16::jsonb)
      ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category,
        price=EXCLUDED.price, old_price=EXCLUDED.old_price, image=EXCLUDED.image,
        short_description=EXCLUDED.short_description, description=EXCLUDED.description,
        shopier_url=EXCLUDED.shopier_url, badge=EXCLUDED.badge, featured=EXCLUDED.featured,
        sort_order=EXCLUDED.sort_order, images_present=EXCLUDED.images_present,
        sizes=EXCLUDED.sizes,
        wallet_details=EXCLUDED.wallet_details, glasses_details=EXCLUDED.glasses_details, updated_at=now()
      RETURNING id
    `,
      [
        product.slug,
        product.name,
        product.category,
        product.price,
        product.oldPrice ?? null,
        product.image,
        product.shortDescription,
        product.description,
        product.shopierUrl,
        product.badge ?? null,
        product.featured ?? null,
        position,
        product.images !== undefined,
        product.sizes ?? [],
        product.wallet ? JSON.stringify(product.wallet) : null,
        product.glasses ? JSON.stringify(product.glasses) : null,
      ],
    );
    const id = result.rows[0].id;
    await db.query("DELETE FROM product_images WHERE product_id=$1", [id]);
    await db.query("DELETE FROM product_features WHERE product_id=$1", [id]);
    await db.query(
      `INSERT INTO product_images (product_id, position, image_url)
      SELECT $1, ordinality - 1, value FROM unnest($2::text[]) WITH ORDINALITY AS items(value, ordinality)`,
      [id, product.images ?? []],
    );
    await db.query(
      `INSERT INTO product_features (product_id, position, feature)
      SELECT $1, ordinality - 1, value FROM unnest($2::text[]) WITH ORDINALITY AS items(value, ordinality)`,
      [id, product.features],
    );
  }
  await db.query("DELETE FROM products WHERE NOT (slug = ANY($1::text[]))", [
    data.map((product) => product.slug),
  ]);
}

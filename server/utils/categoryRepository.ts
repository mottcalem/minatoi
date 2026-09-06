import type { PoolClient } from "pg";

type Database = Pick<PoolClient, "query">;

export const CATEGORY_SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text NOT NULL CHECK (length(btrim(label)) > 0 AND length(label) <= 100),
  description text NOT NULL DEFAULT '',
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS categories_position_idx ON categories(position, slug);
`;

/** 003_categories sonrası eklenen kolon; mevcut kurulumlara idempotent uygulanır.
 * Kısıt her çalıştırmada yeniden kurulur (eski yol şemasından uploads yoluna geçiş için).
 * PostgreSQL ADD CONSTRAINT IF NOT EXISTS desteklemediği için DO bloğunda kurulur. */
export const CATEGORY_IMAGE_MIGRATION = String.raw`
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_image_check;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_image_check') THEN
    ALTER TABLE categories ADD CONSTRAINT categories_image_check
      CHECK (image IS NULL OR image ~ '^/images/uploads/categories/[a-z0-9-]+/[a-z0-9-]+[.](png|jpg|webp)$');
  END IF;
END $$;
`;

export function validateCategories(
  data: unknown,
): asserts data is { slug: string; label: string; description: string; image?: string }[] {
  if (!Array.isArray(data)) throw new Error("Kategori listesi geçersiz.");
  if (data.length > 30) throw new Error("En fazla 30 kategori eklenebilir.");
  const slugs = new Set<string>();
  for (const item of data) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error("Kategori kaydı geçersiz.");
    const { slug, label, description, image } = item as Record<string, unknown>;
    if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      throw new Error(`Kategori adresi geçersiz: ${String(slug)}`);
    if (typeof label !== "string" || !label.trim() || label.length > 100)
      throw new Error("Kategori adı 1-100 karakter olmalı.");
    if (typeof description !== "string" || description.length > 300)
      throw new Error("Kategori açıklaması 300 karakteri aşamaz.");
    if (
      image !== undefined &&
      image !== null &&
      (typeof image !== "string" ||
        !/^\/images\/uploads\/categories\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpg|webp)$/.test(image))
    )
      throw new Error(`Kategori görseli geçersiz: ${String(image)}`);
    if (slugs.has(slug)) throw new Error(`Kategori adresi tekrar edemez: ${slug}`);
    slugs.add(slug);
  }
}

export async function readCategoryRows(
  db: Database,
): Promise<{ slug: string; label: string; description: string; image?: string }[]> {
  const result = await db.query(
    "SELECT slug, label, description, image FROM categories ORDER BY position, slug",
  );
  return result.rows.map((row) => ({
    slug: row.slug,
    label: row.label,
    description: row.description,
    ...(row.image !== null ? { image: row.image } : {}),
  }));
}

// Caller owns the transaction: the full list is replaced atomically (last write wins).
export async function writeCategoryRows(
  db: Database,
  data: { slug: string; label: string; description: string; image?: string }[],
): Promise<void> {
  validateCategories(data);
  await db.query("LOCK TABLE categories IN SHARE ROW EXCLUSIVE MODE");
  await db.query("DELETE FROM categories");
  for (const [position, category] of data.entries()) {
    await db.query(
      "INSERT INTO categories (slug, label, description, image, position) VALUES ($1, $2, $3, $4, $5)",
      [
        category.slug,
        category.label.trim(),
        category.description,
        category.image ?? null,
        position,
      ],
    );
  }
}

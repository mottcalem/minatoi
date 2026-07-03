/*
# Create products table (single-tenant, no auth)

## Purpose
TheBullsCraft e-ticaret sitesi için ürün kataloğu tablosu.
Admin panel ürün ekleyip/siler/günceller, tüm ziyaretçiler güncel listeyi görür.
Auth yok — site herkese açık, admin panel ayrı bir şifre korumasıyla çalışır.

## New Tables
- `products`
  - `slug` (text, primary key) — URL-friendly ürün kimliği
  - `name` (text, not null) — ürün adı
  - `category` (text, not null) — "gozluk" | "kilif" | "cuzdan"
  - `price` (integer, not null) — TL fiyat
  - `old_price` (integer, nullable) — eski fiyat (indirim gösterimi için)
  - `image` (text, not null) — ana görsel URL
  - `images` (jsonb, nullable) — ek görsel URL'leri array
  - `short_description` (text, not null) — kart listesinde görünen kısa açıklama
  - `description` (text, not null) — detay sayfasında görünen uzun açıklama
  - `features` (jsonb, not null default '[]') — özellik listesi array
  - `shopier_url` (text, not null) — Shopier satın alma linki
  - `badge` (text, nullable) — "Yeni", "Çok Satan" vb.
  - `glasses` (jsonb, nullable) — gözlük detayları (techSpecs, filterInfo, materials, care, usage, safety, boxContents, summary)
  - `wallet` (jsonb, nullable) — cüzdan detayları (techSpecs, materials, care, boxContents, summary)
  - `sort_order` (integer, not null default 0) — görüntüleme sırası
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS etkin.
- Tüm CRUD anon + authenticated'ye açık — site herkese açık (single-tenant, no auth).
- Admin panel ayrı bir client-side şifre korumasıyla çalışır; DB seviyesinde auth yok.

## Notes
1. `images`, `features`, `glasses`, `wallet` alanları JSONB olarak saklanır — frontend Product tipiyle birebir eşleşir.
2. `sort_order` ile admin panel ürün sıralamasını kontrol edebilir.
3. `updated_at` trigger'ı ile otomatik güncellenir.
*/

CREATE TABLE IF NOT EXISTS products (
  slug text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('gozluk', 'kilif', 'cuzdan')),
  price integer NOT NULL CHECK (price >= 0),
  old_price integer,
  image text NOT NULL,
  images jsonb,
  short_description text NOT NULL,
  description text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  shopier_url text NOT NULL,
  badge text,
  glasses jsonb,
  wallet jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tüm okuma herkese açık (site herkese açık)
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Yazma da herkese açık (admin panel client-side şifreyle korunuyor, DB'de auth yok)
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
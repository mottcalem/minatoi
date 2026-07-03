/**
 * Ürün veri katmanı — Supabase REST API-backed.
 *
 * Tüm okuma/yazma Supabase `products` tablosundan yapılır.
 * Hem SSR hem client-side navigation'da çalışır.
 * Ekstra npm bağımlılığı yok — doğrudan fetch kullanır.
 */

import { supabaseSelect, supabaseInsert, supabaseDeleteAll } from "@/lib/supabase";
import type { Product, Category } from "./products";

export type { Product, Category };

// ─── DB satır tipi ──────────────────────────────────────────────────────────

type ProductRow = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  old_price: number | null;
  image: string;
  images: string[] | null;
  short_description: string;
  description: string;
  features: string[];
  shopier_url: string;
  badge: string | null;
  glasses: unknown | null;
  wallet: unknown | null;
  sort_order: number;
};

function rowToProduct(r: ProductRow): Product {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category,
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    image: r.image,
    images: r.images ?? undefined,
    shortDescription: r.short_description,
    description: r.description,
    features: r.features ?? [],
    shopierUrl: r.shopier_url,
    badge: r.badge ?? undefined,
    glasses: (r.glasses as Product["glasses"]) ?? undefined,
    wallet: (r.wallet as Product["wallet"]) ?? undefined,
  };
}

function productToRow(p: Product, sort_order: number): ProductRow {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice ?? null,
    image: p.image,
    images: p.images ?? null,
    short_description: p.shortDescription,
    description: p.description,
    features: p.features,
    shopier_url: p.shopierUrl,
    badge: p.badge ?? null,
    glasses: (p.glasses as Record<string, unknown>) ?? null,
    wallet: (p.wallet as Record<string, unknown>) ?? null,
    sort_order,
  };
}

// ─── Okuma ──────────────────────────────────────────────────────────────────

export async function fetchProductsServer(): Promise<Product[]> {
  return fetchProducts();
}

export async function fetchProducts(): Promise<Product[]> {
  const rows = await supabaseSelect<ProductRow>("products", {
    order: { column: "sort_order", ascending: true },
  });
  return rows.map(rowToProduct);
}

// ─── Yazma (admin) ──────────────────────────────────────────────────────────

export async function saveProducts(
  products: Product[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Tüm tabloyu temizle ve yeniden yaz (admin panel tüm listeyi yönetir)
    const del = await supabaseDeleteAll("products");
    if (!del.ok) return del;

    if (products.length > 0) {
      const rows = products.map((p, i) => productToRow(p, i));
      const ins = await supabaseInsert("products", rows);
      if (!ins.ok) return ins;
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const EMPTY_PRODUCT: Omit<Product, "slug"> = {
  name: "",
  category: "cuzdan" as Category,
  price: 0,
  image: "",
  images: [],
  shortDescription: "",
  description: "",
  features: [],
  shopierUrl: "https://www.shopier.com/thebullscraft",
};

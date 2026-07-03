/**
 * Ürün listesini /api/products endpoint'inden çeker.
 * Admin panel kayıt ettiğinde aynı endpoint'e yazar → sunucuda products.json güncellenir
 * → tüm ziyaretçiler yenilediğinde güncel listeyi görür.
 */

import type { Product, Category } from "./products";

export type { Product, Category };

const API_URL = "/api/products";

// ─── Okuma ──────────────────────────────────────────────────────────────────

export async function fetchProductsServer(): Promise<Product[]> {
  return fetchProducts();
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Product[];
  } catch {
    return [];
  }
}

// ─── Yazma (admin) ──────────────────────────────────────────────────────────

export async function saveProducts(
  products: Product[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = localStorage.getItem("admin_token") ?? "";
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(products),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `${res.status}: ${body}` };
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

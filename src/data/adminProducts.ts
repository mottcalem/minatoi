/**
 * Ürün veri katmanı.
 *
 * fetchProductsServer() hem SSR (Node.js) hem client-side navigation'da çalışır:
 *   - Sunucu: fs.readFile ile public/products.json okunur
 *   - Tarayıcı: fetch("/products.json") ile okunur
 *
 * saveProducts() production'da POST /api/products ile dosyayı günceller.
 */

import type { Product, Category } from "./products";

export type { Product, Category };

// ─── Ana veri okuma fonksiyonu — her ortamda çalışır ────────────────────────

export async function fetchProductsServer(): Promise<Product[]> {
  // Tarayıcıda mıyız?
  if (typeof window !== "undefined") {
    return fetchProducts();
  }

  // Node.js (SSR) ortamı
  try {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const paths = [
      resolve(process.cwd(), "public", "products.json"),
      resolve(process.cwd(), "data",   "products.json"),
    ];
    for (const p of paths) {
      try {
        const raw = await readFile(p, "utf-8");
        return JSON.parse(raw) as Product[];
      } catch { /* sonrakini dene */ }
    }
  } catch { /* fs yok */ }
  return [];
}

// ─── Client fetch — /products.json static dosyasından ───────────────────────

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/products.json", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return [];
    return res.json() as Promise<Product[]>;
  } catch {
    return [];
  }
}

// ─── Admin: kayıt — POST /api/products ──────────────────────────────────────

function getAuthToken(): string {
  try {
    const raw = sessionStorage.getItem("thebulls_admin_session");
    if (!raw) return "";
    const { passHash } = JSON.parse(raw) as { passHash?: string };
    return passHash ?? "";
  } catch {
    return "";
  }
}

export async function saveProducts(
  products: Product[],
): Promise<{ ok: boolean; error?: string }> {
  const token = getAuthToken();
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(products),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: (data as { error?: string }).error ?? "Sunucu hatası" };
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

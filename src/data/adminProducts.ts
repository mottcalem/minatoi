/**
 * Ürün listesini yönetir.
 *
 * fetchProductsServer → SSR loader'larında çağrılır.
 *   - Sunucu ortamında (typeof window === 'undefined') HTTP yapmak yerine
 *     doğrudan dosya sisteminden okur → ilk sayfa yüklemesinde görsel gelir.
 *   - Tarayıcıda çağrılırsa /api/products endpoint'ini kullanır.
 *
 * fetchProducts → client-side (admin reload vb.) kullanımı için.
 *
 * Admin panel kayıt ettiğinde saveProducts → /api/products POST → sunucuda
 * products.json güncellenir → tüm ziyaretçiler sayfayı yenilediğinde görür.
 */

import type { Product, Category } from "./products";

export type { Product, Category };

const API_URL = "/api/products";

// ─── Dosya okuma yardımcısı (yalnızca sunucu ortamında çalışır) ─────────────

async function readProductsFromDisk(): Promise<Product[] | null> {
  try {
    // Node.js modüllerini dinamik olarak import et (tarayıcıda bu path asla çalışmaz)
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");

    const root = resolve(process.cwd());
    const paths = [
      resolve(root, "public", "products.json"),
      resolve(root, "data", "products.json"),
    ];

    for (const p of paths) {
      try {
        const raw = await readFile(p, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          console.log(`[fetchProductsServer] Loaded ${parsed.length} products from ${p}`);
          return parsed as Product[];
        }
      } catch {
        // Bir sonrakini dene
      }
    }
  } catch {
    // Tarayıcıda node:fs import edilemez, bu tamam
  }
  return null;
}

// ─── Okuma ──────────────────────────────────────────────────────────────────

/**
 * SSR loader'larında kullanılır. Sunucuda dosyadan, istemcide API'den okur.
 */
export async function fetchProductsServer(): Promise<Product[]> {
  // Sunucu ortamı: doğrudan diskten oku (relative fetch SSR'de çalışmaz)
  if (typeof window === "undefined") {
    const fromDisk = await readProductsFromDisk();
    if (fromDisk !== null) return fromDisk;
    console.warn("[fetchProductsServer] Disk read failed, falling back to empty list");
    return [];
  }
  // Tarayıcı ortamı: API'yi kullan
  return fetchProducts();
}

/**
 * Client-side kullanımı için (admin reload vb.)
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`[fetchProducts] API failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[fetchProducts] Error:", err);
    return [];
  }
}

// ─── Yazma (admin) ──────────────────────────────────────────────────────────

/**
 * Token okuma yardımcısı — localStorage ve sessionStorage'dan passHash'i alır
 */
function getAdminToken(): string {
  // Önce localStorage'dan dene (yeni sistem)
  const fromLocal = localStorage.getItem("admin_token");
  if (fromLocal) return fromLocal;
  
  // Yoksa sessionStorage'dan session payload'ını parse et (eski sistem)
  try {
    const sessionKey = "thebulls_admin_session";
    const raw = sessionStorage.getItem(sessionKey);
    if (raw) {
      const { passHash } = JSON.parse(raw) as { passHash: string };
      if (passHash) return passHash;
    }
  } catch (err) {
    console.warn("[getAdminToken] sessionStorage parse error:", err);
  }
  
  return "";
}

export async function saveProducts(
  products: Product[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = getAdminToken();
    
    if (!token) {
      console.error("[saveProducts] No auth token found");
      return { ok: false, error: "401: No authentication token. Please login again." };
    }
    
    console.log("[saveProducts] Sending request with token:", token.substring(0, 8) + "...");
    
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
      console.error("[saveProducts] Request failed:", res.status, body);
      return { ok: false, error: `${res.status}: ${body}` };
    }

    console.log("[saveProducts] Success!");
    return { ok: true };
  } catch (e) {
    console.error("[saveProducts] Exception:", e);
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

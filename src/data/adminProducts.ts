import { createServerFn } from "@tanstack/react-start";
import type { Product, Category } from "./products";

export type { Product, Category };



export const fetchProductsServer = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const { readProducts } = await import("../../server/utils/productStore");
  return readProducts();
});

/**
 * Client-side kullanımı için (admin reload vb.)
 */
export async function fetchProducts(): Promise<Product[]> {
  return fetchProductsServer();
}

const persistProducts = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; products: Product[] }) => {
    if (!data || typeof data.token !== "string" || !Array.isArray(data.products)) {
      throw new Error("Geçersiz ürün verisi.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    const { writeProducts } = await import("../../server/utils/productStore");
    await writeProducts(data.products);
    return { ok: true };
  });

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



    await persistProducts({ data: { token, products } });
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
  shopierUrl: "https://www.shopier.com/minatoi",
};

import { catalogProducts } from "./catalog";
import { createServerFn } from "@tanstack/react-start";
import type { Product, Category } from "./products";

export type { Product, Category };

export const fetchProductsServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const { readProducts } = await import("../../server/utils/productStore");
    const { CUSTOM_PRODUCTS } = await import("./customProducts");
    return catalogProducts(await readProducts(), CUSTOM_PRODUCTS).storefront;
  },
);

// Yönetim yalnızca kalıcı katalog kayıtlarını düzenler. Sanal sipariş şablonları
// kataloğa karıştırılırsa tüm listeyi kaydeden doğrulama başarısız olur.
export const fetchManagedProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const { readProducts } = await import("../../server/utils/productStore");
    const { managedArtistProducts } = await import("./artists");
    const { managedPersonalProducts } = await import("./customProducts");
    return managedPersonalProducts(
      managedArtistProducts(catalogProducts(await readProducts(), []).managed),
    );
  },
);

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
    const { isAdminToken } = await import("../../server/utils/adminAuth");
    if (!(await isAdminToken(data.token)))
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
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
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) return token;
    }
  } catch (err) {
    console.warn("[getAdminToken] sessionStorage parse error:", err);
  }

  return "";
}

export async function saveProducts(products: Product[]): Promise<{ ok: boolean; error?: string }> {
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
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const EMPTY_PRODUCT: Omit<Product, "slug"> = {
  name: "",
  category: "kilif" as Category,
  price: 0,
  image: "",
  images: [],
  shortDescription: "",
  description: "",
  features: [],
};

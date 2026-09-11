import { productInCategory } from "@/data/productCategories";
import { OrderManager } from "@/components/OrderManager";
import { BannerManager } from "@/components/BannerManager";
import { AnnouncementManager } from "@/components/AnnouncementManager";
import { CategoryManager } from "@/components/CategoryManager";
import { HeroManager } from "@/components/HeroManager";
import { AboutManager } from "@/components/AboutManager";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageUploader } from "@/components/ImageUploader";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { formatTL, type Product } from "@/data/products";
import {
  fetchProducts,
  fetchProductsServer,
  saveProducts,
  generateSlug,
  EMPTY_PRODUCT,
} from "@/data/adminProducts";
import { getCategories } from "@/data/categoryActions";
import { adminLogin, adminLogout, isAdminLoggedIn } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — MinaToi" }] }),
  loader: async () => {
    const products = await fetchProductsServer();
    return { initialProducts: products };
  },
  component: AdminRoot,
});

type AdminTab =
  "orders" | "products" | "categories" | "announcements" | "banners" | "hero" | "about";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "orders", label: "Siparişler" },
  { id: "products", label: "Ürün Yönetimi" },
  { id: "categories", label: "Kategoriler" },
  { id: "announcements", label: "Duyuru Bandı" },
  { id: "banners", label: "Anasayfa Slider" },
  { id: "hero", label: "Hero Bölümü" },
  { id: "about", label: "Tanıtım Bölümü" },
];

/** Kategori listesi yüklenene kadar kullanılan yedek seçenekler. */
const FALLBACK_CATEGORIES: { slug: string; label: string }[] = [
  { slug: "cuzdan", label: "Cüzdan & Kartlık" },
  { slug: "kilif", label: "Gözlük Kılıfı" },
  { slug: "gozluk", label: "Gözlük" },
];

// ─── Auth guard ─────────────────────────────────────────────────────────────

function AdminRoot() {
  const { initialProducts } = Route.useLoaderData();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    setLoggedIn(isAdminLoggedIn());
  }, []);
  if (loggedIn === null) return null;
  if (!loggedIn) return <LoginPage onSuccess={() => setLoggedIn(true)} />;
  return (
    <AdminPage
      initialProducts={initialProducts}
      onLogout={() => {
        adminLogout();
        setLoggedIn(false);
      }}
    />
  );
}

// ─── Login ──────────────────────────────────────────────────────────────────

function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await adminLogin(username.trim(), password);
      if (result.ok) {
        onSuccess();
      } else if (result.error === "env_not_configured") {
        setError("Sistem yapılandırması eksik. .env dosyasını kontrol edin.");
      } else {
        setError("Kullanıcı adı veya şifre hatalı.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src="/images/logo-minatoi.jpg"
            alt="MinaToi"
            width={600}
            height={155}
            className="h-auto w-48 object-contain"
          />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-stone-900">MinaToi</p>
            <p className="text-xs uppercase tracking-widest text-stone-400">Admin Panel</p>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-xl font-bold text-stone-900">Güvenli Giriş</h1>
          <p className="mt-1 text-sm text-stone-500">
            Devam etmek için kimlik bilgilerinizi girin.
          </p>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                Kullanıcı Adı
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition"
                placeholder="Kullanıcı adınız"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-600">Şifre</span>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-11 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                  aria-label={showPass ? "Gizle" : "Göster"}
                >
                  {showPass ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-stone-400">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Siteye Dön
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Yardımcı bileşenler ────────────────────────────────────────────────────

function Badge({ children, color = "stone" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    stone: "bg-stone-100 text-stone-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color] ?? colors.stone}`}
    >
      {children}
    </span>
  );
}

const CAT_COLORS: Record<string, string> = { cuzdan: "amber", kilif: "green", gozluk: "blue" };
/** Bilinen kategorilerin Türkçe etiketleri; dinamik kategoriler doğrudan adıyla gösterilir. */
const CAT_LABELS: Record<string, string> = {
  cuzdan: "Cüzdan & Kartlık",
  kilif: "Gözlük Kılıfı",
  gozluk: "Gözlük",
};

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-stone-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-xl border ${error ? "border-red-400" : "border-stone-200"} bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition`;
}

// ─── Ürün formu ─────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  slug: string;
  category: string;
  price: string;
  oldPrice: string;
  images: string[];
  shortDescription: string;
  description: string;
  features: string;
  /** Ölçü varyasyonları; her satır bir ölçü (ör. "25*35 cm"). */
  sizes: string;
  sizePrices: string;
  shopierUrl: string;
  badge: string;
};

function productToForm(p: Partial<Product>, isNew = false): FormState {
  const gallery = p.images?.length ? p.images : p.image ? [p.image] : [];
  return {
    name: p.name ?? "",
    slug: p.slug ?? "",
    category: isNew ? "" : (p.category ?? ""),
    price: p.price ? String(p.price) : "",
    oldPrice: p.oldPrice ? String(p.oldPrice) : "",
    images: gallery,
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    features: p.features?.join("\n") ?? "",
    sizes: p.sizes?.join("\n") ?? "",
    sizePrices:
      p.sizePrices?.map((v) => `${v.size} | ${v.price} | ${v.oldPrice ?? ""}`).join("\n") ?? "",
    shopierUrl: p.shopierUrl ?? "https://www.shopier.com/minatoi",
    badge: p.badge ?? "",
  };
}

function formToProduct(form: FormState, existingFeatured?: boolean): Product {
  const images = form.images.filter(Boolean);
  return {
    slug: generateSlug(form.slug.trim() || form.name),
    name: form.name.trim(),
    category: form.category,
    price: Number(form.price) || 0,
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    image: images[0] ?? "",
    images,
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    features: form.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    sizes: form.sizes
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    ...(form.sizePrices.trim()
      ? {
          sizePrices: form.sizePrices
            .trim()
            .split("\n")
            .map((line) => {
              const [size, price, oldPrice] = line.split("|").map((s) => s.trim());
              return {
                size,
                price: Number(price),
                ...(oldPrice ? { oldPrice: Number(oldPrice) } : {}),
              };
            }),
        }
      : {}),
    shopierUrl: form.shopierUrl.trim(),
    badge: form.badge.trim() || undefined,
    featured: existingFeatured,
  };
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(productToForm(initial ?? EMPTY_PRODUCT, !initial));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [categories, setCategories] =
    useState<{ slug: string; label: string }[]>(FALLBACK_CATEGORIES);
  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active && data.length) setCategories(data.map(({ slug, label }) => ({ slug, label })));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "İsim zorunludur.";
    if (!form.slug.trim() && !form.name.trim()) e.slug = "URL adresi için ürün adı giriniz.";
    if (!form.category) e.category = "Kategori seçiniz.";
    if (!form.price || Number(form.price) <= 0) e.price = "Geçerli bir fiyat giriniz.";
    if (!form.images.length) e.images = "En az bir görsel yükleyin.";
    if (!form.shortDescription.trim()) e.shortDescription = "Kısa açıklama zorunludur.";
    if (form.sizePrices.trim()) {
      const sizes = form.sizes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const variants = formToProduct(form).sizePrices!;
      if (
        variants.length !== sizes.length ||
        new Set(sizes).size !== sizes.length ||
        variants.some(
          (v, i) =>
            v.size !== sizes[i] ||
            !Number.isFinite(v.price) ||
            v.price <= 0 ||
            (v.oldPrice !== undefined && (!Number.isFinite(v.oldPrice) || v.oldPrice < v.price)),
        )
      )
        e.sizePrices = "Her ölçüyü aynı sırada, geçerli satış ve eski fiyatıyla giriniz.";
      if (
        variants[0] &&
        (variants[0].price !== Number(form.price) ||
          variants[0].oldPrice !== (form.oldPrice ? Number(form.oldPrice) : undefined))
      )
        e.sizePrices = "Ürün fiyatı ve eski fiyatı ilk ölçünün fiyatlarıyla aynı olmalı.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(formToProduct(form, initial?.featured));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Ürün Adı *" error={errors.name}>
          <input
            className={inputCls(errors.name)}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ör. SOKRATES — Klasik Deri Cüzdan"
          />
        </FormField>
        <FormField label="URL adresi" error={errors.slug}>
          <input
            className={inputCls(errors.slug)}
            value={form.slug}
            onChange={(e) => set("slug", generateSlug(e.target.value))}
            placeholder="ör. miki-fare-afis-cam-tablo-af114"
          />
          <p className="mt-1 text-xs text-stone-400">
            Ürün bağlantısında kullanılacak adres. Boş bırakılırsa ürün adından oluşturulur.
          </p>
        </FormField>
        <FormField label="Kategori *" error={errors.category}>
          <select
            className={inputCls(errors.category)}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Fiyat (₺) *" error={errors.price}>
          <input
            className={inputCls(errors.price)}
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="890"
          />
        </FormField>
        <FormField label="Eski Fiyat (₺) — opsiyonel">
          <input
            className={inputCls()}
            type="number"
            min="0"
            value={form.oldPrice}
            onChange={(e) => set("oldPrice", e.target.value)}
            placeholder="1190 (varsa)"
          />
        </FormField>
        <FormField label="Badge — opsiyonel">
          <input
            className={inputCls()}
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="ör. Yeni, Çok Satan, Premium"
          />
        </FormField>
        <FormField label="Shopier URL">
          <input
            className={inputCls()}
            value={form.shopierUrl}
            onChange={(e) => set("shopierUrl", e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Ölçü Varyasyonları — opsiyonel">
        <textarea
          className={inputCls()}
          rows={3}
          value={form.sizes}
          onChange={(e) => set("sizes", e.target.value)}
          placeholder={"Her satıra bir ölçü yazın, örn.:\n25*35 cm\n35*50 cm\n50*70 cm"}
        />
        <p className="mt-1 text-xs text-stone-400">
          Girildiğinde ürün sayfasında seçilebilir ölçü butonları görünür; boşsa ürün tek ölçü kabul
          edilir.
        </p>
      </FormField>
      <FormField label="Ölçü Fiyatları — opsiyonel" error={errors.sizePrices}>
        <textarea
          className={inputCls(errors.sizePrices)}
          rows={4}
          value={form.sizePrices}
          onChange={(e) => set("sizePrices", e.target.value)}
          placeholder={"25*35 cm | 610 | 920\n35*50 cm | 990 | 1250"}
        />
        <p className="mt-1 text-xs text-stone-400">
          Her satır: ölçü | satış fiyatı | eski fiyat. Ölçülerle aynı sırada giriniz. Boşsa tüm
          ölçüler ürün fiyatını kullanır.
        </p>
      </FormField>
      <FormField label="Görseller *" error={errors.images}>
        <ImageUploader
          value={form.images}
          onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
          slug={initial?.slug ?? generateSlug(form.name)}
        />
        <p className="mt-1 text-xs text-stone-400">
          İlk görsel ana görsel (kapak) olur. Sürükleyerek sırayı değiştirebilirsiniz.
        </p>
      </FormField>
      <FormField label="Kısa Açıklama *" error={errors.shortDescription}>
        <textarea
          className={inputCls(errors.shortDescription)}
          rows={2}
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="Kart listesinde görünen 1-2 cümle"
        />
      </FormField>
      <FormField label="Tam Açıklama">
        <RichTextEditor
          value={form.description}
          onChange={(html) => set("description", html)}
          placeholder="Ürün detay sayfasında görünen uzun açıklama. Kalın, italik, başlık ve liste biçimlerini kullanabilirsiniz."
        />
      </FormField>
      <FormField label="Özellikler (her satıra bir özellik)">
        <textarea
          className={inputCls() + " font-mono text-xs"}
          rows={5}
          value={form.features}
          onChange={(e) => set("features", e.target.value)}
          placeholder="%100 hakiki deri, el dikişi&#10;6 kart gözü&#10;RFID koruma"
        />
      </FormField>
      <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
        <button
          type="submit"
          className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
        >
          {initial ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

// ─── Ana admin sayfası ──────────────────────────────────────────────────────

function AdminPage({
  initialProducts,
  onLogout,
}: {
  initialProducts: Product[];
  onLogout: () => void;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<AdminTab>("products");
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formInitial, setFormInitial] = useState<Product | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pageCategories, setPageCategories] =
    useState<{ slug: string; label: string }[]>(FALLBACK_CATEGORIES);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dinamik kategoriler; Kategoriler sekmesinde kaydetme sonrası da yenilenir.
  const reloadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      // Boş liste meşru bir durumdur (tüm kategoriler silinmiş olabilir);
      // yalnızca istek hata verirse yedek liste kalır.
      setPageCategories(data.map(({ slug, label }) => ({ slug, label })));
    } catch {
      /* yedek liste kalır */
    }
  }, []);

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // Kayıt sonrası güncel listeyi server'dan çek
  const reloadProducts = useCallback(async () => {
    const data = await fetchProducts();
    setProducts(data);
  }, []);

  // Ürün listesini API'ye kaydet ve sonra yenile
  async function persist(updated: Product[], successMsg: string) {
    setSaving(true);

    const result = await saveProducts(updated);
    setSaving(false);
    if (result.ok) {
      await reloadProducts();
      window.dispatchEvent(new Event("products-saved"));
      showToast(successMsg, "ok");
    } else {
      console.error("[Admin] Save failed:", result.error);
      const errMsg = result.error?.includes("401")
        ? "Yetki hatası. Lütfen tekrar giriş yapın."
        : result.error?.includes("Unauthorized")
          ? "Yetki hatası. Şifre değişti mi? Tekrar giriş yapın."
          : `Kayıt başarısız: ${result.error}`;
      showToast(errMsg, "err");
    }
  }

  async function handleSave(p: Product) {
    const slugConflict = products.some(
      (product) => product.slug === p.slug && product.slug !== editing?.slug,
    );
    if (slugConflict) {
      showToast("Bu URL adresi başka bir üründe kullanılıyor.", "err");
      return;
    }
    let updated: Product[];
    if (editing) {
      updated = products.map((x) => (x.slug === editing.slug ? p : x));
    } else {
      updated = [...products, p];
    }
    await persist(updated, editing ? `"${p.name}" güncellendi.` : `"${p.name}" eklendi.`);
    setMode("list");
    setEditing(null);
    setFormInitial(null);
  }

  async function handleDelete(slug: string) {
    const updated = products.filter((p) => p.slug !== slug);
    await persist(updated, "Ürün silindi.");
    setConfirmDelete(null);
  }

  async function handleSetFeatured(slug: string) {
    const updated = products.map((p) => ({ ...p, featured: p.slug === slug ? true : undefined }));
    await persist(updated, "Öne çıkan ürün güncellendi.");
  }

  function handleClone(product: Product) {
    const cloneName = `${product.name} - Kopya`;
    const baseSlug = generateSlug(cloneName);
    let cloneSlug = baseSlug;
    let suffix = 2;
    while (products.some((item) => item.slug === cloneSlug)) {
      cloneSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    setEditing(null);
    setFormInitial({ ...product, name: cloneName, slug: cloneSlug });
    setMode("add");
  }

  const filtered =
    filterCat === "all" ? products : products.filter((p) => productInCategory(p, filterCat));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-elegant ${toast.type === "ok" ? "bg-stone-900" : "bg-red-600"}`}
        >
          {toast.type === "ok" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-elegant border border-stone-100">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-stone-700">Sunucuya kaydediliyor…</span>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-elegant">
            <h3 className="font-display text-lg font-bold text-stone-900">Ürünü sil?</h3>
            <p className="mt-2 text-sm text-stone-500">
              Bu işlem geri alınamaz ve sunucuya kaydedilir.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Evet, Sil
              </button>
              <button onClick={() => setConfirmDelete(null)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {mode !== "list" && (
              <>
                <button
                  onClick={() => {
                    setMode("list");
                    setEditing(null);
                  }}
                  className="text-xs text-stone-400 hover:text-primary transition-colors"
                >
                  ← Panele Dön
                </button>
                <span className="text-stone-200">|</span>
              </>
            )}
            <Link to="/" className="text-xs text-stone-400 hover:text-primary transition-colors">
              ← Siteye Dön
            </Link>
            <span className="text-stone-200">|</span>
            <button
              onClick={onLogout}
              className="text-xs text-stone-400 hover:text-red-600 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-stone-500">
            {loading
              ? "Yükleniyor…"
              : `${products.length} ürün · Değişiklikler sunucuya kaydedilir, tüm ziyaretçiler görür.`}
          </p>
        </div>
        {tab === "products" && mode === "list" && (
          <button
            onClick={() => {
              setFormInitial(null);
              setEditing(null);
              setMode("add");
            }}
            className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition shrink-0"
          >
            + Yeni Ürün
          </button>
        )}
      </div>

      {/* Mod sekmeleri */}
      <div
        className="mb-8 flex flex-wrap gap-2 border-b border-stone-200"
        role="tablist"
        aria-label="Yönetim modülleri"
      >
        {ADMIN_TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              // Ürün Yönetimi sekmesine tıklamak her zaman listeye döndürür.
              if (item.id === "products") {
                setMode("list");
                setEditing(null);
              }
              setTab(item.id);
            }}
            className={`-mb-px rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrderManager />}
      {/* Ürün yönetimi sekmesi */}
      {tab === "products" && (
        <>
          {/* Form modu */}
          {(mode === "add" || mode === "edit") && (
            <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-stone-900">
                  {mode === "add" ? "Yeni Ürün Ekle" : `Düzenle: ${editing?.name}`}
                </h2>
                <button
                  onClick={() => {
                    setMode("list");
                    setEditing(null);
                    setFormInitial(null);
                  }}
                  className="shrink-0 text-xs text-stone-400 hover:text-primary transition-colors"
                >
                  ← Ürün Listesi
                </button>
              </div>
              <ProductForm
                initial={editing ?? formInitial ?? undefined}
                onSave={handleSave}
                onCancel={() => {
                  setMode("list");
                  setEditing(null);
                  setFormInitial(null);
                }}
              />
            </div>
          )}

          {/* Liste modu */}
          {mode === "list" && (
            <>
              {/* Filtreler — dinamik kategoriler */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterCat("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterCat === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                >
                  {`Tümü (${products.length})`}
                </button>
                {pageCategories.map((c) => {
                  const label = `${CAT_LABELS[c.slug] ?? c.label} (${products.filter((p) => productInCategory(p, c.slug)).length})`;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setFilterCat(c.slug)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterCat === c.slug ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Tablo */}
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-4 py-3 w-16">Görsel</th>
                      <th className="px-4 py-3">Ürün</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-right">Fiyat</th>
                      <th className="px-4 py-3 text-center">Badge</th>
                      <th className="px-4 py-3 text-center">Öne Çıkan</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                          Yükleniyor…
                        </td>
                      </tr>
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                          Bu kategoride ürün yok.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p) => (
                      <tr key={p.slug} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-12 w-12 rounded-xl object-cover border border-stone-100"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-900 leading-tight">{p.name}</div>
                          <div className="mt-0.5 max-w-xs truncate text-xs text-stone-400">
                            {p.shortDescription}
                          </div>
                          <div className="mt-0.5 text-[10px] font-mono text-stone-300">
                            {p.slug}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={CAT_COLORS[p.category]}>{CAT_LABELS[p.category]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-stone-800">
                          {formatTL(p.price)}
                          {p.oldPrice && (
                            <div className="text-xs text-stone-400 line-through">
                              {formatTL(p.oldPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.badge ? (
                            <Badge color="amber">{p.badge}</Badge>
                          ) : (
                            <span className="text-stone-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              ★ Öne Çıkan
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetFeatured(p.slug)}
                              className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-400 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition"
                            >
                              Seç
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/urun/$slug"
                              params={{ slug: p.slug }}
                              target="_blank"
                              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
                            >
                              Görüntüle
                            </Link>
                            <button
                              onClick={() => {
                                setEditing(p);
                                setFormInitial(null);
                                setMode("edit");
                              }}
                              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleClone(p)}
                              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
                            >
                              Klonla
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p.slug)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bilgi notu */}
              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
                <p className="text-xs text-green-800">
                  <strong>✓ Kalıcı kayıt aktif:</strong> Yaptığınız değişiklikler kalıcı olarak
                  kaydedilir. Tüm ziyaretçiler sayfayı yenilediğinde güncel veriyi görür. Rebuild
                  gerekmez.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* Duyuru bandı sekmesi */}
      {/* Kategori yönetimi sekmesi */}
      {tab === "categories" && <CategoryManager onSaved={reloadCategories} />}

      {tab === "announcements" && <AnnouncementManager />}

      {/* Slider sekmesi */}
      {tab === "banners" && <BannerManager />}
      {tab === "hero" && <HeroManager />}
      {tab === "about" && <AboutManager />}
    </div>
  );
}

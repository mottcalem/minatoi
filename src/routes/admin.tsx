import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { formatTL, type Product, type Category, CATEGORIES } from "@/data/products";
import { fetchProducts, fetchProductsServer, saveProducts, generateSlug, EMPTY_PRODUCT } from "@/data/adminProducts";
import { adminLogin, adminLogout, isAdminLoggedIn } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — The Bulls" }] }),
  loader: async () => {
    const products = await fetchProductsServer();
    return { initialProducts: products };
  },
  component: AdminRoot,
});

// ─── Auth guard ─────────────────────────────────────────────────────────────

function AdminRoot() {
  const { initialProducts } = Route.useLoaderData();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  useEffect(() => { setLoggedIn(isAdminLoggedIn()); }, []);
  if (loggedIn === null) return null;
  if (!loggedIn) return <LoginPage onSuccess={() => setLoggedIn(true)} />;
  return <AdminPage initialProducts={initialProducts} onLogout={() => { adminLogout(); setLoggedIn(false); }} />;
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
      if (result.ok) { onSuccess(); }
      else if (result.error === "env_not_configured") { setError("Sistem yapılandırması eksik. .env dosyasını kontrol edin."); }
      else { setError("Kullanıcı adı veya şifre hatalı."); }
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/images/products/wallets/TheBullsCraft_Damga.png" alt="The Bulls" className="h-16 w-16 object-contain" />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-stone-900">THE BULLS</p>
            <p className="text-xs uppercase tracking-widest text-stone-400">Admin Panel</p>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-xl font-bold text-stone-900">Güvenli Giriş</h1>
          <p className="mt-1 text-sm text-stone-500">Devam etmek için kimlik bilgilerinizi girin.</p>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-600">Kullanıcı Adı</span>
              <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition" placeholder="Kullanıcı adınız" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-600">Şifre</span>
              <div className="relative">
                <input type={showPass ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-11 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition" aria-label={showPass ? "Gizle" : "Göster"}>
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </label>
            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-stone-400">
          <Link to="/" className="hover:text-primary transition-colors">← Siteye Dön</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Yardımcı bileşenler ────────────────────────────────────────────────────

function Badge({ children, color = "stone" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    stone: "bg-stone-100 text-stone-700", amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-700", blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color] ?? colors.stone}`}>{children}</span>;
}

const CAT_COLORS: Record<Category, string> = { cuzdan: "amber", kilif: "green", gozluk: "blue" };
const CAT_LABELS: Record<Category, string> = { cuzdan: "Cüzdan & Kartlık", kilif: "Gözlük Kılıfı", gozluk: "Gözlük" };

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
  name: string; category: Category; price: string; oldPrice: string;
  image: string; images: string; shortDescription: string;
  description: string; features: string; shopierUrl: string; badge: string;
};

function productToForm(p: Partial<Product>): FormState {
  return {
    name: p.name ?? "", category: p.category ?? "cuzdan",
    price: p.price ? String(p.price) : "", oldPrice: p.oldPrice ? String(p.oldPrice) : "",
    image: p.image ?? "", images: p.images?.join("\n") ?? "",
    shortDescription: p.shortDescription ?? "", description: p.description ?? "",
    features: p.features?.join("\n") ?? "",
    shopierUrl: p.shopierUrl ?? "https://www.shopier.com/thebullscraft", badge: p.badge ?? "",
  };
}

function formToProduct(form: FormState, existingSlug?: string): Product {
  return {
    slug: existingSlug ?? generateSlug(form.name),
    name: form.name.trim(), category: form.category,
    price: Number(form.price) || 0,
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    image: form.image.trim(),
    images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
    shopierUrl: form.shopierUrl.trim(),
    badge: form.badge.trim() || undefined,
  };
}

function ProductForm({ initial, onSave, onCancel }: { initial?: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<FormState>(productToForm(initial ?? EMPTY_PRODUCT));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  function set(key: keyof FormState, value: string) { setForm(f => ({ ...f, [key]: value })); }
  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "İsim zorunludur.";
    if (!form.price || Number(form.price) <= 0) e.price = "Geçerli bir fiyat giriniz.";
    if (!form.image.trim()) e.image = "Ana görsel zorunludur.";
    if (!form.shortDescription.trim()) e.shortDescription = "Kısa açıklama zorunludur.";
    setErrors(e); return Object.keys(e).length === 0;
  }
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (validate()) onSave(formToProduct(form, initial?.slug)); }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Ürün Adı *" error={errors.name}>
          <input className={inputCls(errors.name)} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ör. SOKRATES — Klasik Deri Cüzdan" />
        </FormField>
        <FormField label="Kategori *">
          <select className={inputCls()} value={form.category} onChange={e => set("category", e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Fiyat (₺) *" error={errors.price}>
          <input className={inputCls(errors.price)} type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="890" />
        </FormField>
        <FormField label="Eski Fiyat (₺) — opsiyonel">
          <input className={inputCls()} type="number" min="0" value={form.oldPrice} onChange={e => set("oldPrice", e.target.value)} placeholder="1190 (varsa)" />
        </FormField>
        <FormField label="Badge — opsiyonel">
          <input className={inputCls()} value={form.badge} onChange={e => set("badge", e.target.value)} placeholder="ör. Yeni, Çok Satan, Premium" />
        </FormField>
        <FormField label="Shopier URL">
          <input className={inputCls()} value={form.shopierUrl} onChange={e => set("shopierUrl", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Ana Görsel URL *" error={errors.image}>
        <input className={inputCls(errors.image)} value={form.image} onChange={e => set("image", e.target.value)} placeholder="/images/products/sokrates/wa1.jpg" />
        {form.image && <img src={form.image} alt="önizleme" className="mt-2 h-20 w-20 rounded-xl object-cover border border-stone-200" onError={e => (e.currentTarget.style.display = "none")} />}
      </FormField>
      <FormField label="Ek Görseller (her satıra bir URL)">
        <textarea className={inputCls() + " font-mono text-xs"} rows={4} value={form.images} onChange={e => set("images", e.target.value)} placeholder="/images/products/sokrates/wa1.jpg&#10;/images/products/sokrates/wa2.jpg" />
        <p className="mt-1 text-xs text-stone-400">Her satıra bir URL. İlk satır ana görsel değilse yukarıdaki alanı kullanın.</p>
      </FormField>
      <FormField label="Kısa Açıklama *" error={errors.shortDescription}>
        <textarea className={inputCls(errors.shortDescription)} rows={2} value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="Kart listesinde görünen 1-2 cümle" />
      </FormField>
      <FormField label="Tam Açıklama">
        <textarea className={inputCls()} rows={5} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Ürün detay sayfasında görünen uzun açıklama" />
      </FormField>
      <FormField label="Özellikler (her satıra bir özellik)">
        <textarea className={inputCls() + " font-mono text-xs"} rows={5} value={form.features} onChange={e => set("features", e.target.value)} placeholder="%100 hakiki deri, el dikişi&#10;6 kart gözü&#10;RFID koruma" />
      </FormField>
      <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
        <button type="submit" className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition">
          {initial ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition">İptal</button>
      </div>
    </form>
  );
}

// ─── Ana admin sayfası ──────────────────────────────────────────────────────

function AdminPage({ initialProducts, onLogout }: { initialProducts: Product[]; onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const [filterCat, setFilterCat] = useState<Category | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hydration-safe: sadece client'ta çalışır
    setIsDevMode(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  }, []);

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
      // Dev modda API yok — JSON'u direkt güncelle, state'i tut
      if (result.error?.includes("fetch") || result.error?.includes("Failed")) {
        setProducts(updated);
        showToast(successMsg + " (Lokal — production'da kalıcı olur)", "ok");
      } else {
        showToast(`Kayıt başarısız: ${result.error}`, "err");
      }
    }
  }

  async function handleSave(p: Product) {
    let updated: Product[];
    if (editing) {
      updated = products.map(x => x.slug === editing.slug ? p : x);
    } else {
      updated = [...products, p];
    }
    await persist(updated, editing ? `"${p.name}" güncellendi.` : `"${p.name}" eklendi.`);
    setMode("list");
    setEditing(null);
  }

  async function handleDelete(slug: string) {
    const updated = products.filter(p => p.slug !== slug);
    await persist(updated, "Ürün silindi.");
    setConfirmDelete(null);
  }

  const filtered = filterCat === "all" ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-elegant ${toast.type === "ok" ? "bg-stone-900" : "bg-red-600"}`}>
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
            <p className="mt-2 text-sm text-stone-500">Bu işlem geri alınamaz ve sunucuya kaydedilir.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">Evet, Sil</button>
              <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-medium hover:bg-stone-50 transition">İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-stone-400 hover:text-primary transition-colors">← Siteye Dön</Link>
            <span className="text-stone-200">|</span>
            <button onClick={onLogout} className="text-xs text-stone-400 hover:text-red-600 transition-colors">Çıkış Yap</button>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-stone-500">
            {loading ? "Yükleniyor…" : `${products.length} ürün · Değişiklikler sunucuya kaydedilir, tüm ziyaretçiler görür.`}
          </p>
        </div>
        {mode === "list" && (
          <button onClick={() => { setEditing(null); setMode("add"); }}
            className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition shrink-0">
            + Yeni Ürün
          </button>
        )}
      </div>

      {/* Form modu */}
      {(mode === "add" || mode === "edit") && (
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-xl font-bold text-stone-900">
            {mode === "add" ? "Yeni Ürün Ekle" : `Düzenle: ${editing?.name}`}
          </h2>
          <ProductForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setMode("list"); setEditing(null); }} />
        </div>
      )}

      {/* Liste modu */}
      {mode === "list" && (
        <>
          {/* Filtreler */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {(["all", ...CATEGORIES.map(c => c.slug)] as const).map(slug => {
              const label = slug === "all" ? `Tümü (${products.length})` : `${CAT_LABELS[slug as Category]} (${products.filter(p => p.category === slug).length})`;
              return (
                <button key={slug} onClick={() => setFilterCat(slug as Category | "all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterCat === slug ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
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
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">Yükleniyor…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">Bu kategoride ürün yok.</td></tr>}
                {filtered.map(p => (
                  <tr key={p.slug} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover border border-stone-100" onError={e => (e.currentTarget.style.display = "none")} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900 leading-tight">{p.name}</div>
                      <div className="mt-0.5 max-w-xs truncate text-xs text-stone-400">{p.shortDescription}</div>
                      <div className="mt-0.5 text-[10px] font-mono text-stone-300">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3"><Badge color={CAT_COLORS[p.category]}>{CAT_LABELS[p.category]}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-800">
                      {formatTL(p.price)}
                      {p.oldPrice && <div className="text-xs text-stone-400 line-through">{formatTL(p.oldPrice)}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.badge ? <Badge color="amber">{p.badge}</Badge> : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to="/urun/$slug" params={{ slug: p.slug }} target="_blank"
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition">Görüntüle</Link>
                        <button onClick={() => { setEditing(p); setMode("edit"); }}
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition">Düzenle</button>
                        <button onClick={() => setConfirmDelete(p.slug)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Sil</button>
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
              <strong>✓ Kalıcı kayıt aktif:</strong> Yaptığınız her değişiklik sunucudaki <code className="rounded bg-green-100 px-1">public/products.json</code> dosyasına yazılır.
              Tüm ziyaretçiler sayfayı yenilediğinde güncel veriyi görür. Rebuild gerekmez.
            </p>
            {isDevMode && (
              <p className="mt-2 text-xs text-amber-700 border-t border-green-200 pt-2">
                ⚠️ <strong>Geliştirme modu:</strong> Kayıt işlemi yalnızca production build&apos;de çalışır.
                Ürünleri kalıcı kaydetmek için: <code className="rounded bg-amber-100 px-1">npm run build</code> → <code className="rounded bg-amber-100 px-1">node .output/server/index.mjs</code>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

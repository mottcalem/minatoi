import { Link, useMatchRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getCategories } from "@/data/categoryActions";
import { DEFAULT_CATEGORIES, type CategoryRecord } from "@/data/categories";

type StaticNavItem = { to: string; label: string };

/** Açılır menü dışındaki sabit bağlantılar. */
const NAV_ITEMS: StaticNavItem[] = [
  { to: "/kisiye-ozel", label: "Kişiye Özel" },
  { to: "/patili-dosyalara-ozel", label: "Patili Dosyalara Özel" },
  { to: "/blog", label: "Blog" },
];

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const linkBase = "text-sm font-medium transition-colors hover:text-primary";

export function Header() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryRecord[]>(DEFAULT_CATEGORIES);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  /** Fare butondan panele geçerken aradaki boşlukta ani kapanmayı önler. */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchRoute = useMatchRoute();

  // Kategoriler DB'den okunur; hata durumunda varsayılan liste kalır.
  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active && data.length) setCategories(data);
      })
      .catch(() => {
        /* varsayılan liste kalır */
      });
    return () => {
      active = false;
    };
  }, []);

  // Dropdown dışına tıklanınca ve Escape'te kapan.
  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen]);

  // Kaldırılırken bekleyen kapanma zamanlayıcısını temizle.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const isHome = Boolean(matchRoute({ to: "/", fuzzy: false }));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/images/logo-minatoi.jpg"
            alt="MinaToi — Handcrafted Leather Goods"
            width={600}
            height={155}
            className="h-auto w-40 object-contain sm:w-48"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Ana menü">
          <Link
            to="/"
            className={`${linkBase} ${isHome ? "text-primary font-semibold" : "text-stone-600"}`}
          >
            Anasayfa
          </Link>

          {/* Kategoriler açılır menü — hover ile açılır; tıklama dokunmatik yedegi */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => {
              if (closeTimer.current) {
                clearTimeout(closeTimer.current);
                closeTimer.current = null;
              }
              setDropdownOpen(true);
            }}
            onMouseLeave={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              closeTimer.current = setTimeout(() => setDropdownOpen(false), 150);
            }}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className={`${linkBase} flex cursor-pointer items-center gap-1 ${
                dropdownOpen ? "text-primary" : "text-stone-600"
              }`}
            >
              Kategoriler
              <ChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to="/kategori/$slug"
                    params={{ slug: category.slug }}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-primary"
                  >
                    {category.label}
                  </Link>
                ))}
                <div className="my-1.5 border-t border-stone-100" />
                <Link
                  to="/urunler"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 hover:text-primary"
                >
                  Tüm Ürünler →
                </Link>
              </div>
            )}
          </div>

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${linkBase} text-stone-600`}
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          aria-label="Menüyü aç"
          aria-expanded={open}
        >
          {open ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 bg-stone-700 rounded" />
              <span className="h-0.5 w-5 bg-stone-700 rounded" />
              <span className="h-0.5 w-3.5 bg-stone-700 rounded" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-stone-100 bg-white">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-1" aria-label="Mobil menü">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="border-b border-stone-100 py-4 text-sm font-medium text-stone-700"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary font-semibold" }}
            >
              Anasayfa
            </Link>
            {/* Mobilde kategoriler doğrudan alt alta listelenir */}
            {categories.map((category) => (
              <Link
                key={category.slug}
                to="/kategori/$slug"
                params={{ slug: category.slug }}
                onClick={() => setOpen(false)}
                className="border-b border-stone-100 py-4 pl-4 text-sm font-medium text-stone-600"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {category.label}
              </Link>
            ))}
            <Link
              to="/urunler"
              onClick={() => setOpen(false)}
              className="border-b border-stone-100 py-4 pl-4 text-sm font-semibold text-stone-800"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              Tüm Ürünler →
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-stone-100 py-4 text-sm font-medium text-stone-700 last:border-0"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

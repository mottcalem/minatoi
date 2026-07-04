import { Link } from "@tanstack/react-router";
import { useState } from "react";

type NavItem =
  | { to: "/"; label: string }
  | { to: "/urunler"; label: string }
  | { to: "/blog"; label: string }
  | { to: "/iletisim"; label: string }
  | { to: "/kategori/$slug"; label: string; slug: string };

const NAV: NavItem[] = [
  { to: "/", label: "Anasayfa" },
  { to: "/urunler", label: "Tüm Ürünler" },
  { to: "/kategori/$slug", label: "Deri Kılıf", slug: "kilif" },
  { to: "/kategori/$slug", label: "Cüzdan & Kartlık", slug: "cuzdan" },
  { to: "/blog", label: "Blog" },
  { to: "/iletisim", label: "İletişim" },
];

function NavLink({ item, onClick, className }: { item: NavItem; onClick?: () => void; className?: string }) {
  const base = "text-sm font-medium transition-colors hover:text-primary";
  if (item.to === "/kategori/$slug") {
    return (
      <Link
        to="/kategori/$slug"
        params={{ slug: item.slug }}
        onClick={onClick}
        className={`${base} ${className ?? ""}`}
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {item.label}
      </Link>
    );
  }
  if (item.to === "/blog") {
    return (
      <Link
        to="/blog"
        onClick={onClick}
        className={`${base} ${className ?? ""}`}
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {item.label}
      </Link>
    );
  }
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`${base} ${className ?? ""}`}
      activeOptions={{ exact: item.to === "/" }}
      activeProps={{ className: "text-primary font-semibold" }}
    >
      {item.label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/images/products/wallets/thebullscraft-icon.png"
            alt="TheBullsCraft — Handcrafted Leather Goods"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl font-bold tracking-tight text-stone-900">
              TheBullsCraft
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
              Handcrafted Leather Goods
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n, i) => (
            <NavLink key={i} item={n} className="text-stone-600" />
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-1">
            {NAV.map((n, i) => (
              <NavLink
                key={i}
                item={n}
                onClick={() => setOpen(false)}
                className="border-b border-stone-100 py-4 text-stone-700 last:border-0"
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

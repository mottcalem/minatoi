import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", label: "Anasayfa" },
    { to: "/urunler", label: "Tüm Ürünler" },
    { to: "/kategori/gozluk", label: "Gözlük" },
    { to: "/kategori/kilif", label: "Deri Kılıf" },
    { to: "/kategori/cuzdan", label: "Cüzdan" },
    { to: "/iletisim", label: "İletişim" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground font-black">B</span>
          <span className="font-display text-lg font-bold tracking-tight">{SITE.name}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              params={n.to.startsWith("/kategori/") ? { slug: n.to.split("/").pop()! } : undefined as never}
              className="text-sm text-muted-foreground hover:text-primary transition"
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid h-10 w-10 place-items-center rounded-md border border-border"
          aria-label="Menü"
        >
          <span className="block h-0.5 w-5 bg-foreground relative before:absolute before:-top-1.5 before:left-0 before:h-0.5 before:w-5 before:bg-foreground after:absolute after:top-1.5 after:left-0 after:h-0.5 after:w-5 after:bg-foreground" />
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                params={n.to.startsWith("/kategori/") ? { slug: n.to.split("/").pop()! } : undefined as never}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-foreground border-b border-border last:border-0"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
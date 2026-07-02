import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/data/site";

type NavItem =
  | { to: "/"; label: string }
  | { to: "/urunler"; label: string }
  | { to: "/iletisim"; label: string }
  | { to: "/kategori/$slug"; label: string; slug: string };

const NAV: NavItem[] = [
  { to: "/", label: "Anasayfa" },
  { to: "/urunler", label: "Tüm Ürünler" },
  { to: "/kategori/$slug", label: "Gözlük", slug: "gozluk" },
  { to: "/kategori/$slug", label: "Deri Kılıf", slug: "kilif" },
  { to: "/kategori/$slug", label: "Cüzdan", slug: "cuzdan" },
  { to: "/iletisim", label: "İletişim" },
];

function NavLink({ item, onClick, className }: { item: NavItem; onClick?: () => void; className?: string }) {
  const base = "text-sm transition hover:text-primary";
  if (item.to === "/kategori/$slug") {
    return (
      <Link
        to="/kategori/$slug"
        params={{ slug: item.slug }}
        onClick={onClick}
        className={`${base} ${className ?? ""}`}
        activeProps={{ className: "text-primary" }}
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
      activeProps={{ className: "text-primary" }}
    >
      {item.label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img
            src="/images/products/wallets/TheBullsCraft_Damga.png"
            alt="TheBullsCraft"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <span className="truncate font-display text-lg font-bold tracking-tight">{SITE.name}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n, i) => (
            <NavLink key={i} item={n} className="text-muted-foreground" />
          ))}
        </nav>
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border"
          aria-label="Menü"
        >
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {NAV.map((n, i) => (
              <NavLink
                key={i}
                item={n}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-foreground last:border-0"
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

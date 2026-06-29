import { Link } from "@tanstack/react-router";
import { SITE, waLink } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold font-black text-primary-foreground">B</span>
            <span className="font-display text-lg font-bold">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Kategoriler</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/kategori/$slug" params={{ slug: "gozluk" }} className="hover:text-primary">Gözlük</Link></li>
            <li><Link to="/kategori/$slug" params={{ slug: "kilif" }} className="hover:text-primary">Deri Kılıf</Link></li>
            <li><Link to="/kategori/$slug" params={{ slug: "cuzdan" }} className="hover:text-primary">Cüzdan</Link></li>
            <li><Link to="/urunler" className="hover:text-primary">Tüm Ürünler</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Kurumsal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/iletisim" className="hover:text-primary">İletişim</Link></li>
            <li><a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-primary">Instagram</a></li>
            <li><a href={SITE.shopierStore} target="_blank" rel="noreferrer" className="hover:text-primary">Shopier Mağaza</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">İletişim</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{SITE.email}</li>
            <li>
              <a
                href={waLink("Merhaba, bilgi almak istiyorum.")}
                target="_blank"
                rel="noreferrer"
                className="text-whatsapp hover:underline"
              >
                WhatsApp: +{SITE.whatsappNumber}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
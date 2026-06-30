import { Link } from "@tanstack/react-router";
import { SITE, waLink } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold font-black text-primary-foreground">B</span>
            <span className="font-display text-lg font-bold">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{SITE.tagline}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {SITE.owner} · {SITE.companyType}<br />
            {SITE.taxOffice} / {SITE.taxNumber}
          </p>
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
          <h4 className="mt-5 font-display text-sm font-semibold">Mevzuat</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/kullanici-sozlesmesi" className="hover:text-primary">Kullanıcı Sözleşmesi</Link></li>
            <li><Link to="/iptal-iade" className="hover:text-primary">İptal & İade</Link></li>
            <li><Link to="/gizlilik-politikasi" className="hover:text-primary">Gizlilik Politikası</Link></li>
            <li><Link to="/kvkk" className="hover:text-primary">KVKK Aydınlatma Metni</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">İletişim</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a></li>
            <li>{SITE.phone}</li>
            <li>
              <a
                href={waLink("Merhaba, bilgi almak istiyorum.")}
                target="_blank"
                rel="noreferrer"
                className="text-whatsapp hover:underline"
              >
                WhatsApp: {SITE.phone}
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

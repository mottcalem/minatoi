import { Link } from "@tanstack/react-router";
import { SITE, waLink } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-100 bg-stone-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        {/* Marka */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/images/products/wallets/TheBullsCraft_Damga.png"
              alt="TheBullsCraft"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold text-stone-900">TheBullsCraft</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Handcrafted Leather Goods</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-500">{SITE.tagline}</p>
          <p className="mt-3 text-xs text-stone-400">
            {SITE.owner} · {SITE.companyType}<br />
            {SITE.taxOffice} / {SITE.taxNumber}
          </p>
        </div>

        {/* Kategoriler */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Kategoriler</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><Link to="/kategori/$slug" params={{ slug: "kilif" }} className="hover:text-primary transition-colors">Gözlük Kılıfı</Link></li>
            <li><Link to="/kategori/$slug" params={{ slug: "cuzdan" }} className="hover:text-primary transition-colors">Cüzdan & Kartlık</Link></li>
            <li><Link to="/urunler" className="hover:text-primary transition-colors">Tüm Ürünler</Link></li>
          </ul>
        </div>

        {/* Kurumsal */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Kurumsal</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><Link to="/iletisim" className="hover:text-primary transition-colors">İletişim</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
            <li><a href={SITE.shopierStore} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Shopier Mağaza</a></li>
          </ul>
          <h4 className="mt-5 text-sm font-semibold text-stone-800">Mevzuat</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><Link to="/kullanici-sozlesmesi" className="hover:text-primary transition-colors">Kullanıcı Sözleşmesi</Link></li>
            <li><Link to="/iptal-iade" className="hover:text-primary transition-colors">İptal & İade</Link></li>
            <li><Link to="/gizlilik-politikasi" className="hover:text-primary transition-colors">Gizlilik Politikası</Link></li>
            <li><Link to="/kvkk" className="hover:text-primary transition-colors">KVKK Aydınlatma Metni</Link></li>
          </ul>
        </div>

        {/* İletişim */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">İletişim</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><a href={`mailto:${SITE.email}`} className="hover:text-primary transition-colors">{SITE.email}</a></li>
            <li>{SITE.phone}</li>
            <li>
              <a
                href={waLink("Merhaba, bilgi almak istiyorum.")}
                target="_blank"
                rel="noreferrer"
                className="text-whatsapp hover:underline"
              >
                WhatsApp ile Yaz
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200 py-5 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} TheBullsCraft — Tüm hakları saklıdır.
      </div>
    </footer>
  );
}


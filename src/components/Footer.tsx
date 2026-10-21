import { Instagram } from "lucide-react";
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
              src="/images/logo-minatoi.jpg"
              alt="MinaToi"
              width={600}
              height={155}
              className="h-auto w-48 object-contain"
            />
          </div>
          <p className="mt-3 text-sm text-stone-500">{SITE.tagline}</p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MinaToi Instagram hesabı"
              className="inline-flex size-11 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Instagram className="size-5" aria-hidden="true" />
            </a>
            <a
              href={waLink("Merhaba, MinaToi ürünleri hakkında bilgi almak istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MinaToi WhatsApp ile iletişim"
              className="inline-flex size-11 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-whatsapp hover:text-whatsapp focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3zM12 21.3h-.01a9.4 9.4 0 0 1-4.8-1.3l-.34-.2-3.8 1 1-3.7-.22-.36a9.4 9.4 0 1 1 17.5-4.9c0 5.2-4.2 9.4-9.4 9.4zm5.4-7c-.3-.15-1.75-.86-2-.95-.27-.1-.46-.15-.65.15-.2.3-.74.95-.9 1.14-.17.2-.34.22-.62.07-.3-.15-1.25-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.6-.9-2.18-.24-.57-.48-.5-.65-.5h-.55c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.45s1.05 2.85 1.2 3.05c.15.2 2.07 3.17 5 4.45.7.3 1.25.48 1.68.62.7.22 1.34.2 1.85.12.56-.08 1.75-.72 2-1.4.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>
          </div>
          {(SITE.owner || SITE.companyType || SITE.taxOffice || SITE.taxNumber) && (
            <p className="mt-3 text-xs text-stone-400">
              {[SITE.owner, SITE.companyType].filter(Boolean).join(" · ")}
              {(SITE.owner || SITE.companyType) && (SITE.taxOffice || SITE.taxNumber) && <br />}
              {[SITE.taxOffice, SITE.taxNumber].filter(Boolean).join(" ")}
            </p>
          )}
        </div>

        {/* Kategoriler */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Kategoriler</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li>
              <Link to="/kisiye-ozel" className="hover:text-primary transition-colors">
                Kişiye Özel
              </Link>
            </li>
            <li>
              <Link to="/patili-dostlara-ozel" className="hover:text-primary transition-colors">
                Patili Dostlara Özel
              </Link>
            </li>
            <li>
              <Link to="/urunler" className="hover:text-primary transition-colors">
                Tüm Ürünler
              </Link>
            </li>
          </ul>
        </div>

        {/* Kurumsal */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Kurumsal</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li>
              <Link to="/iletisim" className="hover:text-primary transition-colors">
                İletişim
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary transition-colors">
                Blog
              </Link>
            </li>
          </ul>
          <h4 className="mt-5 text-sm font-semibold text-stone-800">Mevzuat</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li>
              <Link to="/kullanici-sozlesmesi" className="hover:text-primary transition-colors">
                Kullanıcı Sözleşmesi
              </Link>
            </li>
            <li>
              <Link
                to="/mesafeli-satis-sozlesmesi"
                className="hover:text-primary transition-colors"
              >
                Mesafeli Satış Sözleşmesi
              </Link>
            </li>
            <li>
              <Link to="/iptal-iade" className="hover:text-primary transition-colors">
                İptal & İade
              </Link>
            </li>
            <li>
              <Link to="/gizlilik-politikasi" className="hover:text-primary transition-colors">
                Gizlilik Politikası
              </Link>
            </li>
            <li>
              <Link to="/kvkk" className="hover:text-primary transition-colors">
                KVKK Aydınlatma Metni
              </Link>
            </li>
          </ul>
        </div>

        {/* İletişim */}
        <div>
          <h4 className="text-sm font-semibold text-stone-800">İletişim</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-primary transition-colors">
                {SITE.email}
              </a>
            </li>
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
        © {new Date().getFullYear()} MinaToi — Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.minatoi.com"),
  title: { default: "Minatoi | Temperli Cam Tablo", template: "%s | Minatoi" },
  description: "Evinize karakter katan 4 mm temperli cam tablolar. Ücretsiz kargo, solmayan renkler ve hasarsız teslimat garantisi.",
  openGraph: { title: "Minatoi Cam Tablo", description: "Duvarınız boş kalmasın. Tarzınıza uygun cam tabloyu keşfedin.", type: "website", locale: "tr_TR" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body suppressHydrationWarning>{children}<Script id="chatwoot-widget" strategy="afterInteractive">{`
    window.chatwootSettings = {
      position: "right",
      type: "expanded_bubble",
      launcherTitle: "Canlı Destek"
    };

    (function(d, t) {
      var BASE_URL = "https://login.engagemetriq.com";
      var g = d.createElement(t);
      var s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.async = true;
      s.parentNode.insertBefore(g, s);
      g.onload = function() {
        window.chatwootSDK.run({
          websiteToken: "8mw3b8PoA96aKEA72uXqZpwE",
          baseUrl: BASE_URL
        });
      };
    })(document, "script");
  `}</Script></body></html>;
}

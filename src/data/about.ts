/**
 * Anasayfadaki "Minatoi Cam Tablo" tanıtım bölümü — görsel, başlık ve metin
 * yönetim panelinden düzenlenir.
 */
export type AboutContent = {
  /** Küçük üst etiket (eyebrow); boşsa gizlenir. */
  eyebrow: string;
  /** Bölüm başlığı. */
  title: string;
  /** Sunucuya yüklenmiş görselin public yolu; boşsa varsayılan görsel kullanılır. */
  imageUrl: string;
  /** Sunucuya yüklenmiş MP4 videonun public yolu; doluysa görsel yerine gösterilir. */
  videoUrl: string;
  /** Görsel alternatif metni. */
  imageAlt: string;
  /** Zengin metin içeriği (HTML); sunucuda sanitize edilir. */
  bodyHtml: string;
  /** Alt buton etiketi; boşsa buton gizlenir. */
  ctaLabel: string;
  /** Buton hedefi; dahili yol (/…) veya https bağlantısı. */
  ctaHref: string;
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  eyebrow: "MinaToi",
  title: "Minatoi Cam Tablo",
  imageUrl: "",
  videoUrl: "",
  imageAlt: "El yapımı deri işçiliği",
  bodyHtml: [
    "<p>Minatoi, yaşam alanlarına modern, estetik ve kişisel bir dokunuş katmak için hazırlanan dekoratif cam tablo koleksiyonları sunar. 4 mm temperli cam üzerine UV baskı teknolojisiyle hazırlanan cam tablolar; parlak yüzey etkisi, canlı renkleri ve dayanıklı yapısıyla ev, ofis ve hediye dekorasyonunda dikkat çekici bir seçenek oluşturur.</p>",
    "<p>Koleksiyonlarımızda kedi temalı cam tablolar, göz ve nazar tasarımları, zen ve doğa esintili çalışmalar, sanatçı albümü seçkileri, afiş tarzı modern tasarımlar, gerçek üstü kompozisyonlar ve hayvan figürlü dekoratif tablolar yer alır. Ayrıca kişiye özel cam tablo seçenekleriyle kendi fotoğrafınızı ya da sevdiğiniz bir görseli cam yüzeye taşıyabilir; patili dostlara özel tasarımlarla kedi veya köpeğiniz için özel bir tablo hazırlatabilirsiniz.</p>",
    "<p>Minatoi cam tablolar, çerçevesiz ve modern görünümüyle duvar dekorasyonunda sade ama güçlü bir etki oluşturur. Ürünlerimiz 4 mm temperli cam üzerine basılır, kolay temizlenebilir parlak yüzeyiyle uzun süre canlı görünümünü korur. Türkiye’nin her yerine ücretsiz kargo ve hasarsız teslimat garantisiyle hazırlanan koleksiyonlarımızı inceleyerek yaşam alanınıza uygun cam tablo modelini seçebilirsiniz.</p>",
    "<p>Cam tablo hakkında daha ayrıntılı bilgi için Cam Tablo Nedir? Özellikleri, Avantajları ve Kullanım Alanları rehberimizi inceleyin.</p>",
  ].join(""),
  ctaLabel: "Tüm Ürünleri Gör",
  ctaHref: "/urunler",
};

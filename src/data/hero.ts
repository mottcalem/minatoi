/** Anasayfa hero bölümü — tüm metin ve butonlar yönetim panelinden düzenlenir. */
export type HeroStat = {
  label: string;
  value: string;
};

export type HeroContent = {
  /** Rozet metni; boşsa gizlenir. */
  badge: string;
  /** Başlık üç satırdan oluşur; orta satır altın gradyanlı vurgu satırıdır. */
  titleTop: string;
  titleHighlight: string;
  titleBottom: string;
  description: string;
  /** Birincil buton (düz renk) etiketi ve hedefi; dahili yol veya https bağlantısı. */
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  /** İkincil buton WhatsApp'tan açar; yalnızca etiketi düzenlenir. */
  ctaSecondaryLabel: string;
  /** Alt bilgi şeridi; en fazla 4 madde. */
  stats: HeroStat[];
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: "Kişiye Özel · Temperli Cam",
  titleTop: "Anılarınızı",
  titleHighlight: "sanata",
  titleBottom: "dönüştürelim.",
  description:
    "Fotoğraflarınızı, sevdiğiniz anları ve patili dostlarınızı size özel cam tablo tasarımlarına dönüştürüyoruz.",
  ctaPrimaryLabel: "Tasarımını Oluştur",
  ctaPrimaryHref: "/kisiye-ozel",
  ctaSecondaryLabel: "Bize Yazın",
  stats: [
    { label: "Ücretsiz Kargo", value: "Türkiye geneli" },
    { label: "Kişiselleştirme", value: "Fotoğrafınızdan tasarım" },
    { label: "Kalite Garantisi", value: "4 mm temperli cam" },
  ],
};

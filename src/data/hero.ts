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
  badge: "El Yapımı · Hakiki Deri",
  titleTop: "Derinin",
  titleHighlight: "elde işlenmiş",
  titleBottom: "şıklığı.",
  description:
    "Her cüzdan, her kartlık, her kılıf — sabırlı el işçiliğiyle, birinci sınıf hakiki deriden. Kullandıkça güzelleşir, sizinle birlikte yaşlanır.",
  ctaPrimaryLabel: "Koleksiyonu Keşfet",
  ctaPrimaryHref: "/urunler",
  ctaSecondaryLabel: "Hızlı Sipariş",
  stats: [
    { label: "Ücretsiz Kargo", value: "999₺ üzeri" },
    { label: "Kişiselleştirme", value: "Logo & İsim Kazıma" },
    { label: "Kalite Garantisi", value: "%100 Hakiki Deri" },
  ],
};

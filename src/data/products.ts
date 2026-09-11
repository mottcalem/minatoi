import glassesImg from "@/assets/cat-glasses.jpg";
import casesImg from "@/assets/cat-cases.jpg";
import walletsImg from "@/assets/cat-wallets.jpg";

// ─── Resim yolları ─────────────────────────────────────────────────────────────

// Sokrates — Klasik Erkek Cüzdanı
const S = "/images/products/sokrates";
const socratesImages = [
  `${S}/wa1.jpg`,
  `${S}/wa2.jpg`,
  `${S}/wa3.jpg`,
  `${S}/wa4.jpg`,
  `${S}/wa5.jpg`,
  `${S}/angle.jpg`,
  `${S}/closed.jpg`,
  `${S}/open.jpg`,
  `${S}/man.jpg`,
  `${S}/model.jpg`,
];

// Frege — Kartlık
const F = "/images/products/frege-kartlik";
const fregeImages = [
  `${F}/front.jpg`,
  `${F}/angle.jpg`,
  `${F}/standing.jpg`,
  `${F}/top.jpg`,
  `${F}/stitch-detail.jpg`,
  `${F}/in-hand.jpg`,
  `${F}/lifestyle.jpg`,
  `${F}/wa1.jpg`,
  `${F}/wa2.jpg`,
  `${F}/wa3.jpg`,
  `${F}/wa4.jpg`,
  `${F}/wa5.jpg`,
];

// Gözlük Kılıfı
const K = "/images/products/gozluk-kilifi";
const kilif1Images = [
  `${K}/kilif1.jpg`,
  `${K}/kilif2.jpg`,
  `${K}/kilif3.jpg`,
  `${K}/kilif4.jpg`,
  `${K}/kilif5.jpg`,
  `${K}/kilif6.jpg`,
  `${K}/kilif7.jpg`,
  `${K}/kilif8.jpg`,
  `${K}/kilif9.jpg`,
  `${K}/kilif10.jpg`,
];

// ─── Kategoriler ───────────────────────────────────────────────────────────────

export type Category = "gozluk" | "kilif" | "cuzdan";

export const CATEGORIES: { slug: Category; label: string; description: string; image: string }[] = [
  {
    slug: "gozluk",
    label: "Gözlük",
    description: "UV korumalı, EN ISO 12312-1:2013 standart güneş gözlükleri",
    image: glassesImg,
  },
  {
    slug: "kilif",
    label: "Gözlük Kılıfı",
    description: "Tam deri, el yapımı gözlük kılıfları",
    image: casesImg,
  },
  {
    slug: "cuzdan",
    label: "Cüzdan & Kartlık",
    description: "El yapımı hakiki deri cüzdan ve kartlık modelleri",
    image: walletsImg,
  },
];

// ─── Tip tanımları ─────────────────────────────────────────────────────────────

export type TechSpec = { label: string; value: string };

export type GlassesSeries = "urban" | "heritage" | "modern";

export const SERIES: Record<GlassesSeries, { label: string; description: string }> = {
  urban: {
    label: "Urban Series",
    description: "Şehir yaşamına ilham veren modern ve çok yönlü siluetler.",
  },
  heritage: {
    label: "Heritage Series",
    description: "Zamansız klasikleri çağdaş detaylarla yeniden yorumlayan seri.",
  },
  modern: {
    label: "Modern Series",
    description: "Cesur çizgiler ve minimalist formlarla geleceğe bakan koleksiyon.",
  },
};

export type GlassesDetails = {
  series: GlassesSeries;
  techSpecs: TechSpec[];
  filterInfo: { type: string; category: string; lightTransmission: string; notes: string[] };
  materials: string[];
  care: string[];
  usage: string[];
  safety: string[];
  boxContents: string[];
  summary: string[];
};

export type WalletDetails = {
  techSpecs: TechSpec[];
  materials: string[];
  care: string[];
  boxContents: string[];
  summary: string[];
};

export type Product = {
  slug: string;
  name: string;
  /** Yönetim panelinden yönetilen kategorinin adresi; "cuzdan" | "kilif" | "gozluk" ile sınırlı değildir. */
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  shortDescription: string;
  description: string;
  features: string[];
  /** Ölçü varyasyonları (ör. "25*35 cm"); boşsa ürün tek ölçüdür. */
  sizes?: string[];
  sizePrices?: import("./productPricing").SizePrice[];
  shopierUrl: string;
  badge?: string;
  featured?: boolean;
  glasses?: GlassesDetails;
  wallet?: WalletDetails;
};

// ─── Gözlük şablonu ────────────────────────────────────────────────────────────

const SHOPIER = "https://www.shopier.com/minatoi";

const GLASSES_TECH_SPECS: TechSpec[] = [
  { label: "Ürün Tipi", value: "Güneş Gözlüğü" },
  { label: "Kullanım Amacı", value: "Günlük kullanım" },
  { label: "Standart", value: "EN ISO 12312-1:2013" },
  { label: "UV Koruması", value: "UV korumalı filtre" },
  { label: "Filtre Tipi", value: "G (Gradient / Gradyan)" },
  { label: "Filtre Kategorisi", value: "Kategori 3" },
  { label: "Işık Geçirgenliği", value: "%8 - %18" },
  { label: "Kullanım Alanı", value: "Güçlü güneş ışığı" },
  { label: "CE Sertifikası", value: "Mevcuttur" },
  { label: "Menşei", value: "Çin" },
];

const GLASSES_SUMMARY = [
  "EN ISO 12312-1:2013 Standartlarına Uygun",
  "CE Belgeli",
  "UV Korumalı Lens",
  "Gradient (Gradyan) Cam",
  "Filtre Kategorisi 3",
  "Güçlü Güneş Işığı İçin Uygun",
  "Günlük Kullanıma Uygun",
  "Şık ve Ergonomik Tasarım",
];

const GLASSES_DESCRIPTION =
  "Günlük kullanım için tasarlanan güneş gözlüğümüz, gözlerinizi zararlı UV ışınlarına karşı korurken modern tasarımıyla stilinizi tamamlar. EN ISO 12312-1:2013 standardına uygun olarak üretilmiş olup, yüksek kaliteli filtre teknolojisi sayesinde güçlü güneş ışığında net ve konforlu görüş sunar.\n\nGradient (Gradyan) filtre yapısı sayesinde üst bölüm daha koyu, alt bölüm ise daha açık tonda tasarlanmıştır. Bu sayede hem yoğun güneş ışığını filtreler hem de aşağı bakışlarda daha rahat görüş sağlar.\n\nDayanıklı malzemeleri ve kaliteli işçiliği sayesinde günlük kullanım, şehir yaşamı, seyahat ve açık hava aktiviteleri için ideal bir tercihtir.";

const GLASSES_FEATURES = [
  "EN ISO 12312-1:2013 standartlarına uygun",
  "UV korumalı gradient lens",
  "Filtre kategorisi 3 — güçlü güneş ışığı",
  "CE belgeli",
  "Şık ve ergonomik tasarım",
];

export function makeGlasses(
  series: GlassesSeries,
  model: string,
  opts: { price: number; oldPrice?: number; image?: string; shopierUrl?: string; badge?: string },
): Product {
  return {
    slug: `${series}-${model.toLowerCase()}`,
    name: `${SERIES[series].label.split(" ")[0]} ${model}`,
    category: "gozluk",
    price: opts.price,
    oldPrice: opts.oldPrice,
    image: opts.image ?? glassesImg,
    shortDescription: `${SERIES[series].label} — UV korumalı, gradient camlı güneş gözlüğü.`,
    description: GLASSES_DESCRIPTION,
    features: GLASSES_FEATURES,
    shopierUrl: opts.shopierUrl ?? SHOPIER,
    badge: opts.badge,
    glasses: {
      series,
      techSpecs: GLASSES_TECH_SPECS,
      filterInfo: {
        type: "G (Gradient)",
        category: "3",
        lightTransmission: "%8 - %18",
        notes: [
          "Gradyan filtre, camın üst kısmında daha koyu, alt kısmında ise daha açık ton bulunmasını sağlar.",
          "Araç kullanırken gösterge panelini daha rahat görmeye konfor kazandırır.",
          "Günlük şehir kullanımına ve açık hava aktivitelerine uygundur.",
          "Kategori 3 filtre güçlü güneş ışığında, yaz aylarında sahil ve şehir kullanımı için ideal koruma sağlar.",
        ],
      },
      materials: [
        "Dayanıklı plastik veya metal çerçeve",
        "Cilt dostu yüzey kaplaması",
        "Zararlı kimyasal içermeyen güvenli yapı",
        "Günlük kullanıma uygun kaliteli bileşenler",
      ],
      care: [
        "Mikrofiber bez ile temizleyiniz.",
        "Camları yalnızca optik temizleme solüsyonları veya sabunlu su ile temizleyiniz.",
        "Aseton, alkol ve benzeri kimyasallar kullanmayınız.",
        "Camları sert yüzeylere temas ettirmeyiniz.",
        "Kullanmadığınız zamanlarda koruyucu kılıfında muhafaza ediniz.",
        "Aşındırıcı bez veya kağıt havlu kullanmayınız.",
        "Deniz suyu veya havuz suyuna maruz bırakmayınız.",
        "Araç ön panelinde veya uzun süre doğrudan güneş altında bırakmayınız.",
      ],
      usage: [
        "Günlük kullanım için uygundur.",
        "Güçlü güneş ışığında yüksek görüş konforu sağlar.",
        "Araç kullanımı sırasında kullanılabilir.",
        "Solaryumda kullanılmamalıdır.",
        "Güneşe doğrudan bakmak amacıyla kullanılmamalıdır.",
        "Gece sürüşü veya düşük ışıklı ortamlarda kullanılması tavsiye edilmez.",
      ],
      safety: [
        "Gözlüğünüzü tek elle çıkarıp takmamaya özen gösteriniz.",
        "Çerçevenin eğilmesine neden olacak darbelerden kaçınınız.",
        "Ürünü çocukların erişemeyeceği şekilde muhafaza ediniz.",
        "Herhangi bir deformasyon oluşması halinde kullanımı durdurunuz.",
      ],
      boxContents: [
        "1 Adet Güneş Gözlüğü",
        "Koruyucu Gözlük Kılıfı",
        "Mikrofiber Temizleme Bezi",
        "Kullanım ve Bakım Bilgilendirme Kılavuzu",
      ],
      summary: GLASSES_SUMMARY,
    },
  };
}

export const GLASSES_MODELS: Record<GlassesSeries, string[]> = {
  urban: ["Soho", "Milan", "Monaco", "Chelsea"],
  heritage: ["Atlas", "Heritage", "Sterling", "Raven"],
  modern: ["Orion", "Eclipse", "Nova", "Lumen"],
};

// ─── Ürün listesi ──────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  // ── Cüzdan & Kartlık ──────────────────────────────────────────────────────

  {
    slug: "sokrates-klasik-cuzdan",
    name: "SOKRATES — El Yapımı Hakiki Deri Klasik Erkek Cüzdanı",
    category: "cuzdan",
    price: 890,
    oldPrice: 1190,
    image: socratesImages[0],
    images: socratesImages,
    shortDescription:
      "El yapımı hakiki deri klasik erkek cüzdanı. 6 kart gözü, çıtçıtlı bozuk para bölmesi, RFID koruma.",
    description:
      "SOKRATES, birinci sınıf hakiki deriden el işçiliğiyle üretilen klasik bir erkek cüzdanıdır. " +
      "Zamansız tasarımı, el dikişi detayları ve doğal deri dokusuyla her stile uyum sağlar. " +
      "Günlük kullanımda yıpranmaya karşı dayanıklı, kullandıkça güzelleşen bir patina geliştirir.\n\n" +
      "6 kart gözü, çıtçıtlı bozuk para bölmesi ve iki banknot gözüyle pratik bir organizasyon sunar. " +
      "RFID koruma teknolojisi ile kartlarınızın bilgilerini güvende tutar.",
    features: [
      "%100 hakiki deri, el dikişi",
      "6 kart gözü",
      "Çıtçıtlı bozuk para bölmesi",
      "RFID koruma",
      "İki banknot gözü",
    ],
    shopierUrl: "https://www.shopier.com/ShowProductNew/products.php?id=24888698",
    badge: "Çok Satan",
    wallet: {
      techSpecs: [
        { label: "Ürün Tipi", value: "Erkek Cüzdanı" },
        { label: "Model", value: "SOKRATES Klasik" },
        { label: "Malzeme", value: "%100 Hakiki Deri" },
        { label: "İşçilik", value: "El dikişi" },
        { label: "Kart Gözü Sayısı", value: "6 adet" },
        { label: "Bozuk Para Bölmesi", value: "Çıtçıtlı" },
        { label: "Banknot Gözü", value: "2 adet" },
        { label: "RFID Koruma", value: "Var" },
        { label: "Boyut", value: "11 × 9.5 cm" },
        { label: "Menşei", value: "Türkiye" },
      ],
      materials: [
        "Birinci sınıf hakiki dana derisi",
        "Pamuklu dikiş ipi",
        "Metal çıtçıt mekanizması",
        "RFID korumalı iç astar",
      ],
      care: [
        "Nemli ve yumuşak bir bez ile temizleyiniz.",
        "Doğrudan güneş ışığından ve ısı kaynaklarından uzak tutunuz.",
        "Sert kimyasal temizleyiciler kullanmayınız.",
        "Deri bakım kremi ile düzenli aralıklarla besleyiniz.",
        "Suda bekletmeyiniz; ıslanırsa doğal olarak kurumaya bırakınız.",
        "Kullanmadığınız zamanlarda bez kılıfında muhafaza ediniz.",
      ],
      boxContents: [
        "1 Adet SOKRATES Cüzdan",
        "Koruyucu Bez Kılıf",
        "Kullanım ve Bakım Bilgilendirme Kılavuzu",
      ],
      summary: [
        "%100 Hakiki Deri",
        "El Dikişi",
        "6 Kart Gözü",
        "Çıtçıtlı Bozuk Para Bölmesi",
        "RFID Koruma",
        "İki Banknot Gözü",
        "Kullandıkça Güzelleşen Patina",
        "Türkiye'de Üretilmiştir",
      ],
    },
  },

  {
    slug: "frege-kartlik",
    name: "FREGE — El Yapımı Hakiki Deri Kartlık",
    category: "cuzdan",
    price: 590,
    image: fregeImages[0],
    images: fregeImages,
    shortDescription:
      "Slim profil, el dikişi, hakiki deri. Sadece kartlarını tut, cebinde his bile etme.",
    description:
      "FREGE, minimal yaşam tarzına sahip olanlar için tasarlanmış bir hakiki deri kartlıktır. " +
      "İnce profili sayesinde cebinizde veya çantanızda neredeyse fark edilmez.\n\n" +
      "Günlük taşınan 3-6 karta yer açarken, ön bölme sık kullandığınız kartlara hızlı erişim sağlar. " +
      "Her dikişi elle atılmış, her kenarı elle perdahlanmış. Kullandıkça güzelleşen bir deri ruhu taşır.",
    features: [
      "%100 hakiki deri, el dikişi",
      "Ön açık kart bölmesi",
      "3-6 kart kapasitesi",
      "Slim profil — cepte iz bırakmaz",
      "Kenar perdahı el ile yapılmıştır",
      "Kullandıkça güzelleşen patina",
    ],
    shopierUrl: SHOPIER,
    badge: "Yeni",
    wallet: {
      techSpecs: [
        { label: "Ürün Tipi", value: "Kartlık" },
        { label: "Model", value: "FREGE Slim" },
        { label: "Malzeme", value: "%100 Hakiki Deri" },
        { label: "İşçilik", value: "El dikişi" },
        { label: "Kart Kapasitesi", value: "3-6 adet" },
        { label: "Ön Bölme", value: "Var (hızlı erişim)" },
        { label: "Boyut", value: "10 × 7 cm (yaklaşık)" },
        { label: "Menşei", value: "Türkiye" },
      ],
      materials: ["Hakiki dana derisi", "Pamuklu el dikiş ipi", "Doğal renk kenar perdahı"],
      care: [
        "Nemli yumuşak bir bez ile siliniz.",
        "Deri bakım kremi ile besleyiniz.",
        "Güneş ışığından uzak tutunuz.",
        "Sert kimyasallar kullanmayınız.",
        "Islanırsa doğal havada kurumaya bırakınız.",
      ],
      boxContents: ["1 Adet FREGE Kartlık", "Kullanım ve Bakım Bilgilendirme Kılavuzu"],
      summary: [
        "%100 Hakiki Deri",
        "El Dikişi",
        "3-6 Kart Kapasitesi",
        "Ön Hızlı Erişim Bölmesi",
        "Slim Profil",
        "El Perdahı Kenar",
        "Kullandıkça Güzelleşen Patina",
        "Türkiye'de Üretilmiştir",
      ],
    },
  },

  // ── Deri Kılıflar ─────────────────────────────────────────────────────────

  {
    slug: "klasik-deri-gozluk-kilifi",
    name: "Klasik El Yapımı Deri Gözlük Kılıfı",
    category: "kilif",
    price: 490,
    image: kilif1Images[0],
    images: kilif1Images,
    shortDescription:
      "Tam deri, el dikişi, çıtçıt kapaklı hakiki deri gözlük kılıfı. Her boyut gözlüğe uyar.",
    description:
      "Hakiki deriden elle üretilen bu gözlük kılıfı, gözlüğünüzü çiziklere ve darbelerere karşı korurken zarafetinden ödün vermez.\n\n" +
      "Çıtçıt kapak mekanizması sayesinde gözlüğünüz güvenle yerinde kalır. " +
      "İç kısım yumuşak astar ile kaplanmıştır; lens yüzeylerine zarar vermez. " +
      "Deri kullandıkça güzelleşir, size özel bir patina geliştirir.",
    features: [
      "%100 hakiki deri",
      "El dikişi",
      "Çıtçıt kapak mekanizması",
      "Yumuşak iç astar",
      "Her boyut gözlüğe uygun",
      "Kullandıkça güzelleşen patina",
    ],
    shopierUrl: SHOPIER,
    badge: "El Yapımı",
  },

  // ── Gözlükler (henüz eklenmedi — placeholder) ────────────────────────────
  makeGlasses("urban", "Soho", { price: 1290, badge: "Yakında" }),
  makeGlasses("urban", "Milan", { price: 1290, badge: "Yakında" }),
  makeGlasses("heritage", "Atlas", { price: 1490, badge: "Yakında" }),
  makeGlasses("modern", "Eclipse", { price: 1390, badge: "Yakında" }),
];

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(cat?: Category) {
  return cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS;
}

export function formatTL(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

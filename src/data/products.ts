import glassesImg from "@/assets/cat-glasses.jpg";
import casesImg from "@/assets/cat-cases.jpg";
import walletsImg from "@/assets/cat-wallets.jpg";

export type Category = "gozluk" | "kilif" | "cuzdan";

export type GlassesSeries = "urban" | "heritage" | "modern";

export const SERIES: Record<GlassesSeries, { label: string; description: string }> = {
  urban: { label: "Urban Series", description: "Şehir yaşamına ilham veren modern ve çok yönlü siluetler." },
  heritage: { label: "Heritage Series", description: "Zamansız klasikleri çağdaş detaylarla yeniden yorumlayan seri." },
  modern: { label: "Modern Series", description: "Cesiz çizgiler ve minimalist formlarla geleceğe bakan koleksiyon." },
};

export const CATEGORIES: { slug: Category; label: string; description: string; image: string }[] = [
  { slug: "gozluk", label: "Gözlük", description: "UV korumalı, EN ISO 12312-1:2013 standart güneş gözlükleri", image: glassesImg },
  { slug: "kilif", label: "Deri Kılıf", description: "Tam deri, el yapımı gözlük kılıfları", image: casesImg },
  { slug: "cuzdan", label: "Deri Cüzdan", description: "Minimal ve klasik deri cüzdan modelleri", image: walletsImg },
];

export type TechSpec = { label: string; value: string };

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

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  shopierUrl: string;
  badge?: string;
  glasses?: GlassesDetails;
};

const SHOPIER = "https://www.shopier.com/thebullscraft";

// ── Gözlük ürün şablonu ──────────────────────────────────────────────
// Tüm gözlük modelleri aynı teknik özelliklere sahiptir; yalnızca seri ve
// model adı değişir. makeGlasses() ile tutarlı bir GlassesDetails üretiriz.
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
        "Mikrofiber Temizleme Bezi (varsa)",
        "Kullanım ve Bakım Bilgilendirme Kılavuzu",
      ],
      summary: GLASSES_SUMMARY,
    },
  };
}

// Seri → modeller eşleştirmesi. Ürün girişlerini yaparken bu listeyi
// referans alarak makeGlasses() çağrılarıyla PRODUCTS'a ekleyebilirsiniz.
export const GLASSES_MODELS: Record<GlassesSeries, string[]> = {
  urban: ["Soho", "Milan", "Monaco", "Chelsea"],
  heritage: ["Atlas", "Heritage", "Sterling", "Raven"],
  modern: ["Orion", "Eclipse", "Nova", "Lumen"],
};

export const PRODUCTS: Product[] = [
  // ── Gözlükler (Urban Series) ──────────────────────────────────────
  makeGlasses("urban", "Soho", { price: 1290, badge: "Yeni" }),
  makeGlasses("urban", "Milan", { price: 1290 }),
  makeGlasses("urban", "Monaco", { price: 1390, oldPrice: 1690 }),
  makeGlasses("urban", "Chelsea", { price: 1290 }),

  // ── Gözlükler (Heritage Series) ───────────────────────────────────
  makeGlasses("heritage", "Atlas", { price: 1490, badge: "Çok Satan" }),
  makeGlasses("heritage", "Heritage", { price: 1490 }),
  makeGlasses("heritage", "Sterling", { price: 1590 }),
  makeGlasses("heritage", "Raven", { price: 1490 }),

  // ── Gözlükler (Modern Series) ─────────────────────────────────────
  makeGlasses("modern", "Orion", { price: 1390 }),
  makeGlasses("modern", "Eclipse", { price: 1390, badge: "Yeni" }),
  makeGlasses("modern", "Nova", { price: 1490, oldPrice: 1790 }),
  makeGlasses("modern", "Lumen", { price: 1390, badge: "Premium" }),

  // Deri kılıflar
  {
    slug: "klasik-deri-kilif-taba",
    name: "Klasik Deri Kılıf — Taba",
    category: "kilif",
    price: 390,
    image: casesImg,
    shortDescription: "Tam deri, el dikişli klasik gözlük kılıfı.",
    description: "Birinci sınıf dana derisinden el dikişiyle üretilmiş, çıt çıt kapaklı klasik gözlük kılıfımız.",
    features: ["%100 hakiki deri", "El dikişi", "Çıt çıt kapak", "Yumuşak iç astar"],
    shopierUrl: SHOPIER,
    badge: "Çok Satan",
  },
  {
    slug: "klasik-deri-kilif-kahve",
    name: "Klasik Deri Kılıf — Kahve",
    category: "kilif",
    price: 390,
    image: casesImg,
    shortDescription: "Koyu kahve tonunda el yapımı gözlük kılıfı.",
    description: "Yıllar geçtikçe güzelleşen patine yapısıyla koyu kahve klasik kılıf.",
    features: ["%100 hakiki deri", "El dikişi", "Çıt çıt kapak", "Mikrofiber astar"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "minimal-deri-kilif-siyah",
    name: "Minimal Deri Kılıf — Siyah",
    category: "kilif",
    price: 420,
    image: casesImg,
    shortDescription: "İnce ve modern siyah deri gözlük kılıfı.",
    description: "Minimal kesimi ve ince yapısıyla cep ve çantada yer kaplamayan modern model.",
    features: ["%100 hakiki deri", "İnce profil", "Manyetik kapak", "Süet astar"],
    shopierUrl: SHOPIER,
    badge: "Yeni",
  },

  // Cüzdanlar
  {
    slug: "bifold-cuzdan-kahve",
    name: "Bifold Cüzdan — Kahve",
    category: "cuzdan",
    price: 690,
    oldPrice: 890,
    image: walletsImg,
    shortDescription: "8 kart gözü, klasik iki katlı deri cüzdan.",
    description: "Klasik bifold form, 8 kart bölmesi ve banknot gözüyle günlük kullanımın vazgeçilmezi.",
    features: ["%100 hakiki deri", "8 kart gözü", "RFID koruma", "El dikişi"],
    shopierUrl: SHOPIER,
    badge: "Çok Satan",
  },
  {
    slug: "kart-cuzdan-minimal",
    name: "Minimal Kart Cüzdanı",
    category: "cuzdan",
    price: 490,
    image: walletsImg,
    shortDescription: "İnce kart cüzdanı, 6 kart kapasiteli.",
    description: "Cebinizde fark edilmeyen minimal kart cüzdanı, günlük şıklığı tamamlar.",
    features: ["%100 hakiki deri", "6 kart gözü", "RFID koruma", "Hafif"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "premium-uzun-cuzdan",
    name: "Premium Uzun Cüzdan",
    category: "cuzdan",
    price: 990,
    image: walletsImg,
    shortDescription: "Fermuarlı, uzun model premium deri cüzdan.",
    description: "12 kart, banknot ve bozuk para bölmeleriyle hepsi-bir-arada premium cüzdan.",
    features: ["%100 hakiki deri", "12 kart gözü", "Fermuarlı bozuk para", "Premium kutu"],
    shopierUrl: SHOPIER,
    badge: "Premium",
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(cat?: Category) {
  return cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS;
}

export function formatTL(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

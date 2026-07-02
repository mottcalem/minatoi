import glassesImg from "@/assets/cat-glasses.jpg";
import casesImg from "@/assets/cat-cases.jpg";
import walletsImg from "@/assets/cat-wallets.jpg";

// Cüzdan ürün görselleri
const walletClosed = "/images/products/wallets/wallet_closed_1264x848.jpg";
const walletAngle = "/images/products/wallets/wallet_angle_1264x848.jpg";
const walletModel = "/images/products/wallets/wallet_model_1080x1350.jpg";
const walletMan = "/images/products/wallets/wallet_man_1080x1350.jpg";

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
  category: Category;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  shortDescription: string;
  description: string;
  features: string[];
  shopierUrl: string;
  badge?: string;
  glasses?: GlassesDetails;
  wallet?: WalletDetails;
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
    slug: "sokrates-klasik-cuzdan",
    name: "SOKRATES — El Yapımı Hakiki Deri Klasik Erkek Cüzdanı",
    category: "cuzdan",
    price: 890,
    oldPrice: 1190,
    image: walletAngle,
    images: [walletAngle, walletClosed, walletModel, walletMan],
    shortDescription: "El yapımı hakiki deri, klasik erkek cüzdanı. 6 kart gözü, çıtçıtlı bozuk para, RFID koruma.",
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
    shopierUrl: "https://www.shopier.com/sokrates-klasik-cuzdan",
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
    slug: "aristo-minimal-cuzdan",
    name: "ARISTO — Minimal Hakiki Deri Kart Cüzdanı",
    category: "cuzdan",
    price: 690,
    image: walletClosed,
    images: [walletClosed, walletAngle],
    shortDescription: "İnce profil, 6 kart gözü, çıtçıtsız sade tasarım. Cebinde fark edilmeyen minimal cüzdan.",
    description:
      "ARISTO, sade hatları ve ince profiliyle günlük taşımacılığı kolaylaştıran minimal bir kart cüzdanıdır. " +
      "Çıtçıt mekanizması içermez; tamamen düz ve esnek yapısıyla cepte iz bırakmaz.\n\n" +
      "Hakiki deri yüzeyi kullandıkça yumuşar ve doğal bir patina geliştirir. " +
      "6 kart gözü ve gizli banknot bölmesiyle pratik kullanım sunar.",
    features: [
      "%100 hakiki deri",
      "6 kart gözü",
      "Çıtçıtsız sade tasarım",
      "Gizli banknot bölmesi",
      "İnce profil — iz bırakmaz",
    ],
    shopierUrl: "https://www.shopier.com/aristo-minimal-cuzdan",
    badge: "Yeni",
    wallet: {
      techSpecs: [
        { label: "Ürün Tipi", value: "Kart Cüzdanı" },
        { label: "Model", value: "ARISTO Minimal" },
        { label: "Malzeme", value: "%100 Hakiki Deri" },
        { label: "İşçilik", value: "El dikişi" },
        { label: "Kart Gözü Sayısı", value: "6 adet" },
        { label: "Bozuk Para Bölmesi", value: "Yok" },
        { label: "Banknot Gözü", value: "1 gizli bölme" },
        { label: "RFID Koruma", value: "Var" },
        { label: "Boyut", value: "10 × 8 cm" },
        { label: "Menşei", value: "Türkiye" },
      ],
      materials: [
        "Hakiki dana derisi",
        "Pamuklu dikiş ipi",
        "RFID korumalı iç astar",
      ],
      care: [
        "Nemli ve yumuşak bir bez ile temizleyiniz.",
        "Doğrudan güneş ışığından ve ısı kaynaklarından uzak tutunuz.",
        "Sert kimyasal temizleyiciler kullanmayınız.",
        "Deri bakım kremi ile düzenli aralıklarla besleyiniz.",
        "Suda bekletmeyiniz; ıslanırsa doğal olarak kurumaya bırakınız.",
      ],
      boxContents: [
        "1 Adet ARISTO Cüzdan",
        "Kullanım ve Bakım Bilgilendirme Kılavuzu",
      ],
      summary: [
        "%100 Hakiki Deri",
        "El Dikişi",
        "6 Kart Gözü",
        "Çıtçıtsız Sade Tasarım",
        "RFID Koruma",
        "İnce Profil",
        "Gizli Banknot Bölmesi",
        "Türkiye'de Üretilmiştir",
      ],
    },
  },
  {
    slug: "platon-uzun-cuzdan",
    name: "PLATON — Premium Hakiki Deri Uzun Cüzdan",
    category: "cuzdan",
    price: 1190,
    oldPrice: 1490,
    image: walletModel,
    images: [walletModel, walletMan, walletAngle],
    shortDescription: "Fermuarlı uzun model, 12 kart gözü, bozuk para bölmesi. Hepsibirarada premium cüzdan.",
    description:
      "PLATON, fermuarlı uzun formuyla maksimum kapasite ve düzen sunan premium bir cüzdan modelidir. " +
      "12 kart gözü, fermuarlı bozuk para bölmesi ve çift banknot gözüyle tüm ihtiyaçlarınızı tek başına karşılar.\n\n" +
      "Birinci sınıf hakiki deri ve özenli el dikişi, uzun yıllar dayanıklılık ve şıklık garanti eder. " +
      "Premium sunum kutusuyla hediyelik için de idealdir.",
    features: [
      "%100 hakiki deri, el dikişi",
      "12 kart gözü",
      "Fermuarlı bozuk para bölmesi",
      "Çift banknot gözü",
      "RFID koruma",
      "Premium sunum kutusu",
    ],
    shopierUrl: "https://www.shopier.com/platon-uzun-cuzdan",
    badge: "Premium",
    wallet: {
      techSpecs: [
        { label: "Ürün Tipi", value: "Uzun Cüzdan" },
        { label: "Model", value: "PLATON Premium" },
        { label: "Malzeme", value: "%100 Hakiki Deri" },
        { label: "İşçilik", value: "El dikişi" },
        { label: "Kart Gözü Sayısı", value: "12 adet" },
        { label: "Bozuk Para Bölmesi", value: "Fermuarlı" },
        { label: "Banknot Gözü", value: "2 adet" },
        { label: "RFID Koruma", value: "Var" },
        { label: "Boyut", value: "19 × 10 cm" },
        { label: "Menşei", value: "Türkiye" },
      ],
      materials: [
        "Birinci sınıf hakiki dana derisi",
        "Pamuklu dikiş ipi",
        "Metal fermuar mekanizması",
        "RFID korumalı iç astar",
      ],
      care: [
        "Nemli ve yumuşak bir bez ile temizleyiniz.",
        "Doğrudan güneş ışığından ve ısı kaynaklarından uzak tutunuz.",
        "Sert kimyasal temizleyiciler kullanmayınız.",
        "Deri bakım kremi ile düzenli aralıklarla besleyiniz.",
        "Suda bekletmeyiniz; ıslanırsa doğal olarak kurumaya bırakınız.",
        "Fermuarı düzenli aralıklarla temiz ve kuru tutunuz.",
      ],
      boxContents: [
        "1 Adet PLATON Cüzdan",
        "Premium Sunum Kutusu",
        "Koruyucu Bez Kılıf",
        "Kullanım ve Bakım Bilgilendirme Kılavuzu",
      ],
      summary: [
        "%100 Hakiki Deri",
        "El Dikişi",
        "12 Kart Gözü",
        "Fermuarlı Bozuk Para Bölmesi",
        "Çift Banknot Gözü",
        "RFID Koruma",
        "Premium Sunum Kutusu",
        "Türkiye'de Üretilmiştir",
      ],
    },
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

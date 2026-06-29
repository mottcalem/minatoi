import glassesImg from "@/assets/cat-glasses.jpg";
import casesImg from "@/assets/cat-cases.jpg";
import walletsImg from "@/assets/cat-wallets.jpg";

export type Category = "gozluk" | "kilif" | "cuzdan";

export const CATEGORIES: { slug: Category; label: string; description: string; image: string }[] = [
  { slug: "gozluk", label: "Gözlük", description: "UV400 korumalı premium güneş gözlükleri", image: glassesImg },
  { slug: "kilif", label: "Deri Kılıf", description: "Tam deri, el yapımı gözlük kılıfları", image: casesImg },
  { slug: "cuzdan", label: "Deri Cüzdan", description: "Minimal ve klasik deri cüzdan modelleri", image: walletsImg },
];

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
};

const SHOPIER = "https://www.shopier.com/thebullscraft";

export const PRODUCTS: Product[] = [
  // 10 gözlük
  {
    slug: "matador-aviator",
    name: "Matador Aviator",
    category: "gozluk",
    price: 1490,
    oldPrice: 1890,
    image: glassesImg,
    shortDescription: "Klasik pilot tasarımı, altın çerçeve, polarize cam.",
    description: "Matador Aviator, zamansız pilot formunu modern detaylarla buluşturuyor. Hafif metal çerçeve, polarize lens ve premium ambalaj.",
    features: ["UV400 koruma", "Polarize cam", "Altın metal çerçeve", "Deri kılıf hediye", "2 yıl garanti"],
    shopierUrl: SHOPIER,
    badge: "Çok Satan",
  },
  {
    slug: "torero-wayfarer",
    name: "Torero Wayfarer",
    category: "gozluk",
    price: 1290,
    image: glassesImg,
    shortDescription: "İkonik wayfarer formu, mat siyah asetat çerçeve.",
    description: "Torero, güçlü çene hattını destekleyen klasik wayfarer kesimiyle her stile uyum sağlar.",
    features: ["UV400 koruma", "Mat siyah asetat", "Yay menteşe", "Deri kılıf hediye"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "rancho-round",
    name: "Rancho Round",
    category: "gozluk",
    price: 1190,
    image: glassesImg,
    shortDescription: "Yuvarlak retro form, ince altın çerçeve.",
    description: "Rancho Round, vintage ruhu modern hafiflikle birleştiren ince çerçeveli yuvarlak modelimiz.",
    features: ["UV400 koruma", "İnce metal çerçeve", "Cam lens", "Hafif tasarım"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "corrida-square",
    name: "Corrida Square",
    category: "gozluk",
    price: 1390,
    image: glassesImg,
    shortDescription: "Kare çerçeve, gradient kahverengi cam.",
    description: "Corrida, güçlü hatları ve sıcak tonlardaki gradient camıyla karakterli bir duruş sunar.",
    features: ["UV400 koruma", "Gradient cam", "Kalın asetat", "Spring hinge"],
    shopierUrl: SHOPIER,
    badge: "Yeni",
  },
  {
    slug: "pampas-cat-eye",
    name: "Pampas Cat Eye",
    category: "gozluk",
    price: 1450,
    image: glassesImg,
    shortDescription: "Kadın cat-eye, klasik çizgilerle modern dokunuş.",
    description: "Pampas, zarif kedi gözü formunu güçlü bir kadın siluetiyle harmanlıyor.",
    features: ["UV400 koruma", "Polarize cam", "Asetat çerçeve", "Deri kılıf hediye"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "sierra-sport",
    name: "Sierra Sport",
    category: "gozluk",
    price: 1690,
    image: glassesImg,
    shortDescription: "Sportif sarmal form, ayna kaplama lens.",
    description: "Sierra Sport, açık hava ve sürüş için tasarlanmış sarmal yapısıyla maksimum koruma sağlar.",
    features: ["UV400 koruma", "Ayna kaplama", "TR90 esnek çerçeve", "Kayma önleyici burunluk"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "vintage-clubmaster",
    name: "Vintage Clubmaster",
    category: "gozluk",
    price: 1390,
    image: glassesImg,
    shortDescription: "Yarım çerçeve, vintage clubmaster siluet.",
    description: "Vintage Clubmaster, kahve tonları ve altın detaylarla retro şıklığın zirvesi.",
    features: ["UV400 koruma", "Yarım metal çerçeve", "Asetat kaş bandı", "Polarize"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "obsidian-black",
    name: "Obsidian Black",
    category: "gozluk",
    price: 1590,
    image: glassesImg,
    shortDescription: "Tam siyah pilot, ayna lens, bold duruş.",
    description: "Obsidian, tamamen siyaha bürünmüş cesur pilot formuyla dikkat çeker.",
    features: ["UV400 koruma", "Ayna lens", "Metal çerçeve", "Hafif yapı"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "amber-classic",
    name: "Amber Classic",
    category: "gozluk",
    price: 1290,
    image: glassesImg,
    shortDescription: "Bal rengi asetat, sıcak ton cam.",
    description: "Amber Classic, kehribar tonlarıyla zarif ve sıcak bir profil sunar.",
    features: ["UV400 koruma", "Bal rengi asetat", "Cam lens", "Hediye kutusu"],
    shopierUrl: SHOPIER,
  },
  {
    slug: "titan-flyer",
    name: "Titan Flyer",
    category: "gozluk",
    price: 1990,
    oldPrice: 2290,
    image: glassesImg,
    shortDescription: "Titanyum çerçeve, ultra hafif premium pilot.",
    description: "Titan Flyer, titanyum çerçevesi ve polarize lensiyle koleksiyonun amiral modeli.",
    features: ["UV400 koruma", "Titanyum çerçeve", "Polarize cam", "Premium ambalaj", "3 yıl garanti"],
    shopierUrl: SHOPIER,
    badge: "Premium",
  },

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
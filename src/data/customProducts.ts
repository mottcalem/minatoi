import type { Product } from "./products";

export type Customization = {
  group: "pet" | "personal";
  style: string;
  uploadLabel: string;
};

export type CustomProduct = Product & { customization: Customization };

const common = {
  price: 1290,
  oldPrice: 1590,
  sizes: ["25 × 35 cm", "35 × 50 cm", "50 × 70 cm"],
  sizePrices: [
    { size: "25 × 35 cm", price: 1290, oldPrice: 1590 },
    { size: "35 × 50 cm", price: 1790, oldPrice: 2190 },
    { size: "50 × 70 cm", price: 2390, oldPrice: 2890 },
  ],
  shopierUrl: "https://www.shopier.com/minatoi",
  features: ["4 mm temperli cam", "UV baskı", "Tasarım onayı", "Ücretsiz kargo"],
};

function custom(
  slug: string,
  name: string,
  category: string,
  image: string,
  style: string,
  group: "pet" | "personal",
): CustomProduct {
  return {
    ...common,
    slug,
    name,
    category,
    image,
    images: [image],
    featured: false,
    badge: "Kişiye Özel",
    shortDescription: `${style} stilinde, fotoğrafınızdan hazırlanan kişiye özel cam tablo.`,
    description: `Fotoğrafınız ${style} stilinde özenle hazırlanır. Siparişinizi tamamlamak için aşağıdaki alandan görselinizi yükleyin; tasarım ekibimiz üretim öncesi sizinle iletişime geçer.`,
    customization: {
      group,
      style,
      uploadLabel: group === "pet" ? "Patili dostunuzun fotoğrafı" : "Fotoğrafınız",
    },
  };
}

export const CUSTOM_PRODUCTS: CustomProduct[] = [
  custom(
    "patili-kostumlu-portre",
    "Kostümlü Patili Portre",
    "patili",
    "/images/patili-ornek-1.jpg",
    "Kostümlü portre",
    "pet",
  ),
  custom(
    "patili-karakalem",
    "Patili Karakalem İllüstrasyon",
    "patili",
    "/images/patili-ornek-2.jpg",
    "Karakalem",
    "pet",
  ),
  custom(
    "patili-sulu-boya",
    "Patili Sulu Boya İllüstrasyon",
    "patili",
    "/images/patili-ornek-3.jpg",
    "Sulu boya",
    "pet",
  ),
  custom(
    "patili-yagli-boya",
    "Patili Yağlı Boya İllüstrasyon",
    "patili",
    "/images/patili-ornek-1.jpg",
    "Yağlı boya",
    "pet",
  ),
  custom(
    "kisiye-ozel-dogrudan-baski",
    "Kişiye Özel Doğrudan Baskı",
    "kisiye-ozel",
    "/images/kisiye-ozel-ornek.jpg",
    "Doğrudan baskı",
    "personal",
  ),
  custom(
    "kisiye-ozel-karakalem",
    "Kişiye Özel Karakalem",
    "kisiye-ozel",
    "/images/kisiye-ozel-ornek.jpg",
    "Karakalem",
    "personal",
  ),
  custom(
    "kisiye-ozel-sulu-boya",
    "Kişiye Özel Sulu Boya",
    "kisiye-ozel",
    "/images/kisiye-ozel-ornek.jpg",
    "Sulu boya",
    "personal",
  ),
  custom(
    "kisiye-ozel-yagli-boya",
    "Kişiye Özel Yağlı Boya",
    "kisiye-ozel",
    "/images/kisiye-ozel-ornek.jpg",
    "Yağlı boya",
    "personal",
  ),
];

export function isCustomProduct(product: Product): product is CustomProduct {
  return "customization" in product;
}

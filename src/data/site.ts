export const SITE = {
  name: "TheBullsCraft",
  tagline: "El yapımı deri ürünler ve premium gözlük koleksiyonu",
  // TODO: gerçek bilgilerle güncelleyin
  whatsappNumber: "905555555555", // başında +/0 olmadan ülke kodu
  email: "info@thebullscraft.com",
  instagram: "https://instagram.com/thebullscraft",
  shopierStore: "https://www.shopier.com/thebullscraft",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
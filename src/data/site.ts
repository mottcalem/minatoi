export const SITE = {
  name: "TheBullsCraft",
  tagline: "El yapımı deri ürünler ve premium gözlük koleksiyonu",
  // TODO: gerçek bilgilerle güncelleyin
  whatsappNumber: "905382120458", // başında +/0 olmadan ülke kodu
  email: "hello@thebullscraft.com",
  phone: "+90 538 212 04 58",
  owner: "Uğur Doğan",
  companyType: "Şahıs Şirketi",
  taxOffice: "Alemdağ V.D.",
  taxNumber: "38134086812",
  instagram: "https://instagram.com/thebullscraft",
  shopierStore: "https://www.shopier.com/thebullscraft",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

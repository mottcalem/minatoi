export const SITE = {
  name: "MinaToi",
  tagline: "Cam Tablo Modelleri - Minatoi -Temperli cam duvar tabloları ve kişiye özel tasarımlar",
  // TODO: gerçek bilgilerle güncelleyin
  whatsappNumber: "905308702060", // başında +/0 olmadan ülke kodu
  email: "info@minatoi.com",
  phone: "+90 530 870 20 60",
  owner: "",
  companyType: "",
  taxOffice: "",
  taxNumber: "",
  instagram: "https://www.instagram.com/minatoi.art/",
  shopierStore: "#",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

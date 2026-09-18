export const SITE = {
  name: "MinaToi",
  tagline: "Cam Tablo Modelleri - Minatoi -Temperli cam duvar tabloları ve kişiye özel tasarımlar",
  // TODO: gerçek bilgilerle güncelleyin
  whatsappNumber: "905400250008", // başında +/0 olmadan ülke kodu
  email: "info@minatoi.com",
  phone: "0540 025 00 08",
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

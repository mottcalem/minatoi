export const SITE = {
  name: "MinaToi",
  tagline: "Cam Tablo Modelleri - Minatoi -Temperli cam duvar tabloları ve kişiye özel tasarımlar",
  whatsappNumber: "905400250008", // başında +/0 olmadan ülke kodu
  email: "info@minatoi.com",
  phone: "0540 025 00 08",
  owner: "",
  companyType: "",
  taxOffice: "",
  taxNumber: "7070150912",
  address: "Ateş Böceği Sokak 25/B, Buket Evler, Uskumruköy, Sarıyer / İstanbul, 34550",
  instagram: "https://www.instagram.com/minatoi.art/",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

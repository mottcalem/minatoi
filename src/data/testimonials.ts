/** Anasayfadaki "Mutlu Müşterilerimiz" bölümünün yorumları. */
export type Testimonial = {
  name: string;
  text: string;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sema Öztaş",
    text: "Köpeğime korsan kostümünü seçmiştim. Bayıldım. Çok başarılı.",
    rating: 5,
  },
  {
    name: "Cem Çankaya",
    text: "Çok güzel. Fiyatı da uygun. Kaliteden taviz vermemişsiniz. Teşekkür ederim",
    rating: 5,
  },
  {
    name: "Ayten Yetiş",
    text: "Bu kadar canlı renklerde olacağını tahmin etmemiştik. Paketlemesi de çok iyi.",
    rating: 5,
  },
  {
    name: "Ela Ak",
    text: "Benim ufak kız için aldım. Çok güzel. Çok sevindi. Elinize sağlık",
    rating: 5,
  },
  {
    name: "Seyithan Halitoğulları",
    text: "Salonuma 4 adet aldım. İçimiz açıldı. Çok mutlu olduk. Sağlam paket içinde geldi.",
    rating: 5,
  },
  {
    name: "Aylin Gider",
    text: "Çok sevdim. Çok yakıştı salonuma. İyide paketlenmişti",
    rating: 4,
  },
  {
    name: "Cansu Dağcı",
    text: "çok korktum sağlam gelmez diye. ama süper paketleme. elinize sağlık",
    rating: 5,
  },
];

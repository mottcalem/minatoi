/**
 * Anasayfadaki "Mutlu Müşterilerimiz" bölümünün yorumları.
 * BU LİSTEYİ kendi müşteri yorumlarınızla değiştirin — her öğe:
 *   name: müşteri adı, text: yorum, rating: 1-5 yıldız.
 */
export type Testimonial = {
  name: string;
  text: string;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Müşteri Yorumu 1",
    text: "Buraya müşteri yorumunu yazın — ürün ve hizmet deneyimini anlatsın.",
    rating: 5,
  },
  {
    name: "Müşteri Yorumu 2",
    text: "İkinci yorum örneği. Listeyi büyütüp küçültebilirsiniz; karusel uyarlanır.",
    rating: 5,
  },
  {
    name: "Müşteri Yorumu 3",
    text: "Üçüncü yorum örneği. Yıldız sayısı 1-5 arasında verilebilir.",
    rating: 4,
  },
  {
    name: "Müşteri Yorumu 4",
    text: "Dördüncü yorum örneği. Gerçek yorumlarınızı ekleyince bu satır silinir.",
    rating: 5,
  },
];

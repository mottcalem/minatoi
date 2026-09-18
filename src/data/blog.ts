// Blog yazıları veri dosyası — yeni yazılar ileride bu listeye eklenebilir.

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  tags: string[];
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "fotograftan-kisiye-ozel-cam-tablo-nasil-hazirlanir",
    title: "Fotoğraftan Kişiye Özel Cam Tablo Nasıl Hazırlanır?",
    metaTitle: "Fotoğraftan Kişiye Özel Cam Tablo Rehberi | MinaToi",
    metaDescription:
      "Fotoğraf seçimi, ölçü ve tasarım türüyle kişiye özel cam tablo siparişinizi kolayca hazırlayın.",
    excerpt:
      "Sevdiğiniz bir kareyi kalıcı bir duvar dekoruna dönüştürürken fotoğraf, ölçü ve tasarım türünü nasıl seçmeniz gerektiğini anlatıyoruz.",
    coverImage: "/images/kisiye-ozel-ornek.jpg",
    publishedAt: "2026-09-15",
    updatedAt: "2026-09-15",
    readingTime: 4,
    tags: ["kişiye özel cam tablo", "fotoğraftan tablo", "duvar dekorasyonu"],
    content: `
      <h2>İyi bir fotoğrafla başlayın</h2>
      <p>Kişiye özel bir tablo, seçtiğiniz anının duvardaki yeni hâlidir. Bu nedenle mümkün olduğunca net, iyi ışıkta çekilmiş ve ana konunun rahatça ayırt edilebildiği bir fotoğraf seçmenizi öneririz. Portrelerde göz hizasından çekilmiş kareler; aile ve çift fotoğraflarında ise yüzlerin gölgede kalmadığı görüntüler çok daha dengeli sonuç verir.</p>
      <h2>Doğrudan bası mı, illüstrasyon mu?</h2>
      <p>Fotoğrafın doğal renklerini ve detaylarını korumak istiyorsanız doğrudan bası sizin için uygundur. Daha yorumlanmış, sanatsal bir çalışma arıyorsanız sulu boya, yağlı boya veya kara kalem gibi illüstrasyon stillerini tercih edebilirsiniz. Her iki seçeneği de <a href="/kisiye-ozel">Kişiye Özel Tasarım</a> sayfamızda fotoğrafınızı yükleyerek inceleyebilirsiniz.</p>
      <h2>Ölçü ve yön seçimi</h2>
      <p>Fotoğrafınız dikeyse dikey, yataysa yatay oranı seçmek görüntünün kırpılmadan öne çıkmasına yardımcı olur. Küçük bir anı köşesi için 25 × 35 cm; salon veya geniş duvarlar için 50 × 70 cm ve üzeri ölçüler daha güçlü bir etki yaratır.</p>
      <h2>Tasarımınıza kişisel bir anlam katın</h2>
      <p>Yeni ev, doğum günü veya yıl dönümü için hazırlanan bir tabloyu, seçtiğiniz anının kısa hikâyesiyle birlikte hediye edebilirsiniz. Böylece tasarım yalnızca dekoratif değil, kişisel bir hatıraya da dönüşür.</p>
    `,
  },
  {
    slug: "patili-dostunuz-icin-portre-fotografi-secme-rehberi",
    title: "Patili Dostunuz İçin En Güzel Portre Fotoğrafını Seçme Rehberi",
    metaTitle: "Evcil Hayvan Portresi İçin Fotoğraf Seçme Rehberi | MinaToi",
    metaDescription:
      "Kedi veya köpeğinizin fotoğrafını kişiye özel portreye dönüştürmeden önce dikkat etmeniz gerekenler.",
    excerpt:
      "Patili dostunuzun karakterini en iyi yansıtan kareyi seçmenin dört kolay yolu: ışık, açı, ifade ve kadraj.",
    coverImage: "/images/patili-ornek-1.jpg",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-15",
    readingTime: 3,
    tags: ["evcil hayvan portresi", "kedi tablosu", "köpek tablosu"],
    content: `
      <h2>Karakterini gösteren bir an seçin</h2>
      <p>En güzel evcil hayvan portresi, sadece fiziksel benzerliği değil; dostunuzun meraklı bakışını, sakin duruşunu veya oyunbaz hâlini de taşır. Kameraya baktığı, yüzünün net olduğu ve sevdiğiniz ifadesini yakaladığınız fotoğraflar iyi bir başlangıçtır.</p>
      <h2>Işık ve kadraj neden önemli?</h2>
      <p>Doğal gün ışığı tüy, göz ve yüz detaylarını dengeli şekilde gösterir. Çok karanlık ya da arkadan güçlü ışık alan fotoğraflar ayrıntıları kaybettirebilir. Kedinizin veya köpeğinizin yüzü kadrajın merkezinde, kulakları ve çenesi görünür durumdaysa tasarım ekibinin çalışması daha rahat olur.</p>
      <h2>Kostümlü mü, illüstrasyonlu mu?</h2>
      <p>Onu eğlenceli bir karaktere dönüştürmek istiyorsanız kostümlü portre; daha yumuşak ve sanatsal bir görünüm için illüstrasyon portre uygundur. <a href="/patili-dostlara-ozel">Patili Dostlara Özel</a> sayfasından her iki türü, ölçüyü ve tasarım stilini seçebilirsiniz.</p>
      <h2>Hatırayı evinizin en güzel köşesine taşıyın</h2>
      <p>Özel bir patili dost portresi, yaşam alanında her gün sizi gülümsetecek kişisel bir detay olur. Tasarım türü ve ölçü seçiminizi <a href="/patili-dostlara-ozel">Patili Dostlara Özel</a> sayfamızdan kolayca belirleyebilirsiniz.</p>
    `,
  },
  {
    slug: "anlamli-hediye-fikirleri-kisiye-ozel-tasarimlar",
    title: "Anlamlı Hediye Fikirleri: Kişiye Özel Tasarımlar",
    metaTitle: "Anlamlı Kişiye Özel Hediye Fikirleri | MinaToi",
    metaDescription:
      "Doğum günü, yıl dönümü ve yeni ev için kişiye özel tasarım ve el yapımı aksesuar hediye fikirleri.",
    excerpt:
      "Bazı hediyeler yalnızca bir eşya değil, bir anıyı da taşır. Özel günler için kişisel ve uzun ömürlü seçenekleri derledik.",
    coverImage: "/images/patili-ornek-3.jpg",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-15",
    readingTime: 4,
    tags: ["hediye fikirleri", "kişiye özel tasarım", "el yapımı hediye"],
    content: `
      <h2>Bir anıyı hediye edin</h2>
      <p>Birlikte çekilmiş bir fotoğraf, aile portresi veya sevilen bir manzara; kişiye özel bir tasarıma dönüştüğünde yıllarca hatırlanacak bir hediyeye dönüşür. Özellikle yeni ev, yıl dönümü ve doğum günü için duvarda kalıcı bir yer bulan tasarımlar güçlü bir anlam taşır.</p>
      <h2>Hediye sahibinin tarzına göre seçim yapın</h2>
      <p>Minimal ve zamansız detayları sevenler için doğrudan bası; sanatla bağ kuranlar için ise illüstrasyonlu tasarım daha doğru bir seçim olabilir. Evcil hayvan sahipleri için patili dostlarının portresi ise her gün gülümsetecek kişisel bir alternatiftir.</p>
      <h2>Hediyeyi kişiselleştirin</h2>
      <p>Hediye sahibinin sevdiği bir anı, mekân veya patili dostunun fotoğrafı tasarımın merkezine yerleştiğinde ortaya yalnızca ona ait bir çalışma çıkar. Seçtiğiniz kareyi tasarım ekibimizle paylaşarak süreci kolayca başlatabilirsiniz.</p>
      <p>Kişiye özel cam tablo ve portre seçeneklerini <a href="/kisiye-ozel">Kişiye Özel</a> ya da <a href="/patili-dostlara-ozel">Patili Dostlara Özel</a> sayfalarımızdan başlatabilirsiniz.</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getLatestPosts(count?: number): BlogPost[] {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return count ? sorted.slice(0, count) : sorted;
}

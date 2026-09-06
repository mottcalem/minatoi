// Blog yazıları veri dosyası — MinaToi SEO içerikleri

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number; // dakika
  tags: string[];
  content: string; // HTML string
};

export const BLOG_POSTS: BlogPost[] = [
  // ─── 1. Hakiki Deri Cüzdan Rehberi ────────────────────────────────────────
  {
    slug: "hakiki-deri-cuzdan-rehberi",
    title: "Hakiki Deri Cüzdan Rehberi: Satın Almadan Önce Bilmeniz Gereken Her Şey",
    metaTitle: "Hakiki Deri Cüzdan Rehberi 2026 | MinaToi",
    metaDescription: "Hakiki deri cüzdan satın alırken nelere dikkat etmelisiniz? Tam grain, top grain, split leather farkları, fiyat-kalite dengesi ve en iyi modeller bu rehberde.",
    excerpt: "Hakiki deri cüzdan almayı düşünüyorsunuz ancak tam grain, top grain, split leather gibi terimler kafanızı karıştırıyor mu? Bu rehber piyasada satılan her deri türünü, kalite kriterlerini ve doğru seçim yapmanın yollarını açıklıyor.",
    coverImage: "/images/products/sokrates/man.jpg",
    publishedAt: "2026-06-10",
    updatedAt: "2026-07-04",
    readingTime: 9,
    tags: ["hakiki deri cüzdan", "deri cüzdan", "erkek cüzdan", "deri türleri", "cüzdan rehberi"],
    content: `
<article>
  <h2>Hakiki Deri Nedir? Piyasadaki Deri Türleri</h2>
  <p>Deri ürün alırken karşılaşacağınız en önemli kavram <strong>hakiki deri</strong> meselesidir. Ancak "hakiki deri" ibaresi tek başına yeterli değildir; zira derinin hangi tabakasından elde edildiği kaliteyi doğrudan belirler.</p>

  <h3>Full Grain (Tam Tane) Deri</h3>
  <p>Hayvan derisinin en üst, en sağlam tabakasıdır. Hiçbir zımparalama veya düzeltme yapılmaz; derinin doğal dokusu, damarları ve karakteri korunur. <strong>Full grain deri cüzdanlar</strong> yıllar içinde güzel bir patina (renk derinliği) geliştirir ve onlarca yıl kullanılabilir. MinaToi ürünleri full grain hakiki dana derisinden üretilmektedir.</p>

  <h3>Top Grain (Üst Tane) Deri</h3>
  <p>Derinin üst tabakasına hafif zımparalama uygulanarak düzeltilmiş halidir. Full grain kadar dayanıklı olmasa da piyasada sıkça kullanılan kaliteli bir deri türüdür. Çoğu orta-üst segment cüzdanda kullanılır.</p>

  <h3>Split Leather (Bölünmüş/Alt Tabaka) Deri</h3>
  <p>Derinin alt katmanından elde edilir, üzeri genellikle suni kaplama ile kaplanır. "Hakiki deri" olarak satılabilir ancak dayanıklılığı çok düşüktür. Birkaç yıl içinde kabarma, soyulma ve çatlama yapar.</p>

  <h3>PU / Suni Deri</h3>
  <p>Tamamen poliüretan bazlı yapay bir malzemedir. Gerçek deriyle hiçbir ilgisi yoktur ancak "vegan deri" veya "ekolojik deri" gibi isimlerle pazarlanabilir. Uzun ömürlü değildir.</p>

  <h2>Hakiki Deri Cüzdan Seçerken Dikkat Edilecek 5 Kriter</h2>

  <h3>1. Deri Kalitesi ve Kökeni</h3>
  <p>Satıcıdan hangi tabaka deri kullanıldığını açıkça sorun. "Full grain" veya "tam tane" ifadesi en kaliteli göstergedir. Türkiye'de üretilen ve menşei belirtilen ürünler tercih edilmeli; belirsiz "ithal deri" ibarelerine dikkat edilmelidir.</p>

  <h3>2. Dikiş Kalitesi</h3>
  <p><strong>El dikişi</strong> (hand stitching) makine dikişinden çok daha dayanıklıdır. Çift iğne saddle stitch yöntemi, bir dikiş kopsa bile diğeri tutmaya devam ettiği için tercih edilir. Dikişlerin düzenli, eşit ve pamuklu/balmumu ip ile yapılmış olması kalite göstergesidir.</p>

  <h3>3. Kenar İşçiliği</h3>
  <p>Kaliteli bir deri cüzdanda kenarlar ham bırakılmaz; elle perdahlanır veya boya ile bitirilir. Ham kenarlar zamanla açılır ve ürünün ömrünü kısaltır.</p>

  <h3>4. Donanım ve Metal Aksamlar</h3>
  <p>Çıtçıt, fermuar ve toka gibi metal aksamların kalitesi cüzdanın ömrünü doğrudan etkiler. Pirinç veya çelik aksamlar daha dayanıklıdır; alaşım (zamak) aksamlar kısa sürede okside olabilir.</p>

  <h3>5. RFID Koruma</h3>
  <p>Temassız banka ve kredi kartları RFID skimming saldırılarına karşı savunmasız olabilir. RFID korumalı cüzdanlar, kartlarınızın bilgilerini yetkisiz okumalardan korur. <a href="/urun/sokrates-klasik-cuzdan">SOKRATES modelimiz</a> RFID koruma katmanıyla üretilmektedir.</p>

  <h2>Deri Cüzdan Fiyatları: Ne Kadar Bütçe Ayırmalısınız?</h2>
  <p>Gerçek kaliteli bir hakiki deri cüzdan için Türkiye'de 500–1500 TL arasında bütçe ayırmanız gerekir. Bu fiyatın altındaki "hakiki deri" iddiasındaki ürünler genellikle split leather veya suni deri içermektedir.</p>

  <p>Yüksek kaliteli el yapımı bir cüzdan 10–20 yıl rahatlıkla kullanılabilir. Bu perspektiften bakıldığında, ucuz bir cüzdanı her 2–3 yılda bir değiştirmek, kaliteli bir ürün almaktan daha pahalıya gelmektedir.</p>

  <h2>MinaToi Cüzdanlarında Kullanılan Deri</h2>
  <p>MinaToi olarak tüm ürünlerimizde birinci sınıf full grain hakiki dana derisi kullanıyoruz. Her cüzdan atölyemizde tek tek elle kesilir, çift iğne el dikiş yöntemiyle dikilir ve kenarları elle perdahlanır. Hiçbir ürünümüzde suni deri, PU kaplama veya split leather kullanılmamaktadır.</p>

  <p><a href="/urunler">Tüm deri cüzdan ve kartlık modellerimizi inceleyebilirsiniz →</a></p>
</article>
`,
  },

  // ─── 2. Deri Kartlık Nasıl Seçilir ────────────────────────────────────────
  {
    slug: "deri-kartlik-nasil-secilir",
    title: "Deri Kartlık Nasıl Seçilir? 2026 Alıcı Rehberi",
    metaTitle: "Deri Kartlık Nasıl Seçilir? | Hakiki Deri Kartlık Modelleri | MinaToi",
    metaDescription: "Hakiki deri kartlık seçerken kapasite, boyut, dikiş kalitesi ve RFID koruma kriterlerine dikkat edin. En iyi deri kartlık modelleri ve fiyatları bu rehberde.",
    excerpt: "Cüzdansız yaşayan, sadece birkaç kart ve belki biraz nakit taşıyan minimalist bir hayat mı istiyorsunuz? Doğru deri kartlık seçimi için bu rehberi okuyun.",
    coverImage: "/images/products/frege-kartlik/in-hand.jpg",
    publishedAt: "2026-06-18",
    updatedAt: "2026-07-04",
    readingTime: 7,
    tags: ["deri kartlık", "hakiki deri kartlık", "slim cüzdan", "kartlık modelleri", "minimalist cüzdan"],
    content: `
<article>
  <h2>Kartlık mı, Cüzdan mı? Hangisi Sizin İçin Doğru?</h2>
  <p>Modern hayatta birçok insan artık sadece 2–5 kart taşıyor: banka kartı, kimlik, ulaşım kartı ve belki bir kredi kartı. Bu profildeki kullanıcılar için geleneksel büyük cüzdanlar gereksiz yer kaplar ve cepte şişkinliğe yol açar. İşte bu noktada <strong>deri kartlık</strong> devreye girer.</p>

  <p>Bir kartlık, ince profiliyle ceplerinizde neredeyse hissedilmez; günlük ihtiyaçlarınızı karşılarken stilinizi de tamamlar.</p>

  <h2>Deri Kartlık Türleri</h2>

  <h3>Slim / Bifold Kartlık</h3>
  <p>İki katlı açılan, hem kart bölmesi hem dar bir nakit bölmesi olan modeldir. 4–8 kart kapasitesi sunar. Klasik cüzdan formunu korurken daha ince bir profil sağlar.</p>

  <h3>Sleeve / Kılıf Kartlık</h3>
  <p>Deri bir kılıf içine kartların sıkıştırıldığı ultra-slim modeldir. Genellikle 2–4 kart alır, nakit bölmesi yoktur. Cepte neredeyse his olmaz. <a href="/urun/frege-kartlik">FREGE modelimiz</a> bu kategoridedir.</p>

  <h3>Accordion / Körüklü Kartlık</h3>
  <p>Körük yapısı sayesinde 8–12 kart kapasitesi sunar. Daha geniş kapasite gerektirenler için tercih edilir ancak slim değildir.</p>

  <h3>Money Clip Kartlık</h3>
  <p>Metal klips ile nakit paraları tutan, yanında kart bölmesi bulunan modeldir. Hem kart hem nakit taşıyanlar için pratik bir seçimdir.</p>

  <h2>Doğru Deri Kartlık Seçimi İçin 6 Kriter</h2>

  <h3>1. Kapasite İhtiyacınızı Belirleyin</h3>
  <p>Günlük taşıdığınız kart sayısını sayın. Çoğu insan 3–5 kart taşır. Buna göre kapasite seçin; fazla kapasiteli kartlık zaten gereksiz şişer.</p>

  <h3>2. Nakit Taşıyacak mısınız?</h3>
  <p>Nakit para taşımayı tercih ediyorsanız dar bir banknot bölmesi olan modeller; yalnızca kart taşıyacaksanız ultra-slim sleeve modeller tercih edilmelidir.</p>

  <h3>3. Deri Kalitesi</h3>
  <p>Kartlıklar sürekli cepte taşındığı için sürtünme ve baskıya maruz kalır. Full grain hakiki deri bu koşullarda yıllarca dayanır. Suni deri veya split leather kartlıklar 1–2 yıl içinde bozulur.</p>

  <h3>4. Dikiş ve Kenar İşçiliği</h3>
  <p>El dikişi ile makine dikişi arasındaki fark kartlıklarda çok belirgindir. Elle yapılmış saddle stitch, cepte taşıma sırasında oluşan sürtünmeye çok daha iyi dayanır.</p>

  <h3>5. RFID Koruma</h3>
  <p>Temassız kartlarınız RFID okuyuculara karşı savunmasız olabilir. Özellikle toplu taşıma kullananlar veya kalabalık ortamlarda bulunanlar için RFID korumalı kartlık tercih edilmelidir.</p>

  <h3>6. Boyut ve Kalınlık</h3>
  <p>Ön cep mi, arka cep mi, yoksa ceket iç cebi mi kullanacaksınız? Buna göre boyut belirleyin. Ön cep için maksimum 8×11 cm ve dolmamış halde 5 mm altı kalınlık idealdir.</p>

  <h2>MinaToi Kartlık Modelleri</h2>

  <h3>FREGE — Slim Deri Kartlık</h3>
  <p>Sleeve tarzda, ön hızlı erişim bölmesiyle 3–6 kart kapasiteli ultra-slim bir kartlıktır. Full grain hakiki dana derisi, el dikişi ve elle perdahlanmış kenarlarıyla uzun yıllar kullanılabilir. Cepte his vermez.</p>

  <h3>PHILO — Modern Deri Kartlık</h3>
  <p>Balmumu ip ile çift iğne saddle stitch tekniğiyle üretilen PHILO, hem kart hem dar nakit bölmesiyle günlük ihtiyaçları karşılar. Tamamen el işçiliğiyle üretilmektedir.</p>

  <p><a href="/kategori/cuzdan">Tüm deri kartlık ve cüzdan modellerini görün →</a></p>
</article>
`,
  },

  // ─── 3. El Yapımı vs Makine Üretimi ───────────────────────────────────────
  {
    slug: "el-yapimi-deri-cuzdan-vs-makine-uretimi",
    title: "El Yapımı Deri Cüzdan mı, Makine Üretimi mi? Farkları ve Hangisini Seçmeli",
    metaTitle: "El Yapımı Deri Cüzdan vs Makine Üretimi | MinaToi Blog",
    metaDescription: "El yapımı deri cüzdan ile makine üretimi arasındaki gerçek farklar neler? Dikiş teknikleri, dayanıklılık, fiyat ve estetik açısından kapsamlı karşılaştırma.",
    excerpt: "El yapımı deri cüzdan ile fabrika üretimi bir cüzdan arasındaki fark sadece fiyat değil. Dikiş tekniği, malzeme kalitesi ve uzun vadeli dayanıklılık açısından iki dünya arasındaki gerçek ayrım nedir?",
    coverImage: "/images/products/sokrates/open.jpg",
    publishedAt: "2026-06-25",
    updatedAt: "2026-07-04",
    readingTime: 8,
    tags: ["el yapımı deri cüzdan", "handmade leather wallet", "deri cüzdan kalitesi", "saddle stitch", "zanaat"],
    content: `
<article>
  <h2>El Yapımı Dericilik: Kaybolmaya Yüz Tutan Bir Zanaat</h2>
  <p>Endüstriyel devrimden bu yana el zanaatları büyük fabrika üretimiyle rekabet etmek zorunda kaldı. Deri aksesuar sektöründe de aynı süreç yaşandı: hızlı, ucuz ve seri makine üretimi piyasaya hakim oldu. Ancak gerçek kaliteyi arayanlar için el yapımı deri cüzdan hâlâ rakipsizdir.</p>

  <h2>Dikiş Tekniklerindeki Temel Fark</h2>

  <h3>Makine Dikişi: Kilit Dikiş (Lockstitch)</h3>
  <p>Endüstriyel dikiş makineleri <em>kilit dikiş</em> (lockstitch) tekniğini kullanır. Bu teknikte üst ip ve alt masura ipi birbirini kilitler. Sorun şu: bir noktada dikiş koptuğunda, kilit mekanizması bozulduğu için tüm dikiş hattı sökülmeye başlar. Ayrıca makineler deriyi çok hızlı işlediği için dikiş gerginliği tutarsız olabilir.</p>

  <h3>El Dikişi: Saddle Stitch (Eyer Dikişi)</h3>
  <p><strong>Saddle stitch</strong>, iki iğnenin aynı delikten ters yönde geçirilmesiyle oluşturulan çift iplikli bir dikiş tekniğidir. Atların eyer takımlarında kullanılmasıyla köklü bir tarihi vardır. Bu tekniğin avantajı şudur: bir dikiş noktası kopsa bile, her dikiş bağımsız olduğu için yırtılma tüm hatta yayılmaz. Sadece o nokta tamire muhtaç olur.</p>

  <p>Bunun yanı sıra, deneyimli bir derici her dikişi elle atarken gerginliği hissederek ayarlar. Bu da son derece düzenli, sıkı ve estetik bir dikiş hattı oluşturur.</p>

  <h2>Malzeme Seçimindeki Fark</h2>
  <p>Büyük fabrikalar maliyet optimizasyonu yapmak zorundadır. Bu nedenle genellikle split leather veya sıkıştırılmış deri talaşından yapılmış yeniden yapılandırılmış deri (bonded leather) kullanırlar. Bunların üzerine hakiki deri görünümü veren polyuretan kaplama yapılır.</p>

  <p>El yapımı dericiler ise genellikle malzemeyi bizzat seçer. Full grain deri satın alırken her tabakayı, dokuyu ve olası kusurları tek tek inceler. Kusurlu bölgeler kesilip atılır; ürüne yalnızca sağlam kısımlar girer.</p>

  <h2>Kenar İşçiliği: Göz Ardı Edilen Kalite Göstergesi</h2>
  <p>Bir deri cüzdanın kalitesini anlamanın en kolay yolu kenarlarına bakmaktır. Fabrika ürünlerinde kenarlar ya ham bırakılır, ya basit boya sürülür ya da kenar bant yapıştırılır.</p>

  <p>El yapımı üretimde ise kenarlar şu adımlardan geçer:</p>
  <ul>
    <li>Kaba zımpara ile düzeltme</li>
    <li>Kenar şekillendirici (edge beveler) ile köşelerin yumuşatılması</li>
    <li>Islatma ve perdahlama (burnishing) ile pürüzsüz yüzey oluşturma</li>
    <li>Kenar boyası veya doğal balmumu ile bitirme</li>
  </ul>
  <p>Bu süreç zaman alıcıdır ama sonuç: yıllarca açılmayan, soyulmayan ve şıklığını koruyan kenarlar.</p>

  <h2>Fiyat Farkını Nasıl Yorumlamalı?</h2>
  <p>El yapımı bir deri cüzdan, fabrika ürününden 3–5 kat daha pahalı olabilir. Ancak bu fiyat farkına bakış açısını değiştirmek gerekir:</p>
  <ul>
    <li>Ucuz bir cüzdan 2–3 yılda biter → 10 yılda 3–5 yenisi = çok daha yüksek maliyet</li>
    <li>Kaliteli el yapımı bir cüzdan 10–20 yıl kullanılır → gerçek maliyet aslında düşüktür</li>
  </ul>
  <p>Üstelik iyi el yapımı deri zamanla güzelleşir. Kullanıldıkça geliştirilen <strong>patina</strong>, her kullanıcıya özgü bir renk derinliği oluşturur ve cüzdanı kişisel bir nesneye dönüştürür.</p>

  <h2>MinaToi'ın El Yapımı Üretim Süreci</h2>
  <p>MinaToi atölyesinde her ürün şu adımlardan geçer:</p>
  <ol>
    <li>Full grain hakiki deri seçimi ve kalite kontrolü</li>
    <li>Şablona göre elle kesim (clicker press değil, elle bıçak)</li>
    <li>Saddle stitch için dikiş delikleri elle açılır</li>
    <li>Çift iğne saddle stitch ile elle dikiş</li>
    <li>Kenar perdahlama ve bitirme</li>
    <li>Son kalite kontrolü</li>
  </ol>
  <p>Bu süreç bir ürün için saatler alır; ancak ortaya çıkan ürün onlarca yıl kullanılabilecek kalitededir.</p>

  <p><a href="/urunler">El yapımı deri ürünlerimizi keşfetmek için tıklayın →</a></p>
</article>
`,
  },

  // ─── 4. Toptan Deri Cüzdan ────────────────────────────────────────────────
  {
    slug: "toptan-deri-cuzdan-tedarikci-rehberi",
    title: "Toptan Deri Cüzdan: Kurumsal ve Toplu Sipariş Rehberi",
    metaTitle: "Toptan Deri Cüzdan | Kurumsal Hediye ve Toplu Sipariş | MinaToi",
    metaDescription: "Toptan deri cüzdan ve deri aksesuar siparişi için tedarikçi seçim kriterleri, kurumsal hediyecilik avantajları ve MinaToi toplu sipariş süreci hakkında kapsamlı rehber.",
    excerpt: "Kurumsal hediye olarak veya bayilik amacıyla toptan deri cüzdan almayı mı düşünüyorsunuz? Tedarikçi seçimi, minimum sipariş miktarları ve kişiselleştirme seçenekleri hakkında bilmeniz gereken her şey bu yazıda.",
    coverImage: "/images/products/sokrates/angle.jpg",
    publishedAt: "2026-06-30",
    updatedAt: "2026-07-04",
    readingTime: 8,
    tags: ["toptan deri cüzdan", "kurumsal deri hediye", "deri cüzdan toptan", "logo baskılı cüzdan", "kurumsal hediyecilik"],
    content: `
<article>
  <h2>Toptan Deri Cüzdan Pazarı: Kimler Talep Ediyor?</h2>
  <p>Türkiye'de toptan deri cüzdan ve deri aksesuar talebinin başlıca kaynakları şunlardır:</p>
  <ul>
    <li><strong>Kurumsal hediyecilik:</strong> Yıl sonu hediyeleri, müşteri takdir ödülleri, çalışan memnuniyet hediyeleri</li>
    <li><strong>Bayiler ve butikler:</strong> Kendi mağazalarında satmak üzere toplu alım yapan perakendeciler</li>
    <li><strong>Organizasyon firmaları:</strong> Etkinlik, düğün, mezuniyet ve özel gün hediyeleri</li>
    <li><strong>Şirket tanıtım hediyeleri:</strong> Logo kazımalı, marka kimliğini yansıtan kurumsal aksesuarlar</li>
  </ul>

  <h2>Toptan Deri Cüzdan Tedarikçisi Seçerken 7 Kritik Nokta</h2>

  <h3>1. Deri Kaynağı ve Kalitesi</h3>
  <p>Toptan alımlarda fiyat baskısı tedarikçileri kalite düşürmeye iter. Tedarikçiden açıkça "hangi deri tabakasını kullanıyorsunuz?" diye sorun. Full grain veya top grain isteyin; split leather veya suni derili ürünler toplu hediye olarak verildiğinde prestij kaybına yol açar.</p>

  <h3>2. Minimum Sipariş Miktarı (MOQ)</h3>
  <p>Büyük fabrikalar genellikle yüksek MOQ (Minimum Order Quantity) talep eder: 50, 100 veya daha fazla adet. El yapımı atölye üreticileri ise çok daha esnek MOQ sunar; bazıları 10–20 adet gibi küçük miktarlarda da üretim yapar.</p>

  <h3>3. Kişiselleştirme Seçenekleri</h3>
  <p>Kurumsal siparişlerde logo veya isim kazıma (embossing/debossing) büyük önem taşır. Tedarikçinin hangi kişiselleştirme tekniklerini sunduğunu, minimum ne kadar siparişte uyguladığını ve görsel tasarım sürecinin nasıl işlediğini öğrenin.</p>

  <h3>4. Üretim Süresi</h3>
  <p>Toplu el yapımı üretim zaman alır. Yıl sonu hediyelerinizi Kasım başında sipariş etmek yerine Eylül–Ekim ayında sipariş etmek daha güvenlidir. Acele siparişlerde kalite düşebilir veya teslim süresi gecikebilir.</p>

  <h3>5. Numune Alma İmkânı</h3>
  <p>Toplu sipariş vermeden önce mutlaka numune alın. Ürünü elinizde tutun, dikişleri inceleyin, derinin kokusunu ve dokusunu kontrol edin. Güvenilir tedarikçiler numune almayı kolaylaştırır.</p>

  <h3>6. Referanslar ve Geçmiş Siparişler</h3>
  <p>Tedarikçiden daha önce kurumsal sipariş verdikleri firmaların referanslarını isteyin. Sosyal medyada üretim süreçlerini paylaşan, şeffaf çalışan atölyeler tercih edilmelidir.</p>

  <h3>7. Teslimat ve Paketleme</h3>
  <p>Kurumsal hediyeler için özel ambalaj (hediye kutusu, kurumsal kartvizit, deri kılıf) önemlidir. Toplu siparişlerde her ürünün aynı standartta paketlenip paketlenmediğini önceden netleştirin.</p>

  <h2>Kurumsal Hediye Olarak Deri Cüzdan: Neden İyi Bir Tercih?</h2>
  <p>Deri aksesuarlar kurumsal hediye olarak üç önemli avantaj sunar:</p>
  <ol>
    <li><strong>Uzun ömür:</strong> Kaliteli bir deri cüzdan yıllarca kullanılır; markanız her gün görünür olur.</li>
    <li><strong>Prestij algısı:</strong> El yapımı hakiki deri, alıcıda "özen gösterildi" hissi yaratır.</li>
    <li><strong>Kişiselleştirme:</strong> Logo veya isim kazıma, hediyeyi özel ve hatırlanabilir kılar.</li>
  </ol>

  <h2>MinaToi ile Toptan ve Kurumsal Sipariş</h2>
  <p>MinaToi olarak kurumsal ve toplu siparişlere özel fiyatlandırma ve kişiselleştirme hizmetleri sunuyoruz. Minimum sipariş miktarı esnektir; logo debossing, isim kazıma ve özel renk seçenekleri mevcuttur.</p>
  <p>Toptan sipariş için WhatsApp veya e-posta üzerinden iletişime geçebilirsiniz. Siparişinizi birlikte planlayalım.</p>

  <p><a href="/iletisim">Kurumsal sipariş için iletişime geçin →</a></p>
</article>
`,
  },

  // ─── 5. Deri Cüzdan Bakım Rehberi ─────────────────────────────────────────
  {
    slug: "deri-cuzdan-bakim-rehberi",
    title: "Deri Cüzdan Bakım Rehberi: Ömrünü İkiye Katlayacak 10 Adım",
    metaTitle: "Deri Cüzdan Bakımı Nasıl Yapılır? | MinaToi Blog",
    metaDescription: "Hakiki deri cüzdanınızı uzun yıllar güzel tutmanın sırları: temizleme, besleme, nemlendirme, depolama ve patina oluşturma hakkında eksiksiz bakım rehberi.",
    excerpt: "İyi bir deri cüzdan bakımı yapılmadığında bile yıllarca kullanılabilir. Ama düzenli bakım yapıldığında onlarca yıl sürer ve zamanla daha güzel bir hal alır. İşte hakiki deri cüzdanınızı mükemmel tutacak 10 adımlı bakım rehberi.",
    coverImage: "/images/products/sokrates/closed.jpg",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-04",
    readingTime: 7,
    tags: ["deri cüzdan bakımı", "deri bakım kremi", "hakiki deri temizlik", "deri patina", "cüzdan ömrü"],
    content: `
<article>
  <h2>Neden Deri Bakımı Bu Kadar Önemli?</h2>
  <p>Hakiki deri aslında bir hayvan derisinin işlenmiş halidir ve doğal olarak nem, yağ ve esnekliğe ihtiyaç duyar. Hiç bakım yapılmayan deri zamanla kurur, çatlar ve soluklaşır. Oysa düzenli bakım yapılan deri nem dengesini korur, esnekliğini kaybetmez ve güzel bir patina geliştirir.</p>

  <h2>10 Adımlı Deri Cüzdan Bakım Rehberi</h2>

  <h3>1. Rutin Temizlik: Kuru Bez Yeterlidir</h3>
  <p>Haftada bir kez yumuşak, kuru veya hafif nemli bir mikrofiber bez ile cüzdanınızı silin. Bu, yüzeyde biriken toz ve hafif kirleri uzaklaştırır. Kağıt havlu veya sert bez kullanmayın; çizik bırakabilir.</p>

  <h3>2. Derin Temizlik: Sabunlu Su veya Deri Temizleyici</h3>
  <p>Ciddi lekeler için birkaç damla hafif sıvı sabun ile oluşturulan köpükten az miktarı yumuşak bezle lekeye uygulayın. Asla suya batırmayın veya ıslatmayın. Ardından temiz nemli bezle sabunu alın ve doğal havada kurumaya bırakın. Saç kurutma makinesi gibi yapay ısı kaynaklarına yaklaştırmayın.</p>

  <h3>3. Deri Besleme: Bakım Kremi</h3>
  <p>2–3 ayda bir <strong>deri bakım kremi</strong> (leather conditioner) uygulayın. İyi bir bakım kremi derinin nem dengesini korur ve kurumasını önler. Ürünü küçük dairesel hareketlerle uygulayın, 10–15 dakika bekletin, ardından temiz bezle fazlalığı alın.</p>
  <p>Dikkat: vazelin, hindistan cevizi yağı ve zeytinyağı gibi ev ürünleri kısa vadede işe yarasa da uzun vadede deriyi karartabilir veya leke bırakabilir. Uygun deri bakım ürünleri tercih edin.</p>

  <h3>4. Nemlendirme: Yılda 1–2 Kez Derin Beslenme</h3>
  <p>Özellikle kış aylarında kalorifer ısısı ve düşük nem ortamı deriyi hızla kurutur. Bu dönemlerde biraz daha sık bakım kremi uygulamak gerekebilir.</p>

  <h3>5. Su ve Nemden Koruma</h3>
  <p>Deri suya maruz kaldığında açık lekeler bırakabilir. Hafif yağmurda ıslanmak genellikle sorun değildir — kuruduktan sonra iz kalmaz. Ancak tamamen ıslatmaktan kaçının. Eğer cüzdan ıslanırsa:</p>
  <ul>
    <li>Kâğıt havluyla (bastırarak, sürmeyerek) fazla suyu alın</li>
    <li>Doğal oda sıcaklığında kurumaya bırakın</li>
    <li>Kuruduktan sonra bakım kremi uygulayın</li>
    <li>Isı kaynağına yaklaştırmayın — deri çatlar</li>
  </ul>

  <h3>6. Güneş Işığından Koruyun</h3>
  <p>Uzun süre doğrudan güneş ışığına maruz kalan deri solar ve rengi bozulur. Araç torpido gözü veya arka camın altı gibi güneş alan yerler özellikle risklidir. Kullanmadığınızda çantanıza veya çekmeceye koyun.</p>

  <h3>7. Kimyasallardan Uzak Tutun</h3>
  <p>Alkol bazlı el dezenfektanları, parfüm, aseton ve benzin gibi kimyasallar deriyi onarılamaz biçimde bozar. El dezenfektanı kullandıktan sonra cüzdanınıza dokunmadan önce ellerinizin kurumasını bekleyin.</p>

  <h3>8. Doluluk Dengesini Koruyun</h3>
  <p>Aşırı dolmuş bir cüzdan deri dikişlere normalin üzerinde baskı yapar ve şeklini bozar. Gerçekten günlük kullanmadığınız kartları ve dekontları cüzdandan çıkarın; ince bir profil hem deriyi hem de dikişleri korur.</p>

  <h3>9. Doğru Depolama</h3>
  <p>Cüzdanı uzun süre kullanmayacaksanız:</p>
  <ul>
    <li>Temizleyip bakım kremi uygulayın</li>
    <li>Gazete kâğıdı ile doldurun (şeklini korusun)</li>
    <li>Bez veya toz torbası içinde serin, kuru yerde saklayın</li>
    <li>Plastik poşete koymayın — deri nefes almalıdır</li>
  </ul>

  <h3>10. Patinanın Güzelliğini Kucaklayın</h3>
  <p><strong>Patina</strong>, full grain hakiki derinin zamanla kullanım izlerini ve renk derinliğini kazanma sürecidir. Bu bir kusur değil, aksine hakiki derinin en değerli özelliğidir. Her kullanıcının cüzdanı zaman içinde kendine özgü bir renk tonu ve karakter geliştirir. Patinanın oluşmasını engelleyen değil, onu destekleyen ürünler kullanın.</p>

  <h2>Hangi Deri Bakım Ürünleri Önerilir?</h2>
  <p>Türkiye'de kolayca bulabileceğiniz deri bakım ürünleri arasında Saphir, Collonil, Tarrago ve Fiebing's markaları güvenilir tercihlerdir. Eczanelerden bulabileceğiniz kokusuz lanolin bazlı ürünler de işe yarar.</p>

  <h2>MinaToi Ürünleri için Bakım Notu</h2>
  <p>Tüm MinaToi deri ürünleri ürün teslimatında bakım ve kullanım bilgilendirme kılavuzuyla birlikte gelmektedir. Herhangi bir bakım sorunuzda WhatsApp üzerinden destek alabilirsiniz.</p>

  <p><a href="/urunler">Uzun ömürlü hakiki deri ürünlerimizi keşfedin →</a></p>
</article>
`,
  },
];

// ─── Yardımcı fonksiyonlar ─────────────────────────────────────────────────

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getLatestPosts(count?: number): BlogPost[] {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return count ? sorted.slice(0, count) : sorted;
}

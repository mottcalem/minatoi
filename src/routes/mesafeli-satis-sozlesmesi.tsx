import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/mesafeli-satis-sozlesmesi")({
  head: () => ({
    meta: [
      { title: "Mesafeli Satış Sözleşmesi — TheBullsCraft" },
      {
        name: "description",
        content:
          "TheBullsCraft mesafeli satış sözleşmesi: sipariş, ödeme, teslimat, cayma hakkı ve iade koşulları.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://thebullscraft.com/mesafeli-satis-sozlesmesi" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      updated="06.07.2026"
      intro={
        <p>
          İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
          Sözleşmeler Yönetmeliği çerçevesinde, aşağıda bilgileri yer alan SATICI ile ALICI arasında, ALICI'nın
          elektronik ortamda sipariş vermesiyle birlikte kurulur.
        </p>
      }
      sections={[
        {
          heading: "Madde 1 — Taraflar",
          body: (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-stone-800">SATICI</p>
                <ul className="mt-1 space-y-1 text-stone-600">
                  <li><strong>Unvan:</strong> {SITE.owner} ({SITE.name})</li>
                  <li><strong>İşletme Türü:</strong> {SITE.companyType}</li>
                  <li><strong>Merkez Adres:</strong> Cemil Meriç Mah. Ocak Sk. No: 18 D: 4 Ümraniye / İstanbul</li>
                  <li><strong>Üretim Adresi:</strong> Değirmenaltı Mah. Adnan Karaevli Sk. No: 7-9B Süleymanpaşa / Tekirdağ</li>
                  <li><strong>Vergi Dairesi / No:</strong> {SITE.taxOffice} / {SITE.taxNumber}</li>
                  <li><strong>E-posta:</strong> {SITE.email}</li>
                  <li><strong>Telefon / WhatsApp:</strong> {SITE.phone}</li>
                  <li><strong>Web Sitesi:</strong> https://thebullscraft.com</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-stone-800">ALICI</p>
                <p className="mt-1 text-stone-600">
                  Sipariş formunda belirtilen ad, soyad, teslimat adresi ve iletişim bilgilerine sahip kişi.
                  ALICI, bu Sözleşme'yi onaylamakla yukarıdaki bilgilerin doğru olduğunu beyan eder.
                </p>
              </div>
            </div>
          ),
        },
        {
          heading: "Madde 2 — Sözleşmenin Konusu",
          body: (
            <p>
              Bu Sözleşme; ALICI'nın https://thebullscraft.com adresinden veya Shopier mağazası üzerinden elektronik
              ortamda sipariş verdiği ürünlerin satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerini
              6502 sayılı Kanun ve ilgili yönetmelikler çerçevesinde düzenler.
            </p>
          ),
        },
        {
          heading: "Madde 3 — Ürün Bilgileri ve Sözleşme Bedeli",
          body: (
            <>
              <p>
                Sipariş edilen ürünlerin adı, miktarı, birim satış fiyatı (KDV dahil), ödeme yöntemi ve teslimat
                bilgileri; ALICI'nın sipariş tamamlama ekranında görüntülediği ve onayladığı sipariş özetinde yer alır.
                Bu özet, Sözleşme'nin ayrılmaz bir parçasını oluşturur.
              </p>
              <p className="mt-2">
                Sitede sunulan iki ana ürün grubu şunlardır:
              </p>
              <ul className="list-disc space-y-2 pl-5 mt-2">
                <li>
                  <strong>El yapımı hakiki deri ürünler</strong> (cüzdan, kartlık, gözlük kılıfı): Birinci sınıf dana
                  derisinden el dikişiyle üretilir. Her ürün özgündür; deri dokusu, renk tonu ve dikiş izlerinde doğal
                  farklılıklar el yapımın gereğidir, kusur teşkil etmez.
                </li>
                <li>
                  <strong>Güneş gözlükleri</strong>: EN ISO 12312-1:2013 standartlarına uygun, CE belgeli, UV korumalı
                  premium güneş gözlükleridir.
                </li>
              </ul>
              <p className="mt-2">
                Tüm fiyatlar Türk Lirası (₺) cinsinden olup KDV dahildir. Kargo ücreti, 999 ₺ ve üzeri siparişlerde
                ücretsizdir; altındaki siparişler için kargo tutarı sipariş özetinde gösterilir.
              </p>
            </>
          ),
        },
        {
          heading: "Madde 4 — Ödeme Koşulları",
          body: (
            <>
              <p>Ödeme aşağıdaki yöntemlerle yapılabilir:</p>
              <ul className="list-disc space-y-2 pl-5 mt-2">
                <li>
                  <strong>Kredi kartı / banka kartı:</strong> Shopier ödeme altyapısı üzerinden güvenli şekilde tahsil
                  edilir. Kart bilgileri {SITE.name} tarafından saklanmaz.
                </li>
                <li>
                  <strong>Kapıda ödeme:</strong> ALICI, teslimat sırasında kargo görevlisine nakit veya kart ile
                  ödeme yapar. Kapıda ödeme talebinin kargo firmasınca reddedilmesi veya ALICI'nın ödemeyi
                  reddetmesi durumunda ürün iade edilir ve sipariş iptal edilir.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Madde 5 — Teslimat",
          body: (
            <>
              <p>
                Siparişler, saat <strong>15:00'e</strong> kadar alınanlar aynı iş günü, sonrasında alınanlar ise
                takip eden iş günü kargoya verilir. Tahmini teslim süresi <strong>1–3 iş günüdür</strong>; kargo
                firmasının yoğunluğu, hava koşulları ve adres doğruluğu nedeniyle bu süre uzayabilir.
              </p>
              <p className="mt-2">
                Ürünler, ALICI'nın sipariş formunda belirttiği teslimat adresine teslim edilir. Teslimat sırasında
                ALICI veya yetkilendirdiği kişinin bulunması ve imza atması gerekebilir. ALICI tarafından belirtilen
                hatalı adres nedeniyle oluşan kargo giderleri ALICI'ya aittir.
              </p>
              <p className="mt-2">
                Stok tükenmesi veya öngörülemeyen durumlarda {SITE.name} siparişi iptal ederek ödemeyi
                3 iş günü içinde iade eder ve ALICI'yı bilgilendirir.
              </p>
            </>
          ),
        },
        {
          heading: "Madde 6 — Cayma Hakkı",
          body: (
            <>
              <p>
                ALICI, teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe
                göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
              </p>
              <p className="mt-2">
                Cayma hakkının kullanılması için SATICI'ya aşağıdaki kanallardan birinden bildirim yapılması yeterlidir:
              </p>
              <ul className="list-disc space-y-1 pl-5 mt-2">
                <li>E-posta: {SITE.email}</li>
                <li>WhatsApp: {SITE.phone}</li>
              </ul>
              <p className="mt-2">
                Cayma bildiriminin ardından ürün, <strong>10 gün içinde</strong> aşağıdaki adrese iade edilmelidir:
              </p>
              <p className="mt-2 rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700">
                {SITE.owner} / {SITE.name}<br />
                Cemil Meriç Mah. Ocak Sk. No: 18 D: 4<br />
                Ümraniye / İstanbul
              </p>
              <p className="mt-2">
                SATICI, iade edilen ürünü teslim aldıktan sonra <strong>14 gün</strong> içinde ödemeyi iade eder.
                İade kargo ücreti, ürün ayıplı değilse <strong>ALICI</strong>'ya aittir.
              </p>
            </>
          ),
        },
        {
          heading: "Madde 7 — Cayma Hakkının İstisnaları",
          body: (
            <>
              <p>
                Aşağıdaki durumlarda 6502 sayılı Kanun'un 15. maddesi uyarınca cayma hakkı kullanılamaz:
              </p>
              <ul className="list-disc space-y-2 pl-5 mt-2">
                <li>
                  ALICI'nın özel isteği veya açık kişisel ihtiyaçları doğrultusunda üretilen (kişiselleştirilmiş /
                  özel sipariş) ürünler.
                </li>
                <li>
                  Niteliği itibarıyla iade edilemeyecek, çabuk bozulabilecek veya son kullanma tarihi geçebilecek
                  mallara ilişkin sözleşmeler.
                </li>
                <li>
                  Teslimden sonra ambalajı açılmış olan ve sağlık veya hijyen açısından iadesi uygun olmayan ürünler
                  (kullanılmış veya hijyen bandı kaldırılmış ürünler).
                </li>
              </ul>
              <p className="mt-2">
                <strong>Not:</strong> İsim, logo veya özel mesaj kazıma ile kişiselleştirilen tüm ürünler bu kapsama
                girmektedir ve iade kabul edilmez.
              </p>
            </>
          ),
        },
        {
          heading: "Madde 8 — Ayıplı Mal",
          body: (
            <p>
              Teslim edilen ürün, sipariş edilen üründen farklı, hasarlı veya üretim hatalıysa ALICI, teslim
              tarihinden itibaren <strong>30 gün</strong> içinde {SITE.email} adresine fotoğraflı bildirim yaparak
              ücretsiz değişim veya iade talep edebilir. Üretim hatalarına karşı el yapımı deri ürünlerde
              2 yıl garanti uygulanır. Kullanıcı kaynaklı darbe, çizilme veya yanlış kullanım garanti kapsamı dışındadır.
            </p>
          ),
        },
        {
          heading: "Madde 9 — Kişisel Verilerin Korunması",
          body: (
            <p>
              Sipariş sürecinde toplanan kişisel veriler, 6698 sayılı KVKK ve {SITE.name} Gizlilik Politikası
              çerçevesinde yalnızca sipariş, teslimat ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.
              Veriler üçüncü taraflarla paylaşılmaz; kargo firmaları yalnızca teslimat için gerekli bilgileri alır.
            </p>
          ),
        },
        {
          heading: "Madde 10 — Uyuşmazlık Çözümü",
          body: (
            <>
              <p>
                Bu Sözleşme'den doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. ALICI, şikayetlerini
                öncelikle {SITE.name}'e iletebilir. Çözüme kavuşturulamazsa:
              </p>
              <ul className="list-disc space-y-1 pl-5 mt-2">
                <li>
                  Değeri 182.000 ₺'yi (2025 yılı değeri) aşmayan uyuşmazlıklarda <strong>Tüketici Hakem Heyeti</strong>,
                </li>
                <li>Bu sınırı aşan uyuşmazlıklarda <strong>Tüketici Mahkemeleri</strong> yetkilidir.</li>
              </ul>
              <p className="mt-2">
                Yetkili yer olarak ALICI'nın yerleşim yeri veya {SITE.name}'in bulunduğu yer (İstanbul) esas alınır.
              </p>
            </>
          ),
        },
        {
          heading: "Madde 11 — Yürürlük",
          body: (
            <p>
              ALICI, sipariş onayı vermeden önce bu Sözleşme'yi okuma imkânına sahip olduğunu ve sipariş vermekle
              tüm koşulları açık rızayla kabul ettiğini beyan eder. Sözleşme, siparişin {SITE.name} tarafından
              onaylandığı anda yürürlüğe girer.
            </p>
          ),
        },
      ]}
    />
  );
}

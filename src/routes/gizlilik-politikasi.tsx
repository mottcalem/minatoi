import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/gizlilik-politikasi")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası — MinaToi" },
      {
        name: "description",
        content:
          "MinaToi gizlilik politikası: kişisel verilerin toplanması, kullanılması ve korunması.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      updated="06.09.2026"
      intro={
        <p>
          {SITE.name} ({SITE.owner}, {SITE.companyType}), ziyaretçilerinin ve müşterilerinin
          gizliliğini önemser. Bu Gizlilik Politikası, Site üzerinden toplanan kişisel verilerin
          nasıl işlendiğini açıklar. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili
          mevzuat esas alınmıştır.
        </p>
      }
      sections={[
        {
          heading: "Toplanan Kişisel Veriler",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Kimlik bilgileri:</strong> Ad soyad (sipariş ve teslimat için).
              </li>
              <li>
                <strong>İletişim bilgileri:</strong> Telefon, e-posta, teslimat adresi.
              </li>
              <li>
                <strong>İşlem bilgileri:</strong> Sipariş edilen cam tablo, kişiye özel tasarım
                talebi, ödeme yöntemi ve teslimat durumu.
              </li>
              <li>
                <strong>İçerik bilgileri:</strong> Kişiye özel tablo için iletilen fotoğraf, görsel,
                isim veya tasarım notları.
              </li>
              <li>
                <strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgileri, Site kullanım
                davranışları (çerezler aracılığıyla).
              </li>
            </ul>
          ),
        },
        {
          heading: "Verilerin İşlenme Amaçları",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Siparişin hazırlanması, kargolanması ve teslim edilmesi.</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi ve muhasebe kayıtlarının tutulması.</li>
              <li>Müşteri talep ve şikâyetlerinin değerlendirilmesi.</li>
              <li>Yasal yükümlülüklerin (vergi, defter) yerine getirilmesi.</li>
              <li>
                Varsa kişiye özel tasarımın hazırlanması ve tasarım onaylarının kayıt altına
                alınması.
              </li>
              <li>
                Açık rıza veya ilgili mevzuatın izin verdiği hallerde tanıtım ve kampanya
                iletilerinin gönderilmesi.
              </li>
            </ul>
          ),
        },
        {
          heading: "Verilerin Aktarımı",
          body: (
            <p>
              Kişisel veriler; kargo firmaları, ödeme hizmet sağlayıcıları (PayTR, Shopier,
              bankalar) ve yasal mercilerle, siparişin yerine getirilmesi ve yasal yükümlülüklerin
              yerine getirilmesi amacıyla paylaşılabilir. Veriler, yurt dışına aktarılırken uygun
              güvenceler sağlanır.
            </p>
          ),
        },
        {
          heading: "Çerezler",
          body: (
            <p>
              Site, oturumun ve temel işlevlerin yürütülmesi, kullanıcı deneyiminin iyileştirilmesi
              ve kullanım istatistikleri oluşturulması amacıyla çerezler kullanabilir. Tarayıcı
              ayarlarından çerezleri yönetebilir veya reddedebilirsiniz; bu durum Site’nin temel
              işlevlerini etkilemez.
            </p>
          ),
        },
        {
          heading: "Veri Saklama Süresi",
          body: (
            <p>
              Kişisel veriler, ilgili mevzuatta öngörülen süreler ve İşletme’nin ticari faaliyetleri
              için gerekli olan süre boyunca saklanır. Süre dolduğunda veriler güvenli şekilde imha
              edilir veya anonimleştirilir.
            </p>
          ),
        },
        {
          heading: "Kullanıcı Hakları (KVKK md. 11)",
          body: (
            <p>
              Kullanıcı; verilerine erişme, düzeltme, silme, işlenmesine itiraz etme ve zararın
              giderilmesini talep etme haklarına sahiptir. Talepler, {SITE.email} adresine yazılı
              olarak iletilebilir. Talepler en geç 30 gün içinde değerlendirilir.
            </p>
          ),
        },
        {
          heading: "Güvenlik",
          body: (
            <p>
              Kişisel veriler, yetkisiz erişime, ifşaya ve değiştirmeye karşı uygun teknik ve idari
              tedbirlerle korunur. Kart bilgileri hiçbir şekilde İşletme tarafından saklanmaz; ödeme
              işlemleri PCI-DSS uyumlu sağlayıcılar üzerinden yürütülür.
            </p>
          ),
        },
        {
          heading: "İletişim",
          body: (
            <p>
              Gizlilik ile ilgili sorularınız için: {SITE.email} · {SITE.phone} (WhatsApp).
            </p>
          ),
        },
      ]}
    />
  );
}

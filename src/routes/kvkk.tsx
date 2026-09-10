import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/kvkk")({
  head: () => ({
    meta: [
      { title: "KVKK Aydınlatma Metni — MinaToi" },
      {
        name: "description",
        content:
          "MinaToi KVKK aydınlatma metni: kişisel verilerin işlenmesi ve veri sahibi hakları.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      updated="06.09.2026"
      intro={
        <p>
          İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında,{" "}
          {SITE.name}({SITE.owner}, {SITE.companyType}; {SITE.taxOffice} / {SITE.taxNumber})
          tarafından kişisel verilerinizin işlenmesine ilişkin olarak veri sahibi olarak
          bilgilendirilmenizi sağlamak amacıyla hazırlanmıştır.
        </p>
      }
      sections={[
        {
          heading: "Veri Sorumlusu",
          body: (
            <p>
              Kişisel verileriniz, KVKK md. 10 anlamında “veri sorumlusu” sıfatıyla {SITE.name}{" "}
              tarafından işlenir. İletişim: {SITE.email} · {SITE.phone}.
            </p>
          ),
        },
        {
          heading: "İşlenen Kişisel Veriler",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Kimlik bilgileri (ad, soyad)</li>
              <li>İletişim bilgileri (telefon, e-posta, teslimat adresi)</li>
              <li>
                Sipariş ve işlem bilgileri (cam tablo, kişiye özel tasarım talebi, ödeme yöntemi,
                teslimat durumu)
              </li>
              <li>Özel tasarım içerikleri (fotoğraf, görsel, isim ve tasarım notları)</li>
              <li>Teknik veriler (IP, tarayıcı, çerez verileri)</li>
            </ul>
          ),
        },
        {
          heading: "Kişisel Verilerin İşlenme Amaçları",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Siparişin yerine getirilmesi, kargolanması ve teslim edilmesi.</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi ve muhasebe kayıtlarının tutulması.</li>
              <li>Müşteri talep ve şikâyetlerinin değerlendirilmesi.</li>
              <li>Yasal yükümlülüklerin (vergi, defter, denetim) yerine getirilmesi.</li>
              <li>Açık rıza verilmesi halinde tanıtım ve kampanya iletilerinin gönderilmesi.</li>
            </ul>
          ),
        },
        {
          heading: "Kişisel Verilerin Aktarımı",
          body: (
            <p>
              Kişisel verileriniz; kargo firmaları, ödeme hizmet sağlayıcıları (PayTR, Shopier,
              bankalar), muhasebe ve yasal danışmanlar ile yasal mercilerle, yukarıda belirtilen
              amaçlar doğrultusunda paylaşılabilir. Veriler, yurt dışına aktarılması gereken
              durumlarda KVKK md. 9’da öngörülen uygun güvenceler sağlanarak aktarılır.
            </p>
          ),
        },
        {
          heading: "Kişisel Verilerin Toplanma Yöntemi",
          body: (
            <p>
              Kişisel verileriniz; Site, PayTR ödeme ve Shopier sipariş akışları, kapıda ödeme
              formu, kişiye özel tasarım talepleri, WhatsApp ve e-posta iletişimleri, çerezler ve
              Site kullanım kayıtları aracılığıyla otomatik veya kısmen otomatik yöntemlerle
              toplanır.
            </p>
          ),
        },
        {
          heading: "Veri Saklama Süresi",
          body: (
            <p>
              Kişisel verileriniz, ilgili mevzuatta öngörülen saklama süreleri ve İşletme’nin ticari
              faaliyetleri için gerekli olan süre boyunca saklanır. Bu sürelerin dolması halinde
              veriler güvenli şekilde imha edilir veya anonimleştirilir.
            </p>
          ),
        },
        {
          heading: "Veri Sahibi Hakları (KVKK md. 11)",
          body: <p>KVKK md. 11 kapsamında aşağıdaki haklara sahipsiniz:</p>,
        },
        {
          heading: "Haklarınızın Kullanılması",
          body: (
            <>
              <ul className="list-disc space-y-2 pl-5">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
                <li>Silinmesini veya yok edilmesini isteme,</li>
                <li>Aktarıldığı üçüncü kişileri öğrenme,</li>
                <li>İşlenmesine itiraz etme ve zararın giderilmesini talep etme.</li>
              </ul>
              <p>
                Bu haklarınızı kullanmak için {SITE.email} adresine yazılı başvuruda
                bulunabilirsiniz. Başvurularınız en geç 30 gün içinde değerlendirilerek
                sonuçlandırılır.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

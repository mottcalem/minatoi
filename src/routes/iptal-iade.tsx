import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/iptal-iade")({
  head: () => ({
    meta: [
      { title: "İptal, İade ve Değişim Koşulları — MinaToi" },
      {
        name: "description",
        content: "MinaToi iptal, iade ve değişim koşulları: cayma hakkı, iade süresi ve şartları.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="İptal, İade ve Değişim Koşulları"
      updated="06.09.2026"
      intro={
        <p>
          Bu koşullar, {SITE.name} ({SITE.owner}, {SITE.companyType}) üzerinden satın alınan
          ürünlerin iptal, iade ve değişim süreçlerini düzenler. 6502 sayılı Tüketicinin Korunması
          Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri esas alınır.
        </p>
      }
      sections={[
        {
          heading: "Cayma Hakkı",
          body: (
            <>
              <p>
                Kullanıcı, ürünü teslim aldığı tarihten itibaren <strong>14 gün içinde</strong>{" "}
                herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi,
                WhatsApp ({SITE.phone}) veya e-posta ({SITE.email}) üzerinden iletilmelidir.
              </p>
              <p>
                Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, hasar görmemiş ve yeniden
                satışa uygun olması gerekir. Ürün, ambalajı ve varsa teslim edilen diğer
                parçalarıyla birlikte iade edilmelidir.
              </p>
            </>
          ),
        },
        {
          heading: "Cayma Hakkının Kullanılamayacağı Haller",
          body: (
            <p>
              Aşağıdaki hallerde cayma hakkı kullanılamaz: Kullanıcı’nın özel isteği, fotoğrafı veya
              tasarım talebiyle hazırlanan kişiye özel cam tablolar; kullanılmış, kırılmış veya
              yeniden satışa uygunluğunu kaybetmiş ürünler; ambalajı açılmış ve niteliği gereği
              iadesi uygun olmayan ürünler. Kişiye özel üretim başlamadan önceki iptal talepleri
              ayrıca değerlendirilir.
            </p>
          ),
        },
        {
          heading: "İade Süreci",
          body: (
            <ol className="list-decimal space-y-2 pl-5">
              <li>Cayma bildirimi WhatsApp veya e-posta üzerinden iletilir.</li>
              <li>İşletme, iade onayını ve kargo bilgilerini 1 iş günü içinde iletir.</li>
              <li>Ürün, orijinal ambalajı ile birlikte kargoya verilir.</li>
              <li>
                Ürün İşletme’ye ulaştıktan sonra 14 gün içinde bedel, ödemenin yapıldığı yöntemle
                iade edilir.
              </li>
            </ol>
          ),
        },
        {
          heading: "İade Kargo Ücreti",
          body: (
            <p>
              Cayma hakkı kapsamındaki iadelerde, iade kargo ücreti Kullanıcı’ya aittir. İşletme
              kaynaklı bir hata (yanlış/hasarlı ürün gönderimi) durumunda kargo ücreti İşletme
              tarafından karşılanır.
            </p>
          ),
        },
        {
          heading: "Değişim",
          body: (
            <p>
              Ürün değişimi, teslim tarihinden itibaren 14 gün içinde ve ürünün kullanılmamış,
              hasarsız ve yeniden satışa uygun olması şartıyla talep edilebilir. Kişiye özel
              üretilen ürünlerde değişim, yalnızca üretim veya taşıma kaynaklı ayıp bulunması
              halinde değerlendirilir. Değişim için stok ve üretim uygunluğu aranır.
            </p>
          ),
        },
        {
          heading: "Hasarlı/Yanlış Ürün Teslimi",
          body: (
            <p>
              Kargodan hasarlı veya yanlış ürün teslim alınması halinde, mümkünse teslimat sırasında
              tutanak tutulmalı ve durum fotoğraflarla birlikte en kısa sürede WhatsApp/e-posta
              üzerinden bildirilmelidir. İnceleme sonucunda taşıma veya üretim kaynaklı ayıp tespit
              edilirse ürün bedelsiz olarak değiştirilir veya mevzuata uygun çözüm sunulur.
            </p>
          ),
        },
        {
          heading: "Kapıda Ödeme Siparişlerinin İadesi",
          body: (
            <p>
              Kapıda ödeme ile satın alınan ürünlerin iadesinde, ürün bedeli iade edilir; ancak
              kapıda ödeme hizmet bedeli ve kargo ücreti iade kapsamında değildir.
            </p>
          ),
        },
        {
          heading: "İletişim",
          body: (
            <p>
              İptal, iade ve değişim talepleri için: {SITE.email} · {SITE.phone} (WhatsApp).
            </p>
          ),
        },
      ]}
    />
  );
}

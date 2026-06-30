import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/iptal-iade")({
  head: () => ({
    meta: [
      { title: "İptal, İade ve Değişim Koşulları — TheBullsCraft" },
      { name: "description", content: "TheBullsCraft iptal, iade ve değişim koşulları: cayma hakkı, iade süresi ve şartları." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="İptal, İade ve Değişim Koşulları"
      updated="30.06.2026"
      intro={
        <p>
          Bu koşullar, {SITE.name} ({SITE.owner}, {SITE.companyType}) üzerinden satın alınan ürünlerin iptal, iade ve
          değişim süreçlerini düzenler. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği hükümleri esas alınır.
        </p>
      }
      sections={[
        {
          heading: "Cayma Hakkı",
          body: (
            <>
              <p>
                Kullanıcı, ürünü teslim aldığı tarihten itibaren <strong>14 gün içinde</strong> herhangi bir gerekçe
                göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi, WhatsApp ({SITE.phone}) veya e-posta
                ({SITE.email}) üzerinden iletilmelidir.
              </p>
              <p>
                Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, ambalajının açılmamış ve orijinal
                niteliğini koruyor olması gerekir. Ürün, fatura ve tüm aksesuarlarıyla birlikte iade edilmelidir.
              </p>
            </>
          ),
        },
        {
          heading: "Cayma Hakkının Kullanılamayacağı Haller",
          body: (
            <p>
              Aşağıdaki hallerde cayma hakkı kullanılamaz: Kullanıcı’nın özel istek ve tercihi doğrultusunda kişiselleştirilmiş
              veya özel üretim ürünler; ambalajı açılmış ve kullanılmış ürünler; hijyenik nedenlerle iadeye uygun olmayan
              ürünler. El yapımı deri ürünlerde, kişiselleştirilmiş siparişler (üzerine isim/figür işlenmesi vb.) cayma
              hakkı kapsamı dışındadır.
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
              <li>Ürün İşletme’ye ulaştıktan sonra 14 gün içinde bedel, ödemenin yapıldığı yöntemle iade edilir.</li>
            </ol>
          ),
        },
        {
          heading: "İade Kargo Ücreti",
          body: (
            <p>
              Cayma hakkı kapsamındaki iadelerde, iade kargo ücreti Kullanıcı’ya aittir. İşletme kaynaklı bir hata
              (yanlış/hasarlı ürün gönderimi) durumunda kargo ücreti İşletme tarafından karşılanır.
            </p>
          ),
        },
        {
          heading: "Değişim",
          body: (
            <p>
              Ürün değişimi, teslim tarihinden itibaren 14 gün içinde, ürünün kullanılmamış ve orijinal ambalajında
              olması şartıyla talep edilebilir. Değişim için stok durumu geçerlidir; stokta olmaması halinde iade
              sürecine geçilir. Değişim kargo giderleri Kullanıcı’ya aittir.
            </p>
          ),
        },
        {
          heading: "Hasarlı/Yanlış Ürün Teslimi",
          body: (
            <p>
              Kargodan hasarlı veya yanlış ürün teslim alınması halinde, kargo görevlisi önünde tutanak tutulmalı ve
              durum 3 iş günü içinde WhatsApp/e-posta üzerinden İşletme’ye bildirilmelidir. Bildirim sonrası ürün
              bedelsiz olarak değiştirilir.
            </p>
          ),
        },
        {
          heading: "Kapıda Ödeme Siparişlerinin İadesi",
          body: (
            <p>
              Kapıda ödeme ile satın alınan ürünlerin iadesinde, ürün bedeli iade edilir; ancak kapıda ödeme
              hizmet bedeli ve kargo ücreti iade kapsamında değildir.
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

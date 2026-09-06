import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/kullanici-sozlesmesi")({
  head: () => ({
    meta: [
      { title: "Kullanıcı Sözleşmesi — MinaToi" },
      {
        name: "description",
        content: "MinaToi kullanıcı sözleşmesi: üyelik, sipariş, ödeme ve teslimat koşulları.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="Kullanıcı Sözleşmesi"
      updated="06.09.2026"
      intro={
        <p>
          İşbu Kullanıcı Sözleşmesi (“Sözleşme”), {SITE.name} ({SITE.owner}, {SITE.companyType};{" "}
          {SITE.taxOffice} / {SITE.taxNumber}) tarafından sunulan web sitesi ve Shopier mağazası
          üzerinden gerçekleştirilen alışveriş işlemlerine uygulanır. Site üzerinden sipariş veren
          kullanıcı (“Kullanıcı”) aşağıdaki koşulları kabul etmiş sayılır.
        </p>
      }
      sections={[
        {
          heading: "Tanımlar",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>İşletme:</strong> {SITE.name} ({SITE.owner}, {SITE.companyType}).
              </li>
              <li>
                <strong>Site:</strong> minatoi.com alan adı altında sunulan web platformu.
              </li>
              <li>
                <strong>Ürün:</strong> 4 mm temperli cam üzerine UV baskıyla hazırlanan dekoratif
                cam tablolar ve kişiye özel tasarımlar.
              </li>
              <li>
                <strong>Sipariş:</strong> Kullanıcının seçtiği ürünlerin elektronik ortamda satın
                alınması talebi.
              </li>
            </ul>
          ),
        },
        {
          heading: "Kapsam ve Taraflar",
          body: (
            <p>
              Sözleşme, İşletme ile Site üzerinden ürün satın alan Kullanıcı arasında akdedilir.
              Kullanıcı, Site’ye erişerek ve sipariş vererek Sözleşme’nin tamamını kabul eder. 18
              yaşından küçüklerin sipariş vermesi yasaktır.
            </p>
          ),
        },
        {
          heading: "Ürünler ve İçerik",
          body: (
            <>
              <p>Sitede dekoratif cam tablo ve kişiye özel tasarım hizmetleri sunulmaktadır:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Dekoratif cam tablolar:</strong> 4 mm temperli cam üzerine UV baskı
                  teknolojisiyle hazırlanır. Baskı, camın parlak yüzeyi ve üretim koşulları
                  nedeniyle ekranda görülen renkten küçük farklılıklar gösterebilir.
                </li>
                <li>
                  <strong>Kişiye özel tasarımlar:</strong> Kullanıcının ilettiği fotoğraf, görsel
                  veya tasarım talebine göre hazırlanabilir. Üretim öncesi onaylanan tasarım,
                  siparişin ayrılmaz parçasıdır.
                </li>
              </ul>
              <p>
                Ürün görselleri tanıtım amaçlıdır; gerçek ürün ton ve dokusunda minik farklılıklar
                olabilir. Ürün özellikleri, fiyatları ve stok durumu her zaman güncellenir; sipariş
                anında geçerli olan bilgiler esas alınır.
              </p>
            </>
          ),
        },
        {
          heading: "Sipariş ve Ödeme",
          body: (
            <>
              <p>
                Kullanıcı, ürün sayfasındaki Shopier bağlantısı üzerinden sipariş ve ödeme adımını
                tamamladığında sipariş talebi oluşturur. Ödeme Shopier üzerinden kredi kartı/banka
                kartı ile veya sunulan ürünlerde kapıda ödeme yöntemiyle yapılabilir.
              </p>
              <p>
                Kapıda ödeme siparişleri, Kullanıcı’nın WhatsApp üzerinden ilettiği teslimat
                bilgileri doğrultusunda hazırlanır ve İşletme tarafından teyit edildikten sonra
                kargoya verilir. Kapıda ödeme talebinin reddedilmesi halinde ürün Kullanıcı’ya
                teslim edilmez ve sipariş iptal edilir.
              </p>
            </>
          ),
        },
        {
          heading: "Teslimat",
          body: (
            <p>
              Siparişler, saat 15:00’e kadar alınanlar aynı gün, sonrasında alınanlar ise takip eden
              iş günü kargoya verilir. Tahmini teslim süresi 1–3 iş günüdür; kargo firmasının
              yoğunluğu, hava muhalefeti ve adres doğruluğu gibi nedenlerle bu süre değişebilir.
              Teslimat sırasında Kullanıcı veya yetkili kişinin imzası talep edilir.
            </p>
          ),
        },
        {
          heading: "Garanti",
          body: (
            <p>
              Ürünler, ayıplı mal mevzuatından doğan yasal haklar saklı kalmak üzere teslim edilir.
              Garanti ve uygunluk, ürünün üretim hatalarını kapsar; darbe, düşme, çizilme, yanlış
              montaj, yanlış kullanım ve doğal yıpranma kapsam dışındadır.
            </p>
          ),
        },
        {
          heading: "Sorumluluğun Sınırlandırılması",
          body: (
            <p>
              İşletme, Site’yi kesintisiz ve hatasız sunmak için makul çaba gösterir; ancak teknik
              arızalar, bakım çalışmaları ve üçüncü kişiler (kargo, ödeme sağlayıcı) kaynaklı
              gecikmelerden sorumlu tutulamaz. Hukuki sorumluluk, zararın doğrudan ve kasıtlı bir
              eylemden kaynaklandığı hallerle sınırlıdır.
            </p>
          ),
        },
        {
          heading: "Sözleşmenin Değiştirilmesi",
          body: (
            <p>
              İşletme, Sözleşme’yi gerekli gördüğünde güncelleme hakkını saklı tutar. Güncellemeler,
              Site’de yayımlandığı tarihten itibaren geçerli olur. Kullanıcı, güncelleme sonrası
              sipariş vermeye devam ederek yeni koşulları kabul etmiş sayılır.
            </p>
          ),
        },
        {
          heading: "Uyuşmazlıkların Çözümü ve Yürürlük",
          body: (
            <p>
              Bu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda öncelikle
              tüketici mahkemesi ve tüketici hakem heyeti yetkilidir. Sözleşme, Site’de yayımlandığı
              tarihte yürürlüğe girer.
            </p>
          ),
        },
      ]}
    />
  );
}

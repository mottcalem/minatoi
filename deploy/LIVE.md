12 Kasım 2026: Meta ViewContent ürün detayında her açılışta bir kez, AddToCart ortak sepet ekleme akışında eklendi. Olaylar ürün slug kimliğini mevcut Purchase ile ortak kullanır; ölçü fiyatı, eklenen adet, TRY değeri gönderilir. Kullanıcı/yükleme bilgisi içermez; admin hariç, geciken Pixel başlangıcı sınırlı tekrar ile ele alınır. Sepet sınırında eklenmeyen adet için olay gönderilmez. Yedi Meta/satın alma testi, TypeScript ve üretim derlemesi başarılı. 104.233.4.39 üzerinde yayınlandı, servis active; canlı JavaScript ve ürün sayfası doğrulandı. Chrome Meta Reklam Verileri Danışmanı aracında ViewContent alındı (710 TRY), 60×90 cm testinde AddToCart gönderildi (1 adet, 1890 TRY). Test ürünü sepetten kaldırıldı, mevcut sepet ürünü korundu. Yedek: `/var/www/minatoi/shared/pre-product-pixel-20261112/application.tar.gz`. Eski WooCommerce kataloğunun ürün kimlikleriyle eşleşme bu yayın kapsamında doğrulanmadı.

12 Kasım 2026: Sanatçı albümlerine Eda Cartoon (canlı kategori adresi `eda-cartoun`) dahil edildi. Kargo metinleri siparişten itibaren 2 gün olarak güncellendi; kapıda ödeme metinleri, eski duyuruların gösterimi ve kullanılmayan form kaldırıldı. Anasayfa/varsayılan sosyal paylaşım görseli beyaz zeminli MinaToi logosuyla değiştirildi; hero gezinme okları kaldırıldı. 12 katalog testi ve üretim derlemesi geçti. 104.233.4.39 üzerinde yayınlandı; anasayfa, iletişim ve sözleşmeler, sekiz eserli Eda galerisi, albüm ve admin HTTPS 200; logo SHA-256 eşleşmesi doğrulandı. Servis active. Uygulama yedeği: `/var/www/minatoi/shared/pre-site-update-20261112/application.tar.gz`. Veritabanı, ortam dosyası ve kullanıcı yüklemeleri korunmuştur.

8 Kasım 2026: `fb13bb2` sürümü main dalına push edilip 104.233.4.39 üzerinde yayınlandı. Kostümlü portre listeleme ve ürün sayfalarından örnek çalışmalar kaldırıldı; ortak askı görseli kullanıcının sağladığı fotoğrafla değiştirildi. Admin > Ortak Ürün Görseli üzerinden yükleme/değiştirme/kaldırma eklendi; ayarlar ilk kullanımda oluşturulan `product_gallery_settings` tablosunda tutulur. İletişim sayfasındaki boş firma ve adres başlıkları kaldırıldı. TypeScript, ilgili lint, diff kontrolü ve üretim derlemesi geçti. Canlı ana sayfa, iletişim, admin, ürün API ve iki ürün sayfası HTTPS 200; yeni görselin SHA-256 özeti ve kostümlü ürün galerisinin içeriği doğrulandı. Yedek: `/var/www/minatoi/shared/pre-gallery-contact-20261108-1504/application.tar.gz`. Mevcut veritabanı, ortam dosyası ve yüklemeler korundu.

8 Kasım 2026: 240 ürünün 25×35 cm satış fiyatı 710 TL, 60×90 cm satış fiyatı 1.890 TL olarak canlı veritabanında transaction ile güncellendi. Diğer ölçüler ve eski fiyatlar korundu. CMS Ürün Yönetimi alanına toplu ölçü fiyatı güncelleme formu eklendi; tüm kategorilerde eşleşen mevcut ölçüleri günceller, ilk ölçü ile başlangıç fiyatını eşitler. Altı fiyat testi, TypeScript, ilgili lint ve üretim derlemesi geçti. Canlı ürün API'sinde 240 ürünün fiyatları doğrulandı; ana sayfa ve admin HTTPS 200, servis active. Yayın yedeği: `/var/www/minatoi/shared/pre-bulk-prices-20261108-142417/application.tar.gz`. İşlem öncesi fiyat yedeği yerelde `/tmp/minatoi-price-update/before.json`.

# MinaToi canlı yayın

1 Kasım 2026: Yönetici sipariş bildirimlerine `ORDER_ADMIN_CC` desteği eklendi; mevcut `oztassema@hotmail.com` korunarak `dgn.ugur@gmail.com` ek alıcı yapıldı. Müşteri/sepet e-postaları ve test alıcısı izolasyonu test edildi. UTM/kampanya, Google/Meta tıklama işaretleri ve dış referrer alan adı 30 günlük son kaynak olarak tutulur; `orders.attribution` JSONB alanıyla siparişe kaydedilir ve Admin > Siparişler içinde gösterilir. PayTR/iç gezinme mevcut kaynağı silmez, kaynak değişikliği ödeme tekrar korumasını etkilemez. Tıklama kimliklerinin kendisi saklanmaz. Eski siparişlerde kaynak boş kalır. 60 test, TypeScript, ilgili lint ve build geçti. Canlı ana sayfa/sepet/admin HTTPS 200; yeni panel/yakalama JS dosyalarının HTTPS içerik özetleri, admin noindex, alıcı ayarları, SMTP doğrulaması ve veritabanı geçişi kontrol edildi. Mevcut 4 sipariş korundu, test verisi ve bekleyen e-posta yok. Gerçek e-posta veya ödeme oluşturulmadı. Kod, ortam ve veritabanı yedeği: `/var/www/minatoi/shared/pre-order-source-email-20261101-205335/`.

1 Kasım 2026: Google Ads Sayfa görüntüleme (7719541660) için `AW-18304768905/mBBOCJy3--AcEIm3sphE` etiketi genel sayfa açılışları ve pathname değişikliklerinde RootComponent tarafından gönderilir. Admin hariçtir; aynı pathname için tekrar render/StrictMode tekrarı engellenir. İşlem ikincil tutuldu; parasal değer 0 (arayüz: Değer kullanma). Satın alma GA4 üzerinden birincil kalır. TypeScript, ilgili lint ve build başarılı; canlı ana sayfa/ürünler 200, etiket yeni index paketinde doğrulandı. Google Ads etiket teslim/doğrulama durumu henüz onaylanmadı; panel uyarısının güncellenmesi gecikebilir. Yedek: `/var/www/minatoi/shared/pre-pageview-20261101/application.tar.gz`.

1 Kasım 2026: Satın alma ölçümü gerçek ödenen tutarla GA4 `purchase` ve Meta Pixel `Purchase` gönderecek şekilde yayınlandı. Yalnızca sunucu `paid` onayından sonra çalışır; `pending`, `failed` ve sağlayıcı test modu gönderilmez. Kuruş TL’ye çevrilir; indirimli ürün fiyatları, miktarları ve sipariş kimliği aktarılır. Aynı tarayıcıda localStorage ve bellek işaretleri tekrar gönderimi engeller. Eski sabit 1 TRY Google Ads snippet’i kaldırıldı; Ads kaynağı GA4 purchase, birincil, her dönüşüm, dinamik değer, eksik değer 0 TRY. GA4 MinatoiArt (560787901), Ads 792-289-4870 ile bağlandı; otomatik etiketleme açık, raporlama TRY. Yeni Ads kullanıcı erişimi ve kişiselleştirilmiş reklam paylaşımı açılmadı. 37 ödeme testi, 3 satın alma ölçüm testi, TypeScript, ilgili lint ve build geçti. Canlı ana sayfa, ödeme sonucu ve admin 200; yeni derleme doğrulandı. Gerçek ödeme veya platforma satın alma teslim testi yapılmadı. Kullanıcının başarılı ödeme sonrası sonuç sayfasına dönmesi ve tarayıcı etiketlerinin engellenmemesi gerekir; sunucudan CAPI Purchase bu değişiklikte eklenmedi. Yedek: `/var/www/minatoi/shared/pre-purchase-tracking-20261101/application.tar.gz`.

1 Kasım 2026: `/admin` için robots meta ve X-Robots-Tag `noindex, nofollow, noarchive` eklendi. Admin SSR yanıtından Google Analytics/Ads ve Meta Pixel (noscript dahil) çıkarıldı. GA4 opt-out özelliği mevcut pathname'i okuyarak SPA ve geri/ileri geçişlerinde admin veri gönderimini kapatır. robots.txt admin tarama engeli kaldırıldı; böylece botlar noindex'i okuyabilir. Sitemap zaten admin içermiyor. Build, TypeScript, ilgili lint, head politikası ve dinamik opt-out kontrolleri geçti. Canlı admin ve query varyantı HTTP 200/noindex/izleme etiketsiz; ana sayfa HTTP 200/index ve mevcut etiketlerle doğrulandı. Yedek: `/var/www/minatoi/shared/pre-admin-exclusion-20261101-192235/application.tar.gz`.

1 Kasım 2026: Google Ads dönüşümü `AW-18304768905/mBBOCJy3--AcEIm3sphE`, ödeme sonucu sayfasında yalnızca sunucu `paid` durumu döndürünce head içinde Google etiketinin hemen sonrasına eklenir. Değer 1 TRY; transaction_id sipariş numarasıdır. Aynı belge içinde tekrar ekleme engellenir. TypeScript, lint, build ve snippet konum/payload/tekrar kontrolü geçti. Canlı sonuç sayfası HTTPS 200; dağıtılan JS içinde dönüşüm kodu ve doğrulanmamış sayfada tetiklenmediği kontrol edildi. Gerçek ödeme veya Google Ads teslim testi yapılmadı. Yedek: `/var/www/minatoi/shared/pre-conversion-20261101-184518/application.tar.gz`.

1 Kasım 2026: Google Ads `AW-18304768905` mevcut Google tag yapılandırmasına head içinde eklendi. Build ve ilgili lint başarılı. 104.233.4.39 üzerinde yayınlandı; canlı HTTPS 200 ve head içinde Ads, Analytics, Meta Pixel kodları doğrulandı. Yedek: `/var/www/minatoi/shared/pre-google-tag-20261101-184231/application.tar.gz`.

1 Kasım 2026: Meta Pixel `1720727192407837` ortak sayfa başlığına eklendi; PageView ve body içinde noscript görseli yayınlandı. TypeScript, ilgili lint ve üretim derlemesi başarılı. 104.233.4.39 üzerinde minatoi servisi yenilendi; ana sayfa, ürünler ve sepet HTTPS 200 ve Pixel kodları ile doğrulandı. Yedek: `/var/www/minatoi/shared/pre-meta-pixel-20261101-181443/application.tar.gz`.

30 Ekim 2026: Örnek Çalışmalar galerisindeki görsel altı isimler kaldırıldı. Üretim derlemesi ve ilgili lint kontrolü geçti; 104.233.4.39 sunucusuna yayınlandı. Canlı HTTPS sayfasında görsellerin bulunduğu ve figcaption etiketlerinin kaldırıldığı doğrulandı. Yedek: `/var/www/minatoi/shared/pre-gallery-labels-20261030-114737/application.tar.gz`.

30 Ekim 2026: Tasarım seçim düğmeleri ortaklaştırıldı; ölçüye bağlı belirgin fiyat alanı eklendi. Kişiye özel dört ürünün varsayılan ölçü/fiyatları ürün detayıyla eşitlendi ve panelden düzenlenebilir hâle getirildi. Mevcut sanatçı eserleri panel yönetimine bağlandı; albümlerde ölçü fiyatları ve “Sınırlı sayıda” metni gösteriliyor. TypeScript, ilgili lint kontrolleri, 48 test ve üretim derlemesi geçti. Canlı ana sayfa, özel tasarım sayfaları (kanonik yönlendirme sonrası), iki sanatçı albümü ve admin HTTPS 200 ile doğrulandı; kişiye özel sayfada 60*90 cm, 610 TL ve yeni başlıklar kontrol edildi. Veritabanı, yüklemeler ve ortam ayarları korunmuştur. Yedek: `/var/www/minatoi/shared/pre-ui-pricing-20261030-100403/application.tar.gz`.

- Adres: https://minatoi.com (www alan adı da HTTPS ile açık)
- Sunucu: 104.233.4.39, SSH portu 25416
- Uygulama: /var/www/minatoi/current
- Servis: minatoi.service, 127.0.0.1:3006
- Ortam dosyası: /var/www/minatoi/shared/.env
- Nginx: /etc/nginx/sites-available/minatoi-live
- Sertifika: Let's Encrypt; otomatik yenileme etkin
- 15 Ekim 2026 yayın öncesi yedek: /var/www/minatoi/shared/pre-live-20261015

Üretim build'i `npm run build` ile oluşturulur. `.output/server` ve
`.output/public` aktarılır; büyük görseller `public/products` ve `public/images`
üzerinden Nginx tarafından sunulur. Yönetim panelinin `public/images/uploads`
dosyaları ve sunucudaki ortam dosyası korunmalıdır. Kaynakların güncellenmesi
veritabanı içe aktarım betiklerini çalıştırmayı gerektirmez.

Bu yayında TypeScript ve build başarılı; ana sayfa, özel tasarım sayfaları,
eski kategori yönlendirmeleri, sitemap ve yerel statik dosyalar HTTP ile doğrulandı.
Gerçek ödeme işlemi yapılmadı.

26 Ekim 2026: Üretim derlemesi yenilendi. `llm.txt` ve `llms.txt` içerikleri eşitlendi; Instagram, iletişim ve ödeme bilgileri güncellendi, Shopier tanıtımı kaldırıldı. Nginx canlı sunucu bloğuna `charset utf-8` eklendi; statik metinlerde Türkçe karakterlerin doğru yorumlanması sağlandı. Yayın öncesi yedekler `/var/www/minatoi/shared/pre-text-update-*` altında tutulur.

26 Ekim 2026: WhatsApp tasarım taleplerine görsel paylaşımı eklendi (kişiye özel,
patili dostlar ve ürün detayı). Dosya paylaşımı desteklenmeyen cihazlarda görsel
`public/images/uploads/designs` altına yüklenir ve bağlantısı mesaja eklenir.
Yayın öncesi yedek: `/var/www/minatoi/shared/pre-whatsapp-20261026-113857`.
Canlı özel tasarım sayfaları HTTP 200; sunucu fonksiyonu ile PNG yükleme ve
HTTPS üzerinden görsel erişimi doğrulandı. Test görseli silindi.

26 Ekim 2026: Tasarım talepleri WhatsApp yerine e-posta formuna taşındı.
Kişiye özel, patili dostlar ve özelleştirilebilir ürünlerde iletişim bilgileri,
tasarım tercihleri ve görsel dosya eki info@minatoi.com adresine gönderilir.
Notifiva STARTTLS ayrı yapılandırıldı; mevcut sipariş SMTP ayarları korunur.
Parola sadece sunucudaki shared/.env dosyasında NOTIFIVA_SMTP_PASSWORD olarak tutulur.
Yedek: `/var/www/minatoi/shared/pre-design-email-20261026-114805`.
Dört API testi, TypeScript ve build başarılı. Canlı sayfalar HTTP 200.
TEST olarak işaretlenen görsel ekli talep SMTP tarafından kabul edildi:
`MT-a5981b7f-fc68-4367-a7af-48fcf083c6e3`. Gelen kutusu teslimi ayrıca okunmadı.
9 Kasım 2026: `9a8bcaa` main dalına push edilip yayınlandı. Yazdıkça ürün, görsel ve fiyat gösteren arama eklendi; Kostümlü Patili Portre şablonu ve örnek çalışma görsel altı isimleri kaldırıldı. Adres ve vergi numarası iletişim, footer ve satış sözleşmesinde güncellendi. Askı aparatı ürün galerilerine aktarıldı; ayrı ortak görsel yönetimi kaldırıldı. Mevcut canlı ürün galerilerinde görsel bulunduğu API üzerinden doğrulandı. TypeScript, ilgili lint, 68 test ve üretim derlemesi geçti. Ana sayfa, iletişim, admin, ürün API, örnek ürün ve patili illüstrasyon sayfası HTTPS 200; kaldırılan ürün 404. Dağıtılan JS içinde anlık arama, iletişim sayfasında adres/vergi no ve ürün sayfasında askı görseli doğrulandı. Servis active. Yedek: `/var/www/minatoi/shared/pre-ui-gallery-20261109-9a8bcaa/` (uygulama ve veritabanı). Ortam dosyası ve yüklemeler korundu.

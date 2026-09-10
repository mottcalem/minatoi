# PayTR entegrasyonu

Üyeliksiz sepet, teslimat bilgileri, ücretsiz kargo, TL ve tek çekim. En az iki adet ürün varsa en ucuz ürünün yalnızca bir adedine %25 indirim uygulanır. İndirim kuruşa yuvarlanır; dört ürün alındığında da yalnızca bir adet indirimlidir. Fiyatlar ve ölçüler sunucudaki katalogdan doğrulanır; PayTR sepetindeki indirimli adet ayrıca gösterilir.

## Mevcut canlı sistem korunacak

Mevcut site WooCommerce kullanıyor. Kullanıcının doğruladığı çalışan PayTR Bildirim URL'si:

```text
https://www.minatoi.com/index.php?wc-api=wc_gateway_paytrcheckout
```

Bu ayarı geliştirme amacıyla değiştirmeyin. Yerel tünel kapatıldı. Gerçek sağlayıcı testi, entegrasyon ve yayın hazırlıkları tamamlandıktan sonra kullanıcıyla yapılacak. `PAYTR_TEST_MODE=1` tek başına bildirimleri ayırmaz; mevcut mağazanın bildirimleri yine canlı WooCommerce'e gider.

Yeni uygulama hem `/api/paytr/callback` hem `/index.php?wc-api=wc_gateway_paytrcheckout` yolunu kabul eder. İkinci yol mevcut URL'nin yeni uygulama yayına geçtiğinde de kullanılabilmesini sağlar; şu anda canlı sunucuya hiçbir yönlendirme kurulmadı. Ubuntu'daki Nginx/PHP yönlendirmesi ve eski WooCommerce siparişlerinin bekleyen bildirimleri, geçişten önce ayrıca ele alınmalıdır. Eski WooCommerce siparişleri yeni PostgreSQL sipariş tablosunda bulunmaz; yeni uygulama onları onaylamaz.

## Ortam ve kurulum

Node.js 22.18+ ve PostgreSQL gerekir. `.env` dosyası Git dışındadır. Anahtarları VITE_ önekiyle tanımlamayın.

- `PAYTR_ENABLED=0`: geliştirme sırasında yeni PayTR ödeme oturumu açılmaz. Sepet ve indirim hesabı çalışır. Mevcut bildirimlerin alınması bu anahtardan bağımsızdır.
- `PAYTR_ENABLED=1`: yalnızca son test/yayın adımında ödeme başlatmayı açar.
- `PAYTR_TEST_MODE=0`: PayTR'de gerçek tahsilat modudur; etkinleştirme anahtarından ayrıdır.
- `PAYTR_PUBLIC_URL=https://www.minatoi.com`: yeni uygulamanın yayın adresi. PayTR panelini değiştirmez.
- `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`: sadece sunucuda okunur.
- `PAYTR_TRUST_PROXY=1`: Ubuntu'da yalnızca güvenilir reverse proxy arkasında. Nginx `proxy_set_header X-Real-IP $remote_addr;` ile başlığı yeniden yazmalı; Node portu internete doğrudan açık olmamalı.
- `PAYTR_LOCAL_IP`: sadece geliştirmede dış IP için kullanılabilir; üretimde bu değer dikkate alınmaz.

`npm run db:orders` sipariş tablosunu ve indirim alanını mevcut verileri silmeden oluşturur. `npm run build` sonrası, Ubuntu'da proje dizininden `node --env-file=.env .output/server/index.mjs` çalıştırılabilir. Ortam değişikliklerinden sonra uygulama sürecini yeniden başlatın. `.env` veya anahtarları çıktı/public dizinine koymayın.

## Sipariş davranışı

Sipariş ve müşteri/adres bilgileri PostgreSQL'de saklanır. Sipariş durumunu okuma, tahmin edilemeyen erişim anahtarı gerektirir; müşteri bilgileri bu yanıta dahil edilmez. Başarı/başarısızlık dönüş ekranı siparişi onaylamaz. HMAC imzası ve tutarı doğrulanan bildirim, işlem içinde satır kilidi altında siparişi sonuçlandırır. Tekrarlı bildirimler tekrar işlem oluşturmaz; yanıt düz `OK` olur.

Aynı ödeme isteği tekrarlandığında mevcut ödeme oturumu kullanılır. Tarayıcı aynı sepet ve teslimat bilgileri için istek kimliğini sayfa yenilendiğinde de korur; saklanan parmak izi teslimat bilgilerini açık metin olarak içermez. Sağlayıcı zaman aşımında sipariş referansı korunur; yeni tahsilat oturumu otomatik açılmaz. Süresi dolan veya sonucu bilinmeyen ödeme kayıtları sevk edilmemelidir; gerçek sağlayıcı durumu kontrol edilmelidir.

Yönetim panelinin Siparişler sekmesi mevcut admin oturumunu kullanır; ikinci kez şifre istemez. Havale siparişleri panelde “Havale bekleniyor” görünür. Para banka hesabına ulaştıktan sonra “Ödeme geldi” ile onaylanır; ulaşmadan onaylanmamalıdır.

Havale/EFT seçeneği ancak `BANK_TRANSFER_ENABLED=1`, banka adı, hesap sahibi ve geçerli TR IBAN birlikte tanımlandığında açılır. Müşteriye tutar, IBAN ve açıklamaya yazacağı sipariş numarası gösterilir.

## Doğrulama

`npm run test:payments`: sepet hesabı ve tam HTTP handler akışı; sahte katalog, bellek içi sipariş deposu ve sahte PayTR yanıtlarıyla çalışır. Gerçek anahtarlar, canlı veritabanı veya PayTR ağı kullanılmaz. İmza, tutar, kampanya, tek çekim, tekrar deneme, eşzamanlı bildirim, eski URL uyumluluğu, başarısız ödeme ve bağlantı kesilmesi senaryolarını kapsar.

`node --env-file=.env scripts/test-payments-http.mjs`: açık localhost:8080 sunucusunda, mevcut örnek ürünle sepet ve hatalı bildirim reddini kontrol eder. PAYTR_ENABLED=0 olmalıdır. Bu script yalnızca localhost'a istek gönderir.

Gerçek PayTR kart ekranı ve sağlayıcı bildirimi henüz uçtan uca denenmedi. Önceden mevcut olan kategori/ürün loader ve vite.config.ts tip hataları ayrı HEAD kopyasında da doğrulandı; yeni ödeme kodunda ek tip hatası görülmedi.

## Kalan yayın kontrolleri

Mevcut katalog ölçü başına ayrı fiyat saklamıyor; tüm ölçüler ürünün ortak fiyatını kullanıyor. Ölçülere göre fiyatlar farklıysa yayın öncesinde katalogdaki varyasyon fiyatları tamamlanmalıdır. Otomatik fatura, sipariş e-postası, stok rezervasyonu, kargo API'si ve otomatik iade bu entegrasyonun kapsamında eklenmedi. Sözleşmelerde ödeme/kargo/kampanya işleyişi güncellendi; mevcut satıcı bilgileri korunmuştur.

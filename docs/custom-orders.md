# Fotoğraflı kişiye özel siparişler

Kişiye Özel doğrudan baskı/illüstrasyon, Patili Dostlara Özel illüstrasyon ve kostümlü ürün detayları aynı sepet ve PayTR ödeme akışını kullanır. Fotoğraf yüklemek sipariş veya ödeme oluşturmaz; teslimat bilgileri ve onay sepette alınır.

Fiyat ve desteklenen ölçüler standart ürün kataloğundan gelir. Sanal özel ürünler hem vitrinde hem ödeme servisinde aynı `CUSTOM_PRODUCTS` listesiyle tamamlanır. Katalogda fiyatı bulunmayan ölçüler sipariş seçeneği olarak gösterilmez.

`POST /api/custom-order-uploads`, en fazla 12 MB JPG/PNG/WebP görseli ürün, ölçü, yön ve stil bilgisiyle doğrular. Dosya içeriği imzaları kontrol edilir; origin kontrolü, akış sırasında boyut sınırı ve yükleme hız sınırı uygulanır. Görseller `data/order-uploads` altında, rastgele UUID ile ve public dizin dışında saklanır. Bu dizin kalıcı veri yedeklerine dahil edilmelidir. Tamamlanmamış sepetlerin yüklemeleri de burada kalır; otomatik silme uygulanmaz.

Görsel URL'leri tahmin edilemeyen erişim bağlantılarıdır; bu bağlantıyı bilen kişi görseli açabilir. Önbellekleme ve indeksleme kapalıdır. Müşteri sepeti, yönetim paneli ve sipariş e-postaları aynı bağlantıyı kullanır. Bağlantılar üçüncü kişilerle paylaşılmamalıdır.

Sepet ödeme API'sine yalnızca yükleme kimliği gönderir. Sunucu görseli tekrar okur, ürün ve ölçü eşleşmesini doğrular; istemcinin fiyat, görsel yolu veya tasarım metadata'sına güvenmez. Farklı yüklemeler aynı ürün ve ölçüde ayrı satırlardır. Siparişin JSON ürün kaydına doğrulanmış tasarım bilgileri ve görsel yolu yazılır. Ödeme onayı sonrası standart müşteri/admin e-posta kuyruğu çalışır.

Doğrulama: `node --test server/design/*.test.mjs server/payments/*.test.mjs server/notifications/*.test.mjs`, `npx tsc --noEmit`, `npm run build`. Sahte PayTR sağlayıcısıyla görsel → sepet → ödeme kaydı → paid → e-posta kuyruğu test edilir; gerçek tahsilat yapılmaz.

26 Ekim 2026: Yeni akış 104.233.4.39 sunucusunda minatoi.com üzerinde yayına alındı. Sunucuda 50 test geçti. Canlı HTTPS üzerinden doğrudan baskı, patili sulu boya ve kostümlü portre için sentetik PNG yükleme, orijinal baytların okunması, kişiselleştirmeli quote ve ödeme kullanılabilirliği doğrulandı. Gerçek sipariş/tahsilat oluşturulmadı; test yüklemeleri kaldırıldı. Yayın öncesi kod yedeği: `/var/www/minatoi/shared/custom-orders-20261026-132430`.

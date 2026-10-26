# MinaToi canlı yayın

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

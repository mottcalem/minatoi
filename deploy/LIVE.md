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

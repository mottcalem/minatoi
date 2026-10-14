# MinaToi — Ubuntu taşıma kaydı

14 Ekim 2026: Kaynak 45.43.154.82, hedef 104.233.4.39. Her iki sunucuda SSH portu 25416. Kaynak site ve servis korunmuştur; DNS değiştirilmemiştir.

## Yeni kurulum

- Geçici adres: http://104.233.4.39:8086
- Gelecek yayın domaini: minatoi.com / www.minatoi.com. Hedefte bu domainler henüz etkin değildir.
- Proje: /var/www/minatoi/current
- Gizli ortam ayarları: /var/www/minatoi/shared/.env (600, minatoi sahibi)
- Ayrı sistem kullanıcısı: minatoi
- Ayrı PostgreSQL veritabanı ve rolü: minatoi. Rol superuser değildir; başka veritabanı veya rol oluşturamaz. Yeni rastgele parola yalnızca .env içinde tutulur.
- Servis: minatoi.service; Node yalnızca 127.0.0.1:3006 üzerinde dinler. Otomatik başlangıç etkin.
- Servis kaynak sınırı: MemoryMax=512M, CPUQuota=100%.
- Nginx: /etc/nginx/sites-available/minatoi-preview, yalnızca 8086 portu. İlgili UFW kuralı eklendi.
- Sistem dosya koruması etkin; yalnızca MinaToi shared, data ve public/images/uploads dizinleri yazılabilir.
- PAYTR_PUBLIC_URL=http://104.233.4.39:8086, PAYTR_ENABLED=0, PAYTR_TEST_MODE=0. HTTP önizlemesinde tahsilat kapalıdır. Gerçek ödeme oturumu için uygulama HTTPS origin gerektirir.

## Taşıma ve doğrulama

Canlı kaynak proje, derlenmiş uygulama, public görseller ve data dosyaları taşındı. Kaynak node_modules, .git ve eski derleme yedekleri taşınmadı. Çalışan derleme kendi sunucu bağımlılıklarını içerir. Ürün görsellerinin mükerrer .output kopyaları yerine Nginx public/products dizinini sunar.

PostgreSQL 16 custom-format pg_dump yedeği, yalnızca yeni minatoi veritabanına pg_restore ile yüklendi. Kaynak ve hedefte sekiz tablonun satır sayıları ve sıralanmış satır içerik özetleri birebir eşleşti:

| Tablo | Satır |
|---|---:|
| products | 243 |
| product_images | 937 |
| product_features | 1458 |
| categories | 15 |
| announcements | 5 |
| minatoi_content | 4 |
| orders | 0 |
| schema_migrations | 3 |

public ve data dosyalarının SHA-256 manifest özetleri eşleşti; public/products altında 1667 dosya var. Katalogdaki 937 farklı görsel yolunun tamamı hedefte mevcut.

Ana sayfa, ürünler, sepet, admin ve örnek görsel HTTP 200 döndü. Yetkili sipariş listeleme ve sepet hesabı başarılı. Havale oluşturma HTTP 410; her iki PayTR bildirim yolu hatalı imzayı HTTP 400 ile reddetti. Gerçek ödeme/tahsilat yapılmadı.

Mevcut ajanskunye.com, com8.com.tr, festivalprefabrik.com ve goreme.qmaris.com.tr Nginx dosyalarının SHA-256 özetleri korunmuştur. Taşıma öncesi ve sonrası dört site HTTP 200 döndü.

## Gerçek domain geçişi

1. Önizleme sonrası katalog/içerik değişiklikleri tek sunucuda yapılmalıdır; iki veritabanı otomatik senkronize değildir. Kaynakta yeni veri oluşursa geçiş öncesi son aktarım gerekir; hedefte yapılmış değişikliklerin üzerine körlemesine yedek yüklenmemelidir.
2. minatoi.com ve www.minatoi.com DNS kayıtlarını hedef sunucuya yönlendir; varsa AAAA kayıtlarını da doğrula.
3. Sadece MinaToi için yeni Nginx domain yapılandırması ve geçerli HTTPS sertifikası kur. Mevcut dört sitenin ayarlarını değiştirme. PayTR bildirim POST yolu PHP/static kurallarına takılmadan Node uygulamasına ulaşmalı.
4. Ana domain www.minatoi.com seçilirse PAYTR_PUBLIC_URL=https://www.minatoi.com olarak güncelle; PAYTR_ENABLED=1 ve PAYTR_TEST_MODE=0 yap; minatoi servisini yeniden başlat.
5. PayTR panelindeki Bildirim URL’sini doğrula. Mevcut https://www.minatoi.com/index.php?wc-api=wc_gateway_paytrcheckout yolu uygulamada desteklenir. Eski WooCommerce bekleyen siparişleri ayrıca kontrol et; yeni uygulama onları tanımaz.
6. Nihai domainde küçük tutarlı gerçek kart ödemesi yap. PayTR panelinde Başarılı ve uygulamada paid durumlarını, dönüş sayfasını doğrula.
7. Önizleme portuna ihtiyaç kalmadığında yalnızca MinaToi 8086 UFW kuralını ve minatoi-preview Nginx yapılandırmasını kaldır. Eski sunucuyu geri dönüş için bir süre koru.

## İşletim

```sh
systemctl status minatoi
journalctl -u minatoi -n 100 --no-pager
nginx -t
```

İlk aktarım yedeği hedefte /var/www/minatoi/shared/minatoi-migration.dump konumunda korunmuştur. Bu bir taşıma anı yedeğidir; düzenli yedekleme planının yerine geçmez.

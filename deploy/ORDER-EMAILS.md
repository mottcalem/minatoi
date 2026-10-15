# Sipariş bildirimleri

Kartlı siparişler için doğrulanmış başarılı PayTR callback'i, ödeme durumu değişikliğiyle
aynı PostgreSQL transaction'ında müşteri ve admin için iki ayrı kuyruk kaydı oluşturur.
Başarısız/tekrar eden callback yeni kayıt oluşturmaz. SMTP gönderimi ödeme yanıtından
bağımsızdır; Nitro eklentisi kuyruğu 15 saniyede bir işler. Hatalar en fazla bir saatlik
aralıklarla yeniden denenir. Her alıcının sonucu ayrı saklanır. Çökme sonrası SMTP
kabulüyle veritabanı kaydı arasındaki küçük aralıkta tekrar gönderim mümkündür;
bildirimler sabit Message-ID kullanır.

Sunucu ortam dosyası: `/var/www/minatoi/shared/.env`. SMTP şifresi yalnızca bu
kısıtlı dosyada tutulur; kaynak kodda veya tarayıcı ortamında bulunmaz.

- `ORDER_EMAIL_ENABLED=1`: kuyruk işleyicisini açar.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP bağlantısı.
- `SMTP_FROM`: gönderen, mevcut hesap `notify@dijitalpanter.com`.
- `ORDER_ADMIN_EMAIL`: yönetici alıcısı.
- `ORDER_EMAIL_TEST_TO`: doluyken **hem müşteri hem admin** bu adrese gider;
  e-postalarda TEST ibaresi görünür. 15 Ekim 2026 itibarıyla bu değer boşaltıldı;
  gerçek müşteri adreslerine gönderim açık. Admin alıcısı `oztassema@hotmail.com`.

İleride testten tekrar canlıya geçerken gerçek yönetici adresini tanımlayın,
`ORDER_EMAIL_TEST_TO` değerini boşaltın ve servisi kesintisiz geçişle yenileyin.
Kartlı ödemenin açık olması ayrıca `PAYTR_ENABLED=1` gerektirir;
15 Ekim 2026 tarihinde kullanıcı talebiyle `PAYTR_ENABLED=1` ve
`PAYTR_TEST_MODE=0` canlı ödeme ayarları etkinleştirildi.

Yeni kurulumda `npm run db:orders` mevcut sipariş tablosuyla beraber
`order_email_outbox` tablosunu hazırlar. Yalnızca yeni onaylanan siparişler kuyruğa
alınır; geçmiş siparişlere toplu bildirim gönderilmez.

Kontrol: `npm run test:emails`, `npm run test:payments`.
SMTP kontrolü: `node --env-file=/var/www/minatoi/shared/.env scripts/test-order-emails.mjs`.
İki örnek ileti gönderimi için `--send` ekleyin; test alıcısı tanımlı olmalıdır.
Test betiği için kaynak kod ve nodemailer/zod paketlerinin kurulu olması gerekir.

İşletim: `journalctl -u minatoi` içindeki `[order-email]` kayıtları.
`order_email_outbox` tablosunda `sent_at`, `attempts`, `next_attempt_at`,
`last_error` alanları bulunur. Loglar kimlik bilgisi veya e-posta içeriği yazmaz.

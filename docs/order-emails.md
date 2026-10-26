# Sipariş bilgilendirme e-postaları

PayTR imzası ve tutarı doğrulanan başarılı ödeme, aynı veritabanı işlemi içinde müşteri ve admin bildirimlerini kuyruğa ekler. Başarısız veya bekleyen ödemede onay e-postası gönderilmez. Tekrarlanan sağlayıcı bildirimi yeni kuyruk kaydı oluşturmaz.

Müşteri kendi adresine, admin varsayılan olarak info@minatoi.com adresine ayrı iletiler alır. Türkçe HTML ve düz metin içerikte sipariş numarası, ürün/ölçü/adet, tutarlar, indirim, ücretsiz kargo, toplam, teslimat ve iletişim bilgileri bulunur. Müşteri yanıtları admin adresine, admin yanıtları müşteriye gider.

Sunucu ortamında ORDER_EMAIL_ENABLED=1 ve mevcut NOTIFIVA_SMTP_PASSWORD yeterlidir; SMTP_HOST boş bırakılır. Bu durumda smtp.notifiva.com:587 üzerinde STARTTLS, notifiva kullanıcısı ve no-reply@e.dijitalpanter.com göndereni kullanılır. Farklı sağlayıcı için SMTP_HOST, SMTP_PORT (587 veya 465), SMTP_USER, SMTP_PASS, SMTP_FROM birlikte tanımlanır. ORDER_ADMIN_EMAIL alıcıyı değiştirebilir. Şifreleri Git'e veya VITE_ değişkenlerine koymayın.

Önce `npm run db:orders` ile kuyruk tablosunu oluşturun. Derleme ve sunucu ortamı güncellendikten sonra Node servisini yeniden başlatın. İşleyici 15 saniyede bir kuyruğu kontrol eder; başarısız gönderimler artan aralıklarla tekrar denenir. SMTP kabulünden sonra süreç çökerse nadiren tekrar gönderim olabilir; sabit Message-ID kullanılır.

Bağlantı testi: `node --env-file=.env scripts/test-order-emails.mjs`. Script ORDER_EMAIL_TEST_TO gerektirir. Aynı komuta `--send` eklemek iki açıkça TEST etiketli örneği yalnızca bu adrese gönderir. Gerçek gönderimde ORDER_EMAIL_TEST_TO boş olmalıdır. PayTR test siparişleri de TEST olarak etiketlenir.

Otomatik doğrulama: `npm run test:emails` ve `npm run test:payments`. Gerçek SMTP kabulü veya gelen kutusuna teslim, bu testlerden anlaşılmaz.

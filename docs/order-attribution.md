# Sipariş kaynağı

Ziyaret sırasında `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` ve `utm_term` yakalanır. UTM yoksa Google reklam tıklama parametreleri (`gclid`, `gbraid`, `wbraid`), Meta `fbclid` işareti ve dış yönlendiren alan adı değerlendirilir. Tıklama kimliklerinin kendisi, referrer URL sorguları ve landing URL sorguları saklanmaz.

Son kaynak tarayıcıda 30 gün korunur; yeni kampanya/dış yönlendirme ile güncellenir. Site içi gezinme, doğrudan dönüş ve PayTR yönlendirmesi mevcut kaynağı silmez. Admin ziyaretleri kaynak toplamaz. Tarayıcı depolaması engelliyse mevcut belge boyunca bellek kullanılır; farklı cihaz/tarayıcı veya silinen depolama üzerinden ilişkilendirme garanti edilmez.

Ödeme başlatılırken kaynak `orders.attribution` JSONB alanına kaydedilir. Kaynak verisi ödeme fiyatlandırmasını veya tekrar isteği korumasını etkilemez; mevcut ödeme denemesinde kaynak değişmesi yeni ödeme oluşturmaz. Sunucu alanları doğrular. Bu alan pazarlama raporlaması içindir, doğrulanmış reklam platformu atfı değildir.

Admin > Siparişler içinde kaynak ve mevcut UTM ayrıntıları gösterilir. Eski siparişlerde geçmiş veri olmadığı için “Kaynak kaydedilmemiş” gösterilir. Yeni kayıtlarda bilgi bulunmazsa “Doğrudan / bilinmiyor” görünür.

Yeni kurulumlarda `ORDER_SCHEMA` attribution kolonunu oluşturur. Mevcut kurulumda uygulanacak eklemeli migration:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb;
```

UTM test örnekleri:

- Meta: `https://minatoi.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=cam_tablo`
- Google: `https://minatoi.com/?utm_source=google&utm_medium=cpc&utm_campaign=cam_tablo`

Doğrulama: `node --test tests/order-attribution.test.mjs` ve `npm run test:payments`.

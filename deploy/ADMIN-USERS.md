# Yönetici hesapları

16 Ekim 2026 itibarıyla yönetici girişleri PostgreSQL `admin_users` ve
`admin_sessions` tablolarıyla sunucuda doğrulanır. Kullanıcılar aynı yönetici
yetkilerine sahiptir, ayrı şifre ve ayrı sekiz saatlik oturum kullanırlar.
Tarayıcıda şifre veya şifre hash'i bulunmaz. Eski tarayıcı oturumları geçerli değildir;
bir kez yeniden giriş gerekir.

- `ugurdogan`: mevcut şifresi değiştirilmeden taşındı.
- `efeadmin`: kaydı hazır; kullanıcı terminalde şifre belirleyene kadar kapalı.

Şifreyi sohbet veya komut satırı argümanı olarak yazmayın. Doğrudan SSH terminalinde:

```sh
cd /var/www/minatoi/current
node --env-file=/var/www/minatoi/shared/.env scripts/set-admin-password.mjs efeadmin
```

İki kez görünmeden şifre girilir (en az 12 karakter). Scrypt hash'i kaydedilir,
hesap etkinleşir ve o kullanıcının eski oturumları iptal edilir. Yeniden build veya
servis yeniden başlatması gerekmez. Aynı komut başka bir mevcut yöneticinin şifresini
de sıfırlayabilir. `ugurdogan` şifresi değişmedikçe özgün giriş korunur.

Yeni kurulum: `scripts/init-admin-users.mjs` tablo oluşturur, mevcut `.env`
ayarlarından ugurdogan kaydını koruyarak taşır ve efeadmin kaydını kapalı oluşturur;
var olan kayıtların üzerine yazmaz. Mevcut kurulumda bu adımı tekrar çalıştırmak
şifreleri değiştirmez.

Giriş `POST /api/admin/login`, çıkış `POST /api/admin/logout` üzerinden yapılır.
Kaynak kontrolü ve giriş denemesi sınırları vardır. Tüm yönetim yazma işlemleri ile
sipariş paneli `server/utils/adminAuth.ts` içindeki merkezi oturum kontrolünü kullanır.
Eski frontend şifre hash'i API yetkilendirmesi için kabul edilmez.

Doğrulama: `npm run test:admin`, `npm run test:payments`, `npx tsc --noEmit`,
`npm run build`. Gerçek PostgreSQL üzerinde geri alınan işlem ve geçici HTTP
oturumuyla da hesap/oturum/yetki testleri yapıldı.

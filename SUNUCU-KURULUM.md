# The Bulls — Windows Sunucu Kurulum Rehberi

## Gereksinimler

- Node.js 20+ (https://nodejs.org)
- PM2 (process yönetimi): `npm install -g pm2`

---

## 1. İlk Kurulum

```bash
# Projeyi sunucuya kopyala, sonra:
npm install
npm run build
```

---

## 2. Şifre Ayarla

`.env` dosyasını düzenle. Yeni şifre hash'i üretmek için:

```bash
node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('YENİŞİFREN').digest('hex'));"
```

Çıkan hash'i `.env` dosyasındaki iki `*_PASS_HASH` satırına yaz:

```
VITE_ADMIN_PASS_HASH=<hash>
ADMIN_PASS_HASH=<hash>
```

Değiştirdikten sonra `npm run build` yeniden çalıştır.

---

## 3. Siteyi Başlat

### PM2 ile (önerilen — sunucu kapansa bile otomatik başlar)

```bash
pm2 start .output/server/index.mjs --name "thebulls"
pm2 save
pm2 startup   # Windows servis olarak kaydet
```

### Manuel başlatma

```bash
node .output/server/index.mjs
```

Varsayılan port: **3000**. Farklı port için:

```bash
PORT=8080 node .output/server/index.mjs
```

---

## 4. Ürün Yönetimi

Tarayıcıdan `http://sunucu-ip:3000/admin` adresine git.

- Kullanıcı adı ve şifre ile giriş yap
- Ürün ekle / düzenle / sil
- "Değişiklikleri Kaydet" → sunucudaki `data/products.json` güncellenir
- Tüm ziyaretçiler sayfayı yenilediğinde güncel listeyi görür
- **Rebuild gerekmez**

---

## 5. Ürün Güncelleme Sonrası

Admin panelinden yapılan değişiklikler **anında** yansır — rebuild veya restart gerekmez.

Kod değişikliği (yeni özellik vb.) sonrası:

```bash
npm run build
pm2 restart thebulls
```

---

## 6. Resim Ekleme

Yeni ürün görselleri için dosyaları şu klasöre koy:

```
public/images/products/<klasor-adi>/resim.jpg
```

Admin panelinde görsel URL olarak `/images/products/<klasor-adi>/resim.jpg` yaz.

---

## Özet Akış

```
Admin /admin → login → ürün ekle/düzenle/sil → Kaydet
                              ↓
                    data/products.json güncellenir
                              ↓
              Tüm ziyaretçiler yenilediğinde görür ✓
```

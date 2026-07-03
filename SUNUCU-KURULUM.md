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

**ÖNEMLİ:** Build sonrası `.output` klasöründeki tüm dosyaların sunucuya kopyalandığından emin ol.

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

## 3. Dosya Yapısını Kontrol Et

Sunucuda şu klasör yapısının olduğundan emin ol:

```
thebulls/
├── .output/
│   ├── server/
│   │   └── index.mjs         # Ana server dosyası
│   └── public/
│       ├── assets/           # Build edilmiş CSS/JS
│       ├── images/           # Ürün görselleri
│       └── products.json     # Ürün veritabanı (API bu dosyayı okur)
├── public/
│   ├── images/               # Kaynak görseller
│   └── products.json         # Kaynak ürün listesi
├── data/
│   └── products.json         # Yedek ürün listesi
└── .env                      # Environment variables
```

**ÖNEMLİ:** Eğer `.output/public/products.json` yoksa, `public/products.json`'u `.output/public/` klasörüne kopyala:

```bash
copy public\products.json .output\public\products.json
```

---

## 4. Siteyi Başlat

### PM2 ile (önerilen — sunucu kapansa bile otomatik başlar)

```bash
# Önce mevcut process'i durdur (varsa)
pm2 delete thebulls

# Yeni process'i başlat
pm2 start .output/server/index.mjs --name "thebulls"
pm2 save
pm2 startup   # Windows servis olarak kaydet

# Log'ları kontrol et
pm2 logs thebulls
```

### Manuel başlatma

```bash
node .output/server/index.mjs
```

Varsayılan port: **3000**. Farklı port için:

```bash
set PORT=8080 && node .output/server/index.mjs
```

---

## 5. Sorun Giderme

### 5.1. Admin Panelde Ürünler Görünmüyor

**Kontrol 1:** API endpoint'inin çalıştığını doğrula:

```bash
curl http://localhost:3000/api/products
```

veya tarayıcıdan: `http://sunucu-ip:3000/api/products`

**Beklenen:** JSON array döndürmeli

**Kontrol 2:** products.json dosyasının varlığını kontrol et:

```bash
dir .output\public\products.json
dir public\products.json
dir data\products.json
```

En az biri var olmalı.

**Kontrol 3:** PM2 log'larını incele:

```bash
pm2 logs thebulls --lines 50
```

404 veya "products.json not found" hatası varsa dosya kopyalama adımını tekrarla.

### 5.2. Hero Section Görseli Yüklenmiyor

**Kontrol 1:** Görsel dosyalarının sunucuda olduğundan emin ol:

```bash
dir .output\public\images\products\
```

**Kontrol 2:** Görsel URL'lerini kontrol et. Admin panelde veya `products.json`'da şu formatta olmalı:

```
/images/products/sokrates/wa1.jpg
```

**Kontrol 3:** Browser console'da görselin tam URL'ini kontrol et:

```
http://sunucu-ip:3000/images/products/sokrates/wa1.jpg
```

Bu URL direkt erişilebilir olmalı.

### 5.3. Hydration Uyarısı

Console'da `data-new-gr-c-s-check-loaded` hatası görüyorsan bu tarayıcı eklentilerinden kaynaklanıyor (Grammarly, vb.). 

**Çözüm:** Güncelleme yaptık, hydration uyarılarını baskıladık. Rebuild et:

```bash
npm run build
pm2 restart thebulls
```

---

## 6. Ürün Yönetimi

Tarayıcıdan `http://sunucu-ip:3000/admin` adresine git.

- Kullanıcı adı ve şifre ile giriş yap
- Ürün ekle / düzenle / sil
- "Değişiklikleri Kaydet" → sunucudaki `public/products.json` güncellenir
- Tüm ziyaretçiler sayfayı yenilediğinde güncel listeyi görür
- **Rebuild gerekmez**

---

## 7. Ürün Güncelleme Sonrası

Admin panelinden yapılan değişiklikler **anında** yansır — rebuild veya restart gerekmez.

Kod değişikliği (yeni özellik vb.) sonrası:

```bash
npm run build
pm2 restart thebulls
```

---

## 8. Resim Ekleme

Yeni ürün görselleri için dosyaları şu klasöre koy:

```
public/images/products/<klasor-adi>/resim.jpg
```

**ÖNEMLİ:** Build sonrası görsellerin `.output/public/images/` altına kopyalandığından emin ol. Eğer kopyalanmadıysa manuel kopyala:

```bash
xcopy /E /I public\images .output\public\images
```

Admin panelinde görsel URL olarak `/images/products/<klasor-adi>/resim.jpg` yaz.

---

## 9. Build Sonrası Kontrol Listesi

Her build sonrası şunları doğrula:

- [ ] `.output/server/index.mjs` var
- [ ] `.output/public/products.json` var (yoksa `public/products.json`'u kopyala)
- [ ] `.output/public/images/` klasöründe ürün görselleri var
- [ ] `.env` dosyası sunucuda mevcut ve hash'ler doğru
- [ ] PM2 ile process başlatıldı: `pm2 list`
- [ ] Site erişilebilir: `http://sunucu-ip:3000`
- [ ] API çalışıyor: `http://sunucu-ip:3000/api/products`

---

## Özet Akış

```
Admin /admin → login → ürün ekle/düzenle/sil → Kaydet
                              ↓
                    .output/public/products.json güncellenir
                              ↓
              Tüm ziyaretçiler yenilediğinde görür ✓
```

---

## Hızlı Komutlar

```bash
# Build
npm run build

# products.json kopyala (build sonrası gerekirse)
copy public\products.json .output\public\products.json

# Görselleri kopyala (build sonrası gerekirse)
xcopy /E /I public\images .output\public\images

# PM2 başlat/yeniden başlat
pm2 start .output/server/index.mjs --name "thebulls"
pm2 restart thebulls

# Log kontrol
pm2 logs thebulls --lines 100

# API test
curl http://localhost:3000/api/products
```

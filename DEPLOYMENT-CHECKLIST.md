# 🚀 Deployment Kontrol Listesi

Bu checklist'i sunucuya her deployment yaptığınızda kullanın.

## ✅ Build Öncesi

- [ ] `.env` dosyasında `ADMIN_PASS_HASH` ve `VITE_ADMIN_PASS_HASH` değerleri dolduruldu mu?
- [ ] `public/products.json` güncel mi?
- [ ] `public/images/products/` klasöründe tüm ürün görselleri var mı?
- [ ] Git'te commit yapıldı mı? (isteğe bağlı)

**Komut:**
```bash
npm run build
```

---

## ✅ Build Sonrası Kontrol

- [ ] `.output/server/index.mjs` oluşturuldu mu?
- [ ] `.output/public/products.json` var mı?
- [ ] `.output/public/images/products/` klasöründe görseller var mı?
- [ ] `.output/public/assets/` klasöründe CSS/JS dosyaları var mı?

**Kontrol Komutları:**
```bash
dir .output\server\index.mjs
dir .output\public\products.json
dir .output\public\images\products\
dir .output\public\assets\
```

---

## ✅ Sunucuya Upload

Aşağıdaki klasör ve dosyaları sunucuya yükleyin:

### Zorunlu Dosyalar:
- [ ] `.output/` klasörünün tamamı
- [ ] `.env` dosyası (şifre hash'leriyle)
- [ ] `package.json`
- [ ] `package-lock.json` veya `bun.lock`

### Opsiyonel (güncelleme yapıldıysa):
- [ ] `public/` klasörü (yeni görseller eklediyseniz)
- [ ] `node_modules/` (yeni dependency yoksa gerekli değil)

**Not:** FTP/SFTP kullanıyorsanız, binary mode'da transfer edin.

---

## ✅ Sunucuda Kurulum

SSH ile sunucuya bağlanın ve şu adımları takip edin:

### 1. Dosya İzinlerini Kontrol Et
```bash
cd /path/to/thebulls
dir
```

### 2. Dependencies Yükle (ilk kurulumda)
```bash
npm install --production
```

### 3. PM2 ile Başlat/Yeniden Başlat
```bash
# Eski process'i durdur
pm2 delete thebulls

# Yeni process'i başlat
pm2 start .output\server\index.mjs --name "thebulls"
pm2 save

# Auto-start ayarla (ilk kurulumda)
pm2 startup
```

### 4. Log Kontrol
```bash
pm2 logs thebulls --lines 30
```

**Beklenen:** Hata mesajı yok, "Listening on http://..." mesajı var.

---

## ✅ Fonksiyon Testleri

### Test 1: Site Erişimi
**Tarayıcıdan:** `http://sunucu-ip:3000`

- [ ] Ana sayfa yükleniyor mu?
- [ ] Header ve footer görünüyor mu?
- [ ] Görseller yükleniyor mu?

### Test 2: API Endpoint
**Tarayıcıdan:** `http://sunucu-ip:3000/api/products`

- [ ] JSON array dönüyor mu?
- [ ] Ürün listesi görünüyor mu?
- [ ] Hata mesajı yok mu? (404 olmamalı)

**Terminal'den:**
```bash
curl http://localhost:3000/api/products
```

### Test 3: Ürün Sayfaları
**Tarayıcıdan:** `http://sunucu-ip:3000/urunler`

- [ ] Ürün kartları görünüyor mu?
- [ ] Ürün görselleri yükleniyor mu?
- [ ] Fiyatlar doğru görünüyor mu?

### Test 4: Admin Panel
**Tarayıcıdan:** `http://sunucu-ip:3000/admin`

- [ ] Login sayfası görünüyor mu?
- [ ] Kullanıcı adı/şifre ile giriş yapılabiliyor mu?
- [ ] Ürünler listelenmiş mi?
- [ ] Yeni ürün eklenebiliyor mu?
- [ ] Kaydet butonu çalışıyor mu?

### Test 5: Hero Section
**Tarayıcıdan:** `http://sunucu-ip:3000` (masaüstü görünümde)

- [ ] Hero bölümündeki büyük ürün görseli görünüyor mu?
- [ ] Görsel yüklenmiyorsa browser console'da hata var mı?

---

## ✅ Sorun Giderme

### Sorun: 404 - /api/products bulunamadı

**Çözüm 1:** Server route'ların yüklendiğinden emin ol
```bash
dir .output\server\_routes\api\products.mjs
```

**Çözüm 2:** PM2'yi yeniden başlat
```bash
pm2 restart thebulls
pm2 logs thebulls
```

---

### Sorun: Admin panelde ürünler görünmüyor

**Çözüm 1:** products.json kontrolü
```bash
type .output\public\products.json
```

**Çözüm 2:** API'yi manuel test et
```bash
curl http://localhost:3000/api/products
```

Eğer boş array `[]` dönüyorsa, `public\products.json` dosyasını `.output\public\` altına kopyala:
```bash
copy public\products.json .output\public\products.json
pm2 restart thebulls
```

---

### Sorun: Hero section görseli görünmüyor

**Çözüm 1:** Görsel dosyasının varlığını kontrol et
```bash
dir .output\public\images\products\sokrates\wa1.jpg
```

**Çözüm 2:** Browser console'da tam hata mesajını kontrol et (F12)

**Çözüm 3:** Görselleri manuel kopyala
```bash
xcopy /E /I public\images .output\public\images
pm2 restart thebulls
```

---

### Sorun: Hydration uyarısı

Bu browser extension'larından (Grammarly vb.) kaynaklanır. Site çalışıyor ama console'da uyarı görünüyor.

**Çözüm:** Kodda `suppressHydrationWarning` ekledik, rebuild et:
```bash
npm run build
pm2 restart thebulls
```

---

## ✅ Son Kontrol

Deployment başarılı! Aşağıdakileri doğrulayın:

- [ ] Site erişilebilir: `http://sunucu-ip:3000`
- [ ] Ana sayfa düzgün yükleniyor
- [ ] Ürünler sayfası çalışıyor: `/urunler`
- [ ] Admin panel erişilebilir: `/admin`
- [ ] API endpoint dönüş yapıyor: `/api/products`
- [ ] PM2 listesinde process var: `pm2 list`
- [ ] PM2 otomatik başlatma aktif: `pm2 startup`

---

## 📞 Destek

Sorun devam ediyorsa:

1. PM2 loglarını kontrol et: `pm2 logs thebulls --lines 100`
2. Browser console'u kontrol et (F12)
3. `SUNUCU-KURULUM.md` dokümanını incele

**Hızlı Test Komutu:**
```bash
# Tüm kontrolleri tek seferde yap
pm2 list && curl http://localhost:3000/api/products && curl -I http://localhost:3000
```

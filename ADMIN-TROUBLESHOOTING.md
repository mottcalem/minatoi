# 🔧 Admin Panel Sorun Giderme

## ❌ Sorun: "Ana Görseli Değiştiriyorum ama Kaydetmiyor"

### Olası Nedenler

#### 1. **Geliştirme Modunda Çalıştırıyorsunuz** ⚠️

Admin panel yazma işlemleri **sadece production build'de** çalışır.

**Test:**
- Tarayıcıda `http://localhost:5173` veya `http://localhost:3000` mu?
- Kaydet butonuna bastıktan sonra console'da (F12) şu mesajı görüyor musunuz?

```
⚠️ Geliştirme modundasınız. Kayıt işlemi yalnızca production build'de çalışır.
```

**Çözüm:**
```bash
# Build
npm run build

# Production sunucuyu başlat
node .output/server/index.mjs
```

Artık `http://localhost:3000/admin` adresinden kayıt işlemi çalışacaktır.

---

#### 2. **Yetki Hatası (401 Unauthorized)**

Admin şifreniz yanlış veya `.env` dosyasındaki hash güncel değil.

**Test:**
- Kaydet butonuna bastıktan sonra toast mesajında "Yetki hatası" yazıyor mu?
- Browser console'da (F12) şunu görüyor musunuz?

```
[Admin] Save failed: 401: {"error":"Unauthorized"}
```

**Çözüm:**

1. `.env` dosyasını kontrol edin:

```bash
VITE_ADMIN_PASS_HASH=<hash>
ADMIN_PASS_HASH=<hash>
```

2. Şifre hash'ini yeniden oluşturun:

```bash
node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('YENİŞİFRENİZ').digest('hex'));"
```

3. Çıkan hash'i `.env` dosyasına kaydedin.

4. Yeniden build edin:

```bash
npm run build
pm2 restart thebulls
```

5. Admin panelinden çıkış yapıp yeni şifre ile tekrar giriş yapın.

---

#### 3. **API Endpoint Çalışmıyor**

Sunucu API route'u düzgün yüklememiş olabilir.

**Test:**
```bash
curl http://localhost:3000/api/products
```

**Beklenen:** JSON array dönmeli, örneğin:
```json
[{"slug":"sokrates-klasik-cuzdan","name":"SOKRATES..."}]
```

**404 döndüyse:**

**Çözüm:**

1. API route dosyasının build'e dahil edildiğini kontrol edin:

```bash
dir .output\server\_routes\api\products.mjs
```

2. Yoksa yeniden build edin:

```bash
npm run build
pm2 restart thebulls
```

3. PM2 log'larını kontrol edin:

```bash
pm2 logs thebulls --lines 50
```

---

#### 4. **products.json Yazma İzni Yok**

Sunucu `public/products.json` dosyasına yazamıyor olabilir.

**Test:**

PM2 log'larında şunu görüyor musunuz?

```
[api/products POST] write error: EACCES: permission denied
```

**Çözüm:**

Windows'ta dosya izinlerini kontrol edin:

```powershell
# Dosyanın varlığını kontrol et
dir .output\public\products.json

# İzinleri gör
icacls .output\public\products.json
```

Dosya yoksa manuel oluşturun:

```bash
copy public\products.json .output\public\products.json
```

---

#### 5. **Browser Cache Sorunu**

Tarayıcı eski JavaScript dosyalarını cache'lemiş olabilir.

**Çözüm:**

1. Hard refresh yapın: `Ctrl+Shift+R` (Windows) veya `Cmd+Shift+R` (Mac)
2. Cache'i tamamen temizleyin: `F12` → Application → Clear Storage
3. Sayfayı yenileyin

---

## ✅ Adım Adım Kontrol Listesi

Sırasıyla şunları kontrol edin:

### 1. Production Build Kullanıyor musunuz?

- [ ] `npm run build` çalıştırıldı mı?
- [ ] `node .output/server/index.mjs` ile başlatıldı mı?
- [ ] URL `localhost:3000` mi? (5173 değil)

### 2. Admin Girişi Doğru mu?

- [ ] `.env` dosyasında `ADMIN_PASS_HASH` var mı?
- [ ] Şifre hash'i doğru mu?
- [ ] Admin panelinde login başarılı mı?

### 3. API Çalışıyor mu?

- [ ] `curl http://localhost:3000/api/products` JSON döndürüyor mu?
- [ ] `.output/server/_routes/api/products.mjs` dosyası var mı?

### 4. Dosya İzinleri Tamam mı?

- [ ] `.output/public/products.json` var mı?
- [ ] Dosya yazılabilir mi?

### 5. Console Hatası Var mı?

- [ ] Browser console'da (F12) kırmızı hata var mı?
- [ ] PM2 log'larında (`pm2 logs thebulls`) hata var mı?

---

## 🎯 Çözüm: Tam Test Akışı

1. **Build:**
   ```bash
   npm run build
   ```

2. **Başlat:**
   ```bash
   pm2 delete thebulls
   pm2 start .output/server/index.mjs --name "thebulls"
   ```

3. **API Test:**
   ```bash
   curl http://localhost:3000/api/products
   ```

4. **Admin Panel:**
   - Tarayıcıda: `http://localhost:3000/admin`
   - Login yap
   - Ürün düzenle
   - "Ana Görsel URL" alanını değiştir
   - "Değişiklikleri Kaydet" butonuna bas

5. **Console Kontrol:**
   - `F12` açık olsun
   - "Network" sekmesine git
   - `/api/products` isteğini bul
   - Status code `200` mı?
   - Response body `{"ok":true,"count":...}` gibi mi?

6. **Toast Mesajı:**
   - Sağ altta yeşil toast: ✅ Başarılı
   - Sağ altta kırmızı toast: ❌ Hata var, console'u oku

---

## 📝 Geliştirme vs Production Farkı

| Özellik | Geliştirme (`npm run dev`) | Production (`node .output/server/index.mjs`) |
|---------|----------------------------|---------------------------------------------|
| **Port** | 5173 | 3000 |
| **Hot Reload** | ✅ Var | ❌ Yok |
| **Admin Kayıt** | ❌ **ÇALIŞMAZ** | ✅ Çalışır |
| **API Yazma** | ❌ Mock/Dummy | ✅ Gerçek dosyaya yazar |
| **SSR** | Partial | Full |

**ÖNEMLİ:** Admin panel yazma işlemleri **sadece production build'de** çalışır!

---

## 🔍 Debug Komutları

### Browser Console'da:

```javascript
// Admin token'ı kontrol et
localStorage.getItem('admin_token')

// API'yi manuel test et
fetch('/api/products')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// POST test (şifre hash'i gerekli)
const token = localStorage.getItem('admin_token');
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify([{
    slug: 'test',
    name: 'Test Ürün',
    category: 'cuzdan',
    price: 100,
    image: '/test.jpg',
    images: [],
    shortDescription: 'Test',
    description: 'Test',
    features: [],
    shopierUrl: 'https://shopier.com'
  }])
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Sunucu Log'ları:

```bash
# PM2 log'larını izle
pm2 logs thebulls --lines 100

# Gerçek zamanlı izle
pm2 logs thebulls -f

# API route'u kontrol et
dir .output\server\_routes\api\products.mjs

# products.json kontrol et
type .output\public\products.json
```

---

## 📞 Hala Çalışmıyorsa

1. **Console çıktısını kaydedin** (F12 → Console → Sağ tık → Save as...)
2. **PM2 log'larını kaydedin** (`pm2 logs thebulls --lines 200 > logs.txt`)
3. **API test sonucunu kaydedin** (`curl http://localhost:3000/api/products > api-output.json`)
4. Bu 3 dosyayı inceleyip hatayı tespit edin

---

## ✅ Başarı Kontrolü

Aşağıdakiler çalışıyorsa her şey tamam:

- [ ] `http://localhost:3000` açılıyor
- [ ] `http://localhost:3000/admin` login sayfası geliyor
- [ ] Login başarılı, ürün listesi görünüyor
- [ ] Ürün düzenle → Ana görsel değiştir → Kaydet
- [ ] Yeşil toast: "... güncellendi."
- [ ] Ürün listesinde yeni görsel görünüyor
- [ ] `curl http://localhost:3000/api/products` güncel JSON döndürüyor
- [ ] `.output/public/products.json` dosyası güncellenmiş

**Hepsi ✅ ise admin panel kusursuz çalışıyor demektir!**

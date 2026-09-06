# 🎯 Admin Panel Kaydetme Sorunu — Kesin Çözüm

## Sorunun Kökü

Admin panelde "Ana Görsel URL" değiştirip "Kaydet" butonuna basınca değişiklik kaydedilmiyor, tekrar açınca eski değer geliyor.

**Neden:** API POST isteği `401 Unauthorized` döndürüyordu — token doğrulama başarısız oluyordu.

---

## Tespit Edilen 3 Sorun

### 1. Token Storage Uyumsuzluğu ✅ DÜZELTİLDİ

**Sorun:**
- `adminAuth.ts` → Token'ı `sessionStorage`'a kaydediyordu
- `adminProducts.ts` → Token'ı `localStorage`'dan okuyordu

**Sonuç:** Token bulunamıyordu, boş string gönderiliyordu.

**Çözüm:**
- `adminLogin` → Token'ı artık hem `sessionStorage` hem `localStorage`'a kaydediyor
- `saveProducts` → Önce `localStorage`, yoksa `sessionStorage`'dan token okuyor

### 2. .env Değişken Adları Eksik/Yanlış ✅ DÜZELTİLDİ

**Sorun:**
`.env.example` sadece `VITE_ADMIN_PASS_HASH` gösteriyordu. Ama API endpoint hem `ADMIN_PASS_HASH` hem de `VITE_ADMIN_PASS_HASH` arıyordu.

**Sunucuda olması gereken:**
```bash
VITE_ADMIN_USER_HASH=<kullanici_hash>
VITE_ADMIN_PASS_HASH=<sifre_hash>
ADMIN_PASS_HASH=<sifre_hash_ile_ayni>  ← Bu EKSİKTİ
```

**ÖNEMLİ:** `ADMIN_PASS_HASH` ve `VITE_ADMIN_PASS_HASH` **aynı değer** olmalı.

**Çözüm:**
- `.env.example` güncellendi — artık her iki değişkeni de gösteriyor
- API endpoint artık `.env` dosyasını birden fazla lokasyonda arıyor

### 3. API .env Okuma Hatası ✅ DÜZELTİLDİ

**Sorun:**
Nitro build'de `process.cwd()` farklı dizine işaret edebiliyor. `.env` dosyası bulunamıyordu.

**Çözüm:**
API endpoint artık `.env` dosyasını 3 lokasyonda arıyor:
1. `cwd/.env`
2. `cwd/../.env` (bir üst dizin)
3. Node binary yanında

---

## Sunucuda Yapılması Gerekenler

### Adım 1: .env Dosyasını Kontrol Et

SSH ile sunucuya bağlanın:

```bash
cd /path/to/thebulls
cat .env | grep HASH
```

**Beklenen Çıktı:**
```
VITE_ADMIN_USER_HASH=abc123...
VITE_ADMIN_PASS_HASH=def456...
ADMIN_PASS_HASH=def456...      ← Bu VITE_ADMIN_PASS_HASH ile aynı olmalı
```

**Eğer `ADMIN_PASS_HASH` eksikse veya farklıysa:**

```bash
# .env dosyasını düzenle
nano .env

# Şu satırı ekle veya düzelt:
ADMIN_PASS_HASH=<VITE_ADMIN_PASS_HASH_ile_ayni_deger>

# Kaydet: Ctrl+O → Enter → Ctrl+X
```

### Adım 2: Yeni Build'i Deploy Et

Yerel makinede:
```bash
npm run build
```

`.output/` klasörünü sunucuya yükle (FTP/SFTP/rsync).

### Adım 3: PM2'yi Yeniden Başlat

Sunucuda:
```bash
pm2 restart thebulls
pm2 logs thebulls --lines 30
```

Log'larda şunu göreceksiniz:
```
[loadPassHash] Loaded from process.env
```

veya

```
[loadPassHash] Found .env at: /path/to/.env
```

**Eğer şunu görüyorsanız SORUN VAR:**
```
[loadPassHash] Could not find ADMIN_PASS_HASH
```

### Adım 4: Admin Panelde Test Et

1. Tarayıcıda admin paneli aç: `https://minatoi.com/admin`
2. **Çıkış yapıp tekrar giriş yap** (eski token'ı temizlemek için)
3. F12 ile console'u aç
4. Bir ürün düzenle → "Ana Görsel URL" değiştir → "Kaydet"

**Console'da şunu göreceksiniz:**
```
[saveProducts] Sending request with token: def45678...
[saveProducts] Success!
```

**Toast mesajı:**
```
✓ "SOKRATES — ..." güncellendi.
```

5. Sayfayı yenile → Ürün listesinde yeni görsel görünmeli
6. Ürünü tekrar düzenle → Yeni görsel path'i gelmiş olmalı

---

## Debug: Token Eşleşmesini Manuel Test Et

### Browser Console'da (F12):

```javascript
// Token'ı kontrol et
const token = localStorage.getItem('admin_token');
console.log('Token:', token ? token.substring(0, 16) + '...' : 'NOT FOUND');

// Session'ı kontrol et
const session = sessionStorage.getItem('thebulls_admin_session');
if (session) {
  const { passHash } = JSON.parse(session);
  console.log('Session passHash:', passHash.substring(0, 16) + '...');
}

// Manuel POST isteği at
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`
  },
  body: JSON.stringify([]) // Boş array - test için
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Beklenen:** `{ok: true, count: 0}` veya mevcut ürün sayısı

**401 dönerse:** Token yanlış veya sunucudaki `.env` eksik

### PM2 Log'larında:

```bash
pm2 logs thebulls | grep "api/products POST"
```

**Başarılı:**
```
[api/products POST] OK, wrote 3 products
```

**Başarısız:**
```
[api/products POST] Auth failed. Token length: 0, Expected hash length: 64, Hash found: false
```

veya

```
[api/products POST] Auth failed. Token length: 64, Expected hash length: 64, Hash found: true
```
(Token ve hash uzunlukları eşit ama değerleri farklı — `.env` yanlış)

---

## Hızlı Test Scripti

Yerel makineden sunucu API'sini test edin:

```bash
# Şifrenizin hash'ini hesaplayın
HASH=$(node -e "console.log(require('crypto').createHash('sha256').update('SIFRENIZ').digest('hex'))")

# Test POST isteği
curl -X POST https://minatoi.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HASH" \
  -d '[]'
```

**Beklenen:**
```json
{"ok":true,"count":0}
```

**401 alırsanız:**
- Sunucudaki `.env` kontrol edin
- `ADMIN_PASS_HASH` değeri şifrenizin hash'i ile aynı mı?

---

## Özet Checklist

Sunucuda deploy sonrası kontrol edin:

- [ ] `.env` dosyasında `ADMIN_PASS_HASH` var mı?
- [ ] `ADMIN_PASS_HASH` ve `VITE_ADMIN_PASS_HASH` aynı değer mi?
- [ ] Yeni build deploy edildi mi?
- [ ] PM2 restart yapıldı mı?
- [ ] PM2 log'unda `[loadPassHash] Loaded from ...` mesajı var mı?
- [ ] Admin panelde çıkış yapıp tekrar giriş yapıldı mı?
- [ ] Test ürün düzenlemesi başarılı mı?
- [ ] Console'da `[saveProducts] Success!` mesajı var mı?
- [ ] Toast'ta "... güncellendi" mesajı göründü mü?
- [ ] Sayfayı yenileyince değişiklik yansıdı mı?

**Hepsi ✅ ise admin panel kusursuz çalışıyor!**

---

## Sorun Devam Ederse

1. **PM2 log'larını tam kaydedin:**
   ```bash
   pm2 logs thebulls --lines 200 > logs.txt
   ```

2. **Browser console çıktısını kaydedin** (F12 → Console → Sağ tık → Save as...)

3. **API'yi manuel test edin:**
   ```bash
   curl -v https://minatoi.com/api/products
   ```

4. **.env içeriğini kontrol edin** (değerleri gizli tutun):
   ```bash
   cat .env | grep HASH | sed 's/=.*/=***HIDDEN***/'
   ```

5. **process.cwd() değerini öğrenin:**
   PM2 log'unda `[loadPassHash] Could not find...` mesajındaki `ROOT=` ve `cwd=` değerlerini not alın.

---

## Son Not

Bu fix ile:
- Token artık hem `sessionStorage` hem `localStorage`'a kaydediliyor
- API endpoint `.env` dosyasını 3 lokasyonda arıyor
- Detaylı log mesajları eklendi — sorun tespit etmek kolaylaşıyor
- `.env.example` tüm gerekli değişkenleri gösteriyor

**Sunucuda tek yapılması gereken:** `.env` dosyasına `ADMIN_PASS_HASH` satırını eklemek (eğer yoksa) ve değerini `VITE_ADMIN_PASS_HASH` ile aynı yapmak.

# 🔧 Görsel 404 Hatası Çözümü

## Sorun
Browser console'da şu hata görünüyor:

```
GET https://minatoi.com/images/products/sokrates/m.jpg 404 (Not Found)
```

**Neden:** `m.jpg` yerine `man.jpg` olmalı. Sunucudaki `products.json` dosyası güncel değil veya admin panelden yanlış path girilmiş.

---

## ✅ Çözüm: Sunucudaki products.json'u Güncelle

### Seçenek 1: Admin Panelden Düzelt (Önerilen)

1. Admin panele giriş yap: `https://minatoi.com/admin`

2. SOKRATES ürününü düzenle

3. **"Ana Görsel URL"** alanını kontrol et:
   - ❌ Yanlış: `/images/products/sokrates/m.jpg`
   - ✅ Doğru: `/images/products/sokrates/wa1.jpg`

4. **"Ek Görseller"** alanında da kontrol et — satırlarda `m.jpg` varsa `man.jpg` yap

5. "Değişiklikleri Kaydet" butonuna bas

6. Sayfayı yenile ve kontrol et

---

### Seçenek 2: Yerel products.json'u Sunucuya Kopyala

Eğer yerel dosya doğruysa (kontrol ettik, doğru), onu sunucuya yükleyin:

#### Adım 1: Yerel Build'i Kontrol Et

```bash
type .output\public\products.json | findstr "sokrates.*image"
```

**Beklenen:**
```json
"image": "/images/products/sokrates/wa1.jpg",
```

#### Adım 2: Sunucuya Yükle

FTP/SFTP ile:
```
Yerel: .output/public/products.json
Uzak:  /path/to/thebulls/.output/public/products.json
```

Veya SSH ile:
```bash
# Yerel makineden
scp .output/public/products.json user@sunucu:/path/to/thebulls/.output/public/products.json
```

#### Adım 3: Sunucuyu Yeniden Başlat

```bash
pm2 restart thebulls
```

---

### Seçenek 3: Manuel Dosya Düzenleme (SSH ile)

SSH ile sunucuya bağlanın ve düzenleyin:

```bash
# Sunucuda
cd /path/to/thebulls
nano .output/public/products.json
```

Sokrates ürününü bulun ve `"image"` alanını düzeltin:

```json
{
  "slug": "sokrates-klasik-cuzdan",
  "image": "/images/products/sokrates/wa1.jpg",
  ...
}
```

Kaydet: `Ctrl+O` → Enter → `Ctrl+X`

PM2'yi yeniden başlat:
```bash
pm2 restart thebulls
```

---

## 🔍 Kök Neden Analizi

### Dosya Nerede Yanlış?

```
✅ Yerel: public/products.json → man.jpg (doğru)
✅ Yerel Build: .output/public/products.json → man.jpg (doğru)
❌ Sunucu: .output/public/products.json → m.jpg (yanlış)
```

**Sonuç:** Sunucu dosyası güncel değil veya admin panelden birisi yanlış path yazmış.

### Neden Böyle Oldu?

1. **Admin panelden yanlış girildi:** Birisi image URL'ine `m.jpg` yazdı ve kaydetti
2. **Eski deploy:** Sunucudaki dosya eski bir build'den kalmış
3. **Manuel edit:** Birisi sunucuda dosyayı manuel düzenledi ve hata yaptı

---

## ✅ Doğrulama

Düzeltme sonrası kontrol edin:

### 1. Browser'da Test

1. `https://minatoi.com` sayfasını açın
2. `Ctrl+Shift+R` ile hard refresh
3. Hero bölümündeki görseli kontrol edin
4. `F12` → Console → Hata yok mu?

### 2. API'yi Kontrol Edin

```bash
curl https://minatoi.com/api/products | grep "sokrates" -A 5
```

**Beklenen:**
```json
{
  "slug": "sokrates-klasik-cuzdan",
  "image": "/images/products/sokrates/wa1.jpg",
  ...
}
```

`m.jpg` görüyorsanız hala yanlış.

### 3. Dosyayı Direkt Kontrol Edin

SSH ile:
```bash
cat .output/public/products.json | grep "sokrates" -A 3
```

---

## 📝 Gelecekte Bunu Önlemek İçin

### 1. Admin Panelde Görsel Path Doğrulama Ekleyin

Image URL girilirken otomatik kontrol:
- Dosya uzantısı `.jpg`, `.jpeg`, `.png`, `.webp` olmalı
- Path `/images/products/` ile başlamalı
- Tam dosya adı yazılmalı (kısaltma yok)

### 2. Build Sonrası Otomatik Test

Deployment scriptine ekleyin:

```bash
# products.json'da kırık path var mı kontrol et
node -e "
const data = require('./.output/public/products.json');
for (const p of data) {
  if (!p.image || p.image.length < 10) {
    console.error('Invalid image path:', p.slug, p.image);
    process.exit(1);
  }
}
console.log('All image paths valid ✓');
"
```

### 3. Pre-commit Hook

Git commit yaparken otomatik kontrol:

`.git/hooks/pre-commit`:
```bash
#!/bin/sh
# products.json'da eksik path var mı kontrol et
node -e "
const data = require('./public/products.json');
let errors = 0;
for (const p of data) {
  if (!p.image || !p.image.startsWith('/images/')) {
    console.error('❌ Invalid image path:', p.slug, p.image);
    errors++;
  }
}
if (errors > 0) {
  console.error('\\n❌ Fix image paths before commit');
  process.exit(1);
}
console.log('✅ All image paths valid');
"
```

---

## 🚀 Hızlı Fix Komutu

Sunucuda tek komutla düzelt:

```bash
# SSH ile sunucuda
cd /path/to/thebulls && \
sed -i 's|/images/products/sokrates/m\.jpg|/images/products/sokrates/man.jpg|g' .output/public/products.json && \
pm2 restart thebulls && \
echo "✓ Fixed and restarted"
```

Bu komut:
1. `products.json`'da `m.jpg` → `man.jpg` değiştir
2. PM2'yi yeniden başlat
3. Başarı mesajı göster

---

## 📊 Özet

| Dosya | Path | Durum |
|-------|------|-------|
| Yerel `public/products.json` | `man.jpg` | ✅ Doğru |
| Yerel build `.output/public/products.json` | `man.jpg` | ✅ Doğru |
| Sunucu `.output/public/products.json` | `m.jpg` | ❌ Yanlış |

**Yapılacak:** Sunucudaki dosyayı güncelleyin (3 seçenekten biri).

**Sonuç:** 404 hatası kaybolacak, görsel düzgün yüklenecek.

# Yerel PostgreSQL

Proje kökündeki `.env` dosyasına bağlantıyı ekleyin:

```dotenv
DATABASE_URL=postgresql://postgres:PAROLA@localhost:5432/minatoi
```

Parolada URL için özel karakterler varsa URL kodlaması kullanın. Bu değişkene `VITE_` öneki eklemeyin; bağlantı yalnızca sunucuda kullanılır.

`npm run db:init` komutu ürün ve duyuru tablolarını oluşturur ve mevcut `minatoi_content` ürün listesini bir transaction içinde aktarır. Eski kayıt yoksa başlangıç kaynağı `public/products.json` olur. Aktarılan tüm alanlar ve sıralama kaynakla birebir karşılaştırılır; uyuşmazlık varsa işlem geri alınır. `schema_migrations` kaydı sayesinde komut tekrar çalıştırıldığında ürünler yeniden eklenmez veya eski verilerle değiştirilmez. Bu komut Node.js 22.18+ gerektirir.

İlk çalıştırmada `announcements` tablosu da hazırlanır ve `002_announcements` migration'ı ile kayan duyuru bandının varsayılan metinleri eklenir. Tablo doluysa hiçbir değere dokunulmaz; yönetim panelindeki "Duyuru Bandı" modülünden güncellenir.

`003_categories` migration'ı `categories` tablosunu oluşturur ve varsayılan üç kategoriyi (Cüzdan & Kartlık, Gözlük Kılıfı, Gözlük) ekler. Aynı çalıştırma, `products.category` sütunundaki eski sabit liste kısıtını (`products_category_check`) kaldırır; böylece yönetim panelinden eklenen yeni kategoriler ürünlerde kullanılabilir. Sonraki çalıştırmalarda `image` kolonu ve `categories_image_check` kısıtı idempotent olarak eklenir; kısıt yalnızca `/images/categories/<slug>/<dosya>.png|jpg|webp` biçiminde yolları kabul eder.

Kategori görselleri yönetim panelindeki "Kategoriler" sekmesinden yüklenir ve `public/images/categories/<kategori-slug>/` altına yazılır. Görsel yükleme anında sunucuya yapılır; satırdaki yol "Kategorileri Kaydet" ile kalıcılaşır. Yüklü görsel yoksa anasayfa karuselinde bilinen kategoriler için kod içindeki varsayılan görsel, yeni kategoriler için zanaat görseli kullanılır.

Ürün görselleri yönetim panelinden yüklendiğinde `public/images/products/<ürün-slug>/` dizinine yazılır; galeri sırası `product_images.position` ile DB'de korunur. Ürün açıklaması rich text editörle yazılır ve kayıt anında sunucuda allowlist ile temizlenir (yalnızca p, strong, em, u, s, h2, h3, ul, ol, li, a etiketleri korunur; bağlantılar `https?://` zorunluluğuyla `rel="noopener noreferrer nofollow"` alır).

| Tablo | İçerik |
| --- | --- |
| `products` | Her ürün ayrı satır: ID, benzersiz slug, ad, kategori, fiyat, eski fiyat, ana görsel, kısa/uzun açıklama, mağaza bağlantısı, etiket, öne çıkarma, sıra ve tarihler |
| `product_images` | Galeri görselleri; `product_id` ile ürüne bağlı, `position` ile sıralı |
| `product_features` | Özellikler; `product_id` ile ürüne bağlı, `position` ile sıralı |
| `announcements` | Kayan duyuru bandı metinleri; `position` ile sıralı, en fazla 20 satır |
| `categories` | Ürün kategorileri; slug birincil anahtar, `position` ile sıralı, en fazla 30 satır, opsiyonel `image` yolu |
| `schema_migrations` | Tamamlanan şema geçişleri |
| `minatoi_content` | Slider (`banners`) ve anasayfa hero içeriği (`hero`) JSON kayıtları; geri dönüş için korunan eski ürün kaydı |

Uygulama duyuruları `announcements` tablosundan okur; yönetim paneli tam listeyi tek transaction içinde yazar (son yazan kazanır). `DATABASE_URL` tanımlı değilse aynı arayüz `data/announcements.json` dosyasını kullanır; hiçbiri yoksa kod içindeki varsayılan liste devreye girer.

Anasayfa hero bölümü (rozet, başlık satırları, açıklama, buton etiketleri/hedefi, alt bilgi şeridi) `minatoi_content` tablosundaki `hero` anahtarında JSON nesnesi olarak saklanır; yönetim panelindeki "Hero Bölümü" modülünden düzenlenir. Kayıt yoksa veya `DATABASE_URL` tanımlı değilse kod içindeki varsayılan içerik (`data/hero.json` dosya yedeği) kullanılır.

Uygulama ürünleri artık `minatoi_content` üzerinden okumaz veya yazmaz. Buradaki eski `products` kaydı aktarım anının yedeğidir, sonraki değişiklikleri içermez. Slider verisinin depolaması bu ürün geçişinde değişmez.

Güncel 10 ürünün bütün alanları kolonlara veya bağlı tablolara aktarılır. Şu an bu kayıtlarda bulunmayan, ancak uygulama tiplerinin desteklediği cüzdan/gözlük özel detayları için `wallet_details` ve `glasses_details` JSONB kolonları korunmuştur. Eski `data/products.json` dosyasındaki test ürünü ve kod içindeki örnek katalog güncel verilere eklenmez.

Fiyatlar `numeric` tipindedir; negatif fiyat ve tekrar eden slug reddedilir. Ürün silinince galeri ve özellik kayıtları foreign key ile silinir. Yönetim panelindeki liste kaydı tek transaction içinde yapılır; bir adım başarısız olursa tüm kayıt geri alınır. Panel tam liste gönderir; aynı anda farklı yöneticilerin eski listelerle kayıt yapması durumunda son kayıt geçerlidir.

pgAdmin'de **Schemas → public → Tables → Refresh** yaptıktan sonra `products` tablosunu açın:

```sql
SELECT id, slug, name, category, price, old_price, featured
FROM public.products
ORDER BY sort_order, id;
```

`npm run db:test-products` ekleme, güncelleme, sıralama, silme, doğrulama, ilişki kısıtları ve geri alma kontrollerini geçici bir test şemasında çalıştırır. Test şeması transaction sonunda geri alınır; asıl ürün kayıtları değiştirilmez.

Ardından geliştirme sunucusunu yeniden başlatın. Ürünler ve slider görselleri PostgreSQL'den okunur; yönetim panelindeki kayıtlar PostgreSQL'e yazılır. Görsellerin sırası ve yüklenen görsel içeriği de korunur. Sağ slider için özel görsel yoksa ürün görselleri kullanılır.

`DATABASE_URL` tanımlanmamışsa mevcut dosya depolaması çalışmaya devam eder. Bağlantı tanımlı ama erişilemiyorsa uygulama eski dosya verilerine sessizce dönmez; bağlantı hatası bildirir.

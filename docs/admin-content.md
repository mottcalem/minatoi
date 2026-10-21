# İçerik yönetimi

- **Ürün Yönetimi:** Ürün ekleme, silme, fiyat ve görsel düzenleme. İlk görsel kapaktır. Yükleme bitince Kaydet kullanılabilir; hata oluşursa form açık kalır. Otomatik sipariş şablonları bu listede yer almaz.
- **Kategoriler:** Kategori ekleme, ad, sıralama ve kapak görseli. Görsel yükledikten sonra Kaydet'e basın. Seçilen kapak, ana sayfada ürün görselinden önce kullanılır.
- **Özel Tasarımlar / Örnekler:** Ana sayfadaki dört büyük kartın kapakları; kişiye özel ve patili illüstrasyon tarzları; doğrudan baskı, kişiye özel illüstrasyon, patili kostüm ve patili illüstrasyon örnekleri. Her satıra bir tarz yazın. Örnekler eklenebilir, açıklanabilir, sıralanabilir veya listeden kaldırılabilir. En sonda Değişiklikleri Kaydet'e basın.
- **Kostüm ürünleri:** Ürün Yönetimi'nde Patili Dostlara Özel kategorisine ürün ekleyin. Genel “İllüstrasyonlu Portre” ve “Kostümlü Portre” kayıtları kostüm listesinden filtrelenir; veritabanından silinmez.

Kişiye özel illüstrasyonun başlangıç seçenekleri Kara kalem, Sulu boya ve Mozaik yağlıboya olarak birleştirilmiştir.

## Yayınlama ve kontrol

Değişikliklerin canlıda görünmesi için yeni uygulama derlemesi sunucuya alınmalıdır. Mevcut ürün veya kategori verilerinin yeniden içe aktarılması gerekmez. Özel tasarım ayarları ilk kullanımda oluşturulan `custom_design_content` tablosunda tutulur; mevcut veritabanı rolünün tablo oluşturma yetkisi olmalıdır. Veritabanı yapılandırılmamış yerel kurulumlarda `data/custom-content.json` kullanılır.

Görseller mevcut yükleme sistemiyle `public/images/uploads/products/design-…/` altında saklanır. Bu dizin mevcut sunucu kurulumundaki diğer yüklemeler gibi kalıcı tutulmalıdır.

Kontroller: `npm run test:catalog`, izole test veritabanıyla `npm run db:test-products`, `npx tsc --noEmit`, `npm run build`.

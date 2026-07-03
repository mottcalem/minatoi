#!/bin/bash
# products.json Restore Script
# Kullanım: bash restore-products.sh

echo "🔄 products.json restore ediliyor..."

# Git'ten restore et
git restore public/products.json
if [ $? -ne 0 ]; then
    echo "❌ Git restore başarısız!"
    exit 1
fi

# Ürün sayısını kontrol et
count=$(cat public/products.json | grep -o '"slug"' | wc -l)
echo "✅ Git'ten restore edildi: $count ürün"

# .output/public/'e kopyala
if [ -d .output/public ]; then
    cp public/products.json .output/public/products.json
    echo "✅ .output/public/products.json güncellendi"
else
    echo "⚠️  .output/public/ bulunamadı (build yapılmamış)"
fi

# data/ klasörüne de yedek kopyala
if [ -d data ]; then
    cp public/products.json data/products.json
    echo "✅ data/products.json güncellendi"
fi

echo ""
echo "🎉 Restore tamamlandı! $count ürün geri yüklendi."
echo ""
echo "PM2'yi yeniden başlat:"
echo "  pm2 restart thebulls"

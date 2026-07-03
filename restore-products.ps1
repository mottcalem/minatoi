# products.json Restore Script
# Kullanım: .\restore-products.ps1

Write-Host "🔄 products.json restore ediliyor..." -ForegroundColor Yellow

# Git'ten restore et
git restore public/products.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git restore başarısız!" -ForegroundColor Red
    exit 1
}

# Ürün sayısını kontrol et
$count = (Get-Content public\products.json -Raw | ConvertFrom-Json).Count
Write-Host "✅ Git'ten restore edildi: $count ürün" -ForegroundColor Green

# .output/public/'e kopyala
if (Test-Path .output\public) {
    Copy-Item public\products.json .output\public\products.json -Force
    Write-Host "✅ .output/public/products.json güncellendi" -ForegroundColor Green
} else {
    Write-Host "⚠️  .output/public/ bulunamadı (build yapılmamış)" -ForegroundColor Yellow
}

# data/ klasörüne de yedek kopyala
if (Test-Path data) {
    Copy-Item public\products.json data\products.json -Force
    Write-Host "✅ data/products.json güncellendi" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Restore tamamlandı! $count ürün geri yüklendi." -ForegroundColor Cyan
Write-Host ""
Write-Host "Sunucuya deploy için:" -ForegroundColor White
Write-Host "  1. .output/public/products.json dosyasını sunucuya yükle" -ForegroundColor Gray
Write-Host "  2. Sunucuda: pm2 restart thebulls" -ForegroundColor Gray

"""Build the reviewed Zen pilot from the source CSV; does not modify the catalog."""
import csv
import json
import re
from pathlib import Path
from urllib.parse import quote

root = Path(__file__).resolve().parents[1]
source = root / 'public/products'
products = []
premium = json.loads((root / "data/imports/premium-cam-tablo.json").read_text())
for row in csv.DictReader((source / 'urunler.csv').open(encoding='utf-8-sig', newline='')):
    categories = row['Ürün kategorileri'].split('|')
    if 'Zen Koleksiyonu' not in categories:
        continue
    title = row['Title']
    folder = source / row['Ürün kategorileri'].replace('|', '_').replace('>', '_') / title
    files = {}
    for path in folder.iterdir():
        match = re.search(r'_(\d+)\.(jpeg|jpg|png|webp)$', path.name, re.I)
        if match:
            files[int(match[1])] = path
    # Visually reviewed: 3 is the room scene, 1/2 are product views, 4 is the size guide.
    # ZN101 also contains other products starting at 5; intentionally exclude those.
    assert set(range(1, 5)).issubset(files), title
    assert len(files) == (58 if title.endswith('ZN101') else 4), title
    images = ['/' + quote(files[i].relative_to(root / 'public').as_posix(), safe='/') for i in (3, 1, 2, 4)]
    slug = title.lower().translate(str.maketrans('ğüşıöç', 'gusioc'))
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    products.append(dict(slug=slug, name=title, category='zen-koleksiyonu',
        price=float(row['Price']), image=images[0], images=images,
        shortDescription=title + ' — Zen Koleksiyonu.',
        description=title + '. Zen Koleksiyonu’ndan dekoratif cam tablo.',
        features=[], shopierUrl=row['URL'],
        **({'badge': 'Yeni Gelenler'} if 'Yeni Gelenler' in categories else {})))
products = [{**p, **premium} for p in products]
assert len(products) == 19
assert len({p['slug'] for p in products}) == 19
out = root / 'data/imports/zen-koleksiyonu.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(products, ensure_ascii=False, indent=2) + '\n')
print(f'{len(products)} products, {sum(len(p["images"]) for p in products)} images: {out}')

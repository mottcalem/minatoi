"""Prepare the visually reviewed full CSV catalog, without touching the database."""
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import quote, unquote

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/products'
PREMIUM = json.loads((ROOT / 'data/imports/premium-cam-tablo.json').read_text())

def normalize(value):
    return re.sub(r'[^\w]+', '_', unicodedata.normalize('NFC', value)).strip('_').casefold()

def slugify(value):
    value = value.lower().translate(str.maketrans('ğüşıöç', 'gusioc'))
    return re.sub(r'[^a-z0-9]+', '-', value).strip('-')

# Room scenes were inspected for all rows. These legacy rows contain unrelated
# gallery photos; retain only the verified views of the named product.
REVIEWED = {
    '3855': [1, 4], '3914': [1, 4], '3984': [3, 1], '3988': [1],
    '4667': [1], '4676': [1], '4683': [1], '5813': [1],
    '5901': [2, 1, 3], '8295': [2, 1, 3],
    '9860': [2, 1, 3, 4],
}
products = {}
manifest = []
rows = list(csv.DictReader((SOURCE / 'urunler.csv').open(encoding='utf-8-sig', newline='')))
for row in rows:
    labels = row['Ürün kategorileri'].split('|')
    primary = next(label for label in labels if label != 'Yeni Gelenler').split('>')[0]
    category = slugify(primary)
    # Keep the existing URL stable while fixing the displayed category spelling.
    if primary == 'Patili Dostlara Özel': category = 'patili-dostalara-ozel'
    category_dir = SOURCE / row['Ürün kategorileri'].replace('|', '_').replace('>', '_')
    matches = [d for d in category_dir.iterdir() if d.is_dir() and normalize(d.name) == normalize(row['Title'])]
    assert len(matches) == 1, row['Title']
    files = {}
    for path in matches[0].iterdir():
        match = re.search(r'_(\d+)\.(jpeg|jpg|png|webp)$', path.name, re.I)
        if match:
            number = int(match[1])
            assert number not in files, path
            files[number] = path
    assert files, row['Title']
    # In standard folders, the first four are the product views and size guide;
    # additional photos are cross-sells from the old export, not this product.
    order = REVIEWED.get(row['id'], [1] if len(files) == 1 else [3, 1, 2, 4])
    assert all(i in files for i in order), (row['Title'], order)
    urls = ['/' + quote(files[i].relative_to(ROOT / 'public').as_posix(), safe='/') for i in order]
    slug = slugify(row['Title'])
    product = dict(slug=slug, name=row['Title'], category=category, image=urls[0], images=urls,
                   shopierUrl=row['URL'], **PREMIUM)
    if 'Yeni Gelenler' in labels: product['badge'] = 'Yeni Gelenler'
    duplicate = slug in products
    if duplicate:
        previous = products[slug]
        assert previous['name'] == product['name'] and previous['category'] == product['category']
        assert [hashlib.sha256((ROOT/'public'/unquote(u).lstrip('/')).read_bytes()).hexdigest() for u in previous['images']] == [hashlib.sha256(files[i].read_bytes()).hexdigest() for i in order]
        if product.get('badge'): previous['badge'] = product['badge']
    else:
        products[slug] = product
    manifest.append(dict(sourceId=row['id'], title=row['Title'], sourceCategories=labels,
                         slug=slug, category=category, selectedImageNumbers=order,
                         availableImageCount=len(files), mergedDuplicate=duplicate))
assert len(rows) == 244 and len(products) == 243
out = ROOT / 'data/imports'
(out/'all-products.json').write_text(json.dumps(list(products.values()), ensure_ascii=False, indent=2)+'\n')
report = dict(sourceRows=len(rows), uniqueProducts=len(products),
              newArrivals=sum(p.get('badge') == 'Yeni Gelenler' for p in products.values()),
              categoryCounts=dict(Counter(p['category'] for p in products.values())), rows=manifest)
(out/'import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='rows'},ensure_ascii=False,indent=2))

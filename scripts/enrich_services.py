import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = "/Users/miguelangelmatarranz/Desktop/mmatarranz_projects/EnriqueDelBarrio"
DATA_DIR = os.path.join(BASE_DIR, "src", "data")
IMG_DIR = os.path.join(BASE_DIR, "public", "images", "services")
os.makedirs(IMG_DIR, exist_ok=True)

with open(os.path.join(DATA_DIR, "pages.json")) as f:
    pages = json.load(f)
with open(os.path.join(DATA_DIR, "media-index.json")) as f:
    media = json.load(f)
with open(os.path.join(DATA_DIR, "galleries.json")) as f:
    galleries = json.load(f)
with open(os.path.join(DATA_DIR, "portfolio.json")) as f:
    portfolio = json.load(f)

media_by_id = {m["id"]: m.get("source_url") or m.get("url") for m in media if isinstance(m, dict) and "id" in m}

def strip_wp(html_str):
    if not html_str:
        return ""
    text = re.sub(r'\[/?[^\]]+\]', '\n', html_str)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</p>|</div>|</h[1-6]>|</li>', '\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    lines = [re.sub(r'\s+', ' ', l).strip() for l in text.splitlines()]
    lines = [l for l in lines if l and l not in ("VER MÁS", "Load more")]
    return "\n\n".join(lines)

downloads = []
def queue_img(url, prefix):
    if not url or not url.startswith("http"):
        return None
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".avif"]:
        ext = ".jpg"
    fname = re.sub(r'[^a-zA-Z0-9_-]', '-', prefix)[:60] + ext
    abs_p = os.path.join(IMG_DIR, fname)
    downloads.append((url, abs_p))
    return f"/images/services/{fname}"

# Extract full text and galleries for the 6 services + quien-soy + financiacion + aviso-legal
service_meta = {
    "imprenta": {
        "title": "Imprenta",
        "subtitle": "Papelería corporativa, libros, catálogos, folletos, hostelería y sellos en Segovia",
        "icon": "🖨️"
    },
    "maquetacion-y-diseno-grafico": {
        "title": "Maquetación y Diseño Gráfico",
        "subtitle": "Identidad visual, cartelería, publicaciones digitales y artes finales listos para imprenta",
        "icon": "📐"
    },
    "produccion-editorial": {
        "title": "Producción Editorial",
        "subtitle": "Acompañamiento integral desde el manuscrito hasta el libro impreso en tus manos",
        "icon": "📖"
    },
    "gran-formato": {
        "title": "Gran Formato, Expositores y Vinilos",
        "subtitle": "Rollups, lonas, soportes rígidos, escaparates y señalética para eventos y negocios",
        "icon": "🖼️"
    },
    "fotografia": {
        "title": "Fotografía Profesional y Dron",
        "subtitle": "Bodas y eventos, fotografía industrial, gastronómica, paisajes, viajes y tomas aéreas",
        "icon": "📷"
    },
    "video-profesional": {
        "title": "Vídeo Profesional y Aéreo",
        "subtitle": "Vídeos institucionales, eventos multicámara (3-4 cámaras) y grabación con dron",
        "icon": "🎬"
    }
}

# Collect portfolio & gallery images by slug/keywords as rich fallback
gal_urls = []
for g in galleries:
    fid = g.get("featured_media")
    if fid and fid in media_by_id:
        gal_urls.append((g.get("slug", str(g.get("id"))), media_by_id[fid]))

port_urls = []
for p in portfolio:
    fid = p.get("featured_media")
    if fid and fid in media_by_id:
        port_urls.append((p.get("slug", str(p.get("id"))), media_by_id[fid]))

enriched_services = []
extra_pages = {}

for p in pages:
    if not isinstance(p, dict):
        continue
    slug = p.get("slug", "")
    raw = p.get("content", "")
    if isinstance(raw, dict):
        raw = raw.get("rendered", "")

    if slug in ("quien-soy", "financiacion", "aviso-legal"):
        extra_pages[slug] = {
            "title": p.get("title", slug) if isinstance(p.get("title"), str) else p.get("title", {}).get("rendered", slug),
            "body": strip_wp(raw)
        }
        continue

    if slug not in service_meta:
        continue

    # Find ALL image URLs or attachment IDs in raw WPBakery content
    urls = []
    # Direct URLs in content
    for u in re.findall(r'https://enriquedelbarrio\.es/wp-content/uploads/[^\s"\'\)\]]+\.(?:jpg|jpeg|png|webp)', raw, re.I):
        if u not in urls:
            urls.append(u)
    # IDs in shortcodes: include="1,2", ids="1,2", images="1,2", image="1"
    for m in re.findall(r'(?:images?|ids|include)="([0-9,\s]+)"', raw):
        for tok in m.split(","):
            tok = tok.strip()
            if tok.isdigit() and int(tok) in media_by_id:
                u = media_by_id[int(tok)]
                if u not in urls:
                    urls.append(u)

    # Supplement with portfolio/galleries if WPBakery used category queries
    if slug == "imprenta" and len(urls) < 6:
        for _, u in port_urls[:12]:
            if u not in urls:
                urls.append(u)
    elif slug in ("produccion-editorial", "fotografia", "maquetacion-y-diseno-grafico", "gran-formato") and len(urls) < 6:
        # Take relevant slice from galleries
        offset = {"produccion-editorial": 0, "fotografia": 12, "maquetacion-y-diseno-grafico": 24, "gran-formato": 30}.get(slug, 0)
        for _, u in gal_urls[offset:offset+10]:
            if u not in urls:
                urls.append(u)

    # Download up to 12 curated photos per service locally
    local_gallery = []
    for idx, u in enumerate(urls[:12]):
        lp = queue_img(u, f"{slug}-{idx+1}")
        if lp:
            local_gallery.append(lp)

    body = strip_wp(raw)
    enriched_services.append({
        "slug": slug,
        "title": service_meta[slug]["title"],
        "subtitle": service_meta[slug]["subtitle"],
        "icon": service_meta[slug]["icon"],
        "summary": body[:280].replace("\n", " "),
        "body": body,
        "gallery": local_gallery
    })

# Order consistently
order = list(service_meta.keys())
enriched_services.sort(key=lambda x: order.index(x["slug"]) if x["slug"] in order else 99)

with open(os.path.join(DATA_DIR, "services.json"), "w", encoding="utf-8") as f:
    json.dump(enriched_services, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "extra-pages.json"), "w", encoding="utf-8") as f:
    json.dump(extra_pages, f, indent=2, ensure_ascii=False)

def fetch_one(item):
    url, abs_p = item
    if os.path.exists(abs_p) and os.path.getsize(abs_p) > 500:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        with open(abs_p, "wb") as out:
            out.write(data)
        return True
    except Exception:
        return False

unique_dl = list({ap: (u, ap) for u, ap in downloads}.values())
print(f"Downloading {len(unique_dl)} service gallery images...")
with ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(fetch_one, unique_dl))
print(f"Downloaded {sum(res)}/{len(unique_dl)} service images.")
for s in enriched_services:
    print(f"  {s['slug']}: {len(s['gallery'])} photos")

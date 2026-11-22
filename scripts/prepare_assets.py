import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = "/Users/miguelangelmatarranz/Desktop/mmatarranz_projects/EnriqueDelBarrio"
DATA_DIR = os.path.join(BASE_DIR, "src", "data")
IMG_DIR = os.path.join(BASE_DIR, "public", "images")
os.makedirs(os.path.join(IMG_DIR, "products"), exist_ok=True)
os.makedirs(os.path.join(IMG_DIR, "brand"), exist_ok=True)
os.makedirs(os.path.join(IMG_DIR, "services"), exist_ok=True)
os.makedirs(os.path.join(IMG_DIR, "posts"), exist_ok=True)

with open(os.path.join(DATA_DIR, "products.json")) as f:
    products = json.load(f)
with open(os.path.join(DATA_DIR, "pages.json")) as f:
    pages = json.load(f)
with open(os.path.join(DATA_DIR, "posts.json")) as f:
    posts = json.load(f)
with open(os.path.join(DATA_DIR, "media-index.json")) as f:
    media = json.load(f)

media_by_id = {m["id"]: m.get("source_url") or m.get("url") for m in media if isinstance(m, dict) and "id" in m}

def strip_html(html_str):
    if not html_str:
        return ""
    text = re.sub(r'\[/?vc_[^\]]*\]', ' ', html_str)
    text = re.sub(r'\[/?dt_[^\]]*\]', ' ', text)
    text = re.sub(r'\[/?ultimate_[^\]]*\]', ' ', text)
    text = re.sub(r'\[/?rev_slider[^\]]*\]', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

downloads = []

def queue_download(url, subdir, prefix):
    if not url or not url.startswith("http"):
        return None
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]:
        ext = ".jpg"
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '-', prefix).strip('-')[:60] + ext
    rel_path = f"/images/{subdir}/{safe_name}"
    abs_path = os.path.join(IMG_DIR, subdir, safe_name)
    downloads.append((url, abs_path))
    return rel_path

# 1. Clean Products & queue cover images
clean_products = []
for p in products:
    slug = p.get("slug", f"prod-{p['id']}")
    if slug == "sin-titulo":
        slug = "segovia-callada-trilogia"
    img_url = p["images"][0]["src"] if p.get("images") else None
    local_img = queue_download(img_url, "products", slug) if img_url else None
    price = float(p.get("price") or p.get("regular_price") or 0)
    clean_products.append({
        "id": p["id"],
        "name": p.get("name", "").strip(),
        "slug": slug,
        "price": price,
        "stock_status": p.get("stock_status", "instock"),
        "category": p["categories"][0]["name"] if p.get("categories") else "Libros",
        "short_description": strip_html(p.get("short_description", "")),
        "description": strip_html(p.get("description", "")),
        "image": local_img or img_url or "",
        "remote_image": img_url or ""
    })

with open(os.path.join(DATA_DIR, "catalog.json"), "w", encoding="utf-8") as f:
    json.dump(clean_products, f, indent=2, ensure_ascii=False)

# 2. Brand images (logo, portrait, EU funding banner)
brand_urls = {
    "logo": "https://enriquedelbarrio.es/wp-content/uploads/2024/12/logo-enrique-del-barrio-web.jpg",
    "eu_logos": "https://enriquedelbarrio.es/wp-content/uploads/2024/08/logos-ayudas.jpg",
    "portrait": "https://enriquedelbarrio.es/wp-content/uploads/2021/05/enrique-del-barrio-scaled-e1645694919432.jpg",
}
brand_local = {}
for k, u in brand_urls.items():
    brand_local[k] = queue_download(u, "brand", k)

# 3. Clean Posts (Prensa & Últimos trabajos)
clean_posts = []
for post in posts:
    if not isinstance(post, dict):
        continue
    title = post.get("title", "")
    if isinstance(title, dict):
        title = title.get("rendered", "")
    slug = post.get("slug", f"post-{post.get('id')}")
    fid = post.get("featured_media")
    img_url = media_by_id.get(fid)
    local_img = queue_download(img_url, "posts", slug) if img_url else None
    excerpt = post.get("excerpt", "")
    if isinstance(excerpt, dict):
        excerpt = excerpt.get("rendered", "")
    content = post.get("content", "")
    if isinstance(content, dict):
        content = content.get("rendered", "")
    clean_posts.append({
        "id": post.get("id"),
        "title": strip_html(title),
        "slug": slug,
        "date": (post.get("date") or "")[:10],
        "excerpt": strip_html(excerpt)[:220],
        "image": local_img or "",
    })

with open(os.path.join(DATA_DIR, "news.json"), "w", encoding="utf-8") as f:
    json.dump(clean_posts, f, indent=2, ensure_ascii=False)

# 4. Extract sample gallery photos per service from media-index or pages
# Also extract YouTube video IDs from /video-profesional/
videos = []
service_slugs = {
    "imprenta": "Imprenta",
    "maquetacion-y-diseno-grafico": "Maquetación y Diseño Gráfico",
    "produccion-editorial": "Producción Editorial",
    "gran-formato": "Gran Formato, Expositores y Vinilos",
    "fotografia": "Fotografía Profesional",
    "video-profesional": "Vídeo Profesional"
}

services_data = []
for p in pages:
    if not isinstance(p, dict):
        continue
    slug = p.get("slug", "")
    content = p.get("content", "")
    if isinstance(content, dict):
        content = content.get("rendered", "")
    if slug == "video-profesional":
        yt_ids = list(dict.fromkeys(re.findall(r'(?:youtube\.com/embed/|youtu\.be/|youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})', content)))
        videos = yt_ids
    if slug in service_slugs:
        # Find image IDs referenced in WPBakery shortcodes (images="123,456" or image="123")
        img_ids = []
        for match in re.findall(r'images?="([0-9,]+)"', content):
            for mid in match.split(","):
                if mid.isdigit() and int(mid) in media_by_id:
                    img_ids.append(int(mid))
        # Deduplicate and take up to 8 representative photos per service for local download
        img_ids = list(dict.fromkeys(img_ids))[:8]
        local_gallery = []
        for idx, mid in enumerate(img_ids):
            u = media_by_id[mid]
            lp = queue_download(u, "services", f"{slug}-{idx+1}")
            if lp:
                local_gallery.append(lp)
        services_data.append({
            "slug": slug,
            "title": service_slugs[slug],
            "summary": strip_html(content)[:320],
            "gallery": local_gallery
        })

with open(os.path.join(DATA_DIR, "services.json"), "w", encoding="utf-8") as f:
    json.dump(services_data, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "videos.json"), "w", encoding="utf-8") as f:
    json.dump(videos, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "site-config.json"), "w", encoding="utf-8") as f:
    json.dump({
        "brand": "Enrique del Barrio",
        "fullName": "Juan Enrique del Barrio Arribas",
        "tagline": "Fotografía · Producción Editorial · Imprenta · Vídeo Profesional en Segovia",
        "email": "info@enriquedelbarrio.es",
        "phone": "616 55 17 82",
        "whatsapp": "34616551782",
        "location": "Segovia, España",
        "shippingCost": 2.94,
        "shippingLabel": "Envío Correos Estándar (72h)",
        "freeShippingFrom": 50.0,
        "featuredBookSlug": "el-mester-de-nuestra-vida",
        "images": brand_local,
        "social": {
            "facebook": "https://www.facebook.com/enriquedelbarriofotografia",
            "instagram": "https://www.instagram.com/enriquedelbarrio/",
            "linkedin": "https://www.linkedin.com/in/enrique-del-barrio/",
            "shutterstock": "https://www.shutterstock.com/g/enriquedelbarrio",
            "adobestock": "https://stock.adobe.com/es/contributor/206568591/enrique-del-barrio"
        }
    }, f, indent=2, ensure_ascii=False)

def fetch_one(item):
    url, abs_path = item
    if os.path.exists(abs_path) and os.path.getsize(abs_path) > 500:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        with open(abs_path, "wb") as out:
            out.write(data)
        return True
    except Exception as e:
        print(f"Failed {url}: {e}")
        return False

# Deduplicate download queue
unique_downloads = list({abs_p: (u, abs_p) for u, abs_p in downloads}.values())
print(f"Downloading {len(unique_downloads)} essential images...")
with ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(fetch_one, unique_downloads))
print(f"Downloaded {sum(res)}/{len(unique_downloads)} images successfully.")

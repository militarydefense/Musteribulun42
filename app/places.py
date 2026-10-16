"""Google Places API (New) ile ülke / şehir genelinde "gun shop" taraması.

Ülke taramasında ülke sınır kutusu ızgaralara bölünür; bir ızgara 60 sonuçla
dolarsa (API limiti) otomatik olarak 4 parçaya bölünerek daha derin aranır.
"""
import time
import httpx

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

FIELD_MASK = ",".join([
    "places.id", "places.displayName", "places.formattedAddress", "places.addressComponents",
    "places.nationalPhoneNumber", "places.internationalPhoneNumber", "places.websiteUri",
    "places.location", "places.rating", "places.userRatingCount", "places.googleMapsUri",
    "places.types", "places.primaryTypeDisplayName", "places.businessStatus", "nextPageToken",
])


class PlacesError(Exception):
    pass


class PlacesClient:
    def __init__(self, api_key: str, language="en", on_call=None):
        if not api_key:
            raise PlacesError("Google Maps API anahtarı tanımlı değil (Ayarlar sekmesi).")
        self.key = api_key
        self.language = language
        self._cb = on_call or (lambda: None)
        self.calls = 0
        self.http = httpx.Client(timeout=30)

    def on_call(self):
        self.calls += 1
        self._cb()

    def country_viewport(self, country_code: str):
        r = self.http.get(GEOCODE_URL, params={"components": f"country:{country_code}", "key": self.key})
        self.on_call()
        data = r.json()
        if data.get("status") != "OK":
            raise PlacesError(f"Geocoding hatası: {data.get('status')} {data.get('error_message', '')}")
        vp = data["results"][0]["geometry"]["viewport"]
        sw, ne = vp["southwest"], vp["northeast"]
        boxes = []
        if sw["lng"] > ne["lng"]:  # 180. meridyeni aşan ülkeler (Rusya, ABD, Fiji...)
            boxes.append((sw["lat"], sw["lng"], ne["lat"], 180.0))
            boxes.append((sw["lat"], -180.0, ne["lat"], ne["lng"]))
        else:
            boxes.append((sw["lat"], sw["lng"], ne["lat"], ne["lng"]))
        return boxes

    def text_search(self, query: str, rect=None, region=None, max_pages=3):
        """Bir sorgu için tüm sayfaları (en fazla 60 sonuç) döndürür."""
        results, token = [], None
        for _ in range(max_pages):
            body = {"textQuery": query, "pageSize": 20, "languageCode": self.language}
            if region:
                body["regionCode"] = region
            if rect:
                lo_lat, lo_lng, hi_lat, hi_lng = rect
                body["locationRestriction"] = {"rectangle": {
                    "low": {"latitude": lo_lat, "longitude": lo_lng},
                    "high": {"latitude": hi_lat, "longitude": hi_lng}}}
            if token:
                body["pageToken"] = token
            for attempt in range(4):
                r = self.http.post(TEXT_SEARCH_URL, json=body, headers={
                    "X-Goog-Api-Key": self.key, "X-Goog-FieldMask": FIELD_MASK})
                self.on_call()
                if r.status_code == 429 or r.status_code >= 500:
                    time.sleep(2 ** attempt)
                    continue
                break
            if r.status_code != 200:
                try:
                    msg = r.json().get("error", {}).get("message", r.text)
                except ValueError:
                    msg = r.text
                raise PlacesError(f"Places API {r.status_code}: {msg[:300]}")
            data = r.json()
            results += data.get("places", [])
            token = data.get("nextPageToken")
            if not token:
                break
        return results


def split_rect(rect):
    lo_lat, lo_lng, hi_lat, hi_lng = rect
    mid_lat, mid_lng = (lo_lat + hi_lat) / 2, (lo_lng + hi_lng) / 2
    return [(lo_lat, lo_lng, mid_lat, mid_lng), (lo_lat, mid_lng, mid_lat, hi_lng),
            (mid_lat, lo_lng, hi_lat, mid_lng), (mid_lat, mid_lng, hi_lat, hi_lng)]


def place_to_lead(p: dict, search_term: str, fallback_country="") -> dict:
    comps = p.get("addressComponents", [])

    def comp(kind, short=False):
        for c in comps:
            if kind in c.get("types", []):
                return c.get("shortText" if short else "longText")
        return ""

    loc = p.get("location", {})
    return {
        "source": "google_maps",
        "external_id": "gm:" + p["id"],
        "name": (p.get("displayName") or {}).get("text", ""),
        "country_code": comp("country", True) or fallback_country,
        "country": comp("country"),
        "city": comp("locality") or comp("postal_town") or comp("administrative_area_level_2")
                or comp("administrative_area_level_1"),
        "address": p.get("formattedAddress", ""),
        "phone": p.get("nationalPhoneNumber", ""),
        "intl_phone": p.get("internationalPhoneNumber", ""),
        "website": p.get("websiteUri", ""),
        "rating": p.get("rating"),
        "reviews": p.get("userRatingCount"),
        "maps_url": p.get("googleMapsUri", ""),
        "lat": loc.get("latitude"),
        "lng": loc.get("longitude"),
        "category": (p.get("primaryTypeDisplayName") or {}).get("text", ""),
        "business_status": p.get("businessStatus", ""),
        "search_term": search_term,
    }


RELEVANT_HINTS = ("gun", "arm", "waffe", "fegyver", "оруж", "охот", "hunt", "shoot", "rifle", "shotgun",
                  "jagd", "jakt", "jagt", "caza", "caça", "chasse", "caccia", "silah", "av ", "tactical",
                  "outdoor", "firearm", "ammo", "pistol", "sport", "metsä", "ase", "zbr", "broń", "myśl")


def looks_relevant(p: dict) -> bool:
    """Alakasız sonuçları (ör. 'Gun' adlı restoran) ayıklamak için kaba filtre."""
    types = " ".join(p.get("types", []))
    name = ((p.get("displayName") or {}).get("text", "") + " " +
            (p.get("primaryTypeDisplayName") or {}).get("text", "")).lower()
    if any(t in types for t in ("restaurant", "bar", "lodging", "school", "hospital")) and \
            not any(h in name for h in RELEVANT_HINTS):
        return False
    return True


def scan(client: PlacesClient, terms, country_code=None, cities=None, max_depth=4, max_calls=2000,
         on_batch=None, should_stop=lambda: False, log=print, relevance_filter=True):
    """Tarama yapar; bulunan her parti için on_batch(list[lead]) çağırır."""
    seen = set()

    def emit(places, term):
        batch = []
        for p in places:
            if p["id"] in seen:
                continue
            seen.add(p["id"])
            if relevance_filter and not looks_relevant(p):
                continue
            batch.append(place_to_lead(p, term, country_code or ""))
        if batch and on_batch:
            on_batch(batch)

    def search(query, rect=None, term=None):
        if client.calls >= max_calls:
            raise PlacesError("Güvenlik limiti: maksimum API çağrısı sayısına ulaşıldı.")
        res = client.text_search(query, rect=rect, region=country_code)
        emit(res, term or query)
        return res

    if cities:
        total = len(cities) * len(terms)
        done = 0
        for city in cities:
            for term in terms:
                if should_stop():
                    return
                q = f"{term} in {city}"
                res = search(q, term=term)
                log(f"'{q}': {len(res)} sonuç")
                done += 1
                yield done / total
        return

    if not country_code:
        raise PlacesError("Ülke ya da şehir listesi seçilmelidir.")
    boxes = client.country_viewport(country_code)
    for ti, term in enumerate(terms):
        stack = [(b, 0) for b in boxes]
        processed = 0
        while stack:
            if should_stop():
                return
            rect, depth = stack.pop()
            res = search(term, rect=rect, term=term)
            processed += 1
            if len(res) >= 60 and depth < max_depth:
                log(f"'{term}' bölge dolu ({len(res)}), 4 alt bölgeye ayrılıyor (derinlik {depth + 1})")
                stack += [(r, depth + 1) for r in split_rect(rect)]
            # İlerleme: terim bazında + kalan kuyruk tahmini
            frac = processed / (processed + len(stack))
            yield (ti + frac) / len(terms)
        log(f"'{term}' terimi tamamlandı.")

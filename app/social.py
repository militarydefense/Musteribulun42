"""Sosyal medya araştırması.

- YouTube: resmi YouTube Data API v3 (kanal arama + kanal detayları)
- Facebook / Instagram / diğerleri: arama motoru API'si (Serper.dev veya SerpApi)
  üzerinden 'site:' sorgularıyla herkese açık işletme sayfalarının bulunması
- Instagram: (isteğe bağlı) Meta Graph API "Business Discovery" ile herkese açık
  işletme hesabı bilgileri (biyografi, web sitesi, takipçi)

Not: Platformların oturum gerektiren içerikleri kazınmaz; yalnızca resmi API'ler
ve herkese açık arama sonuçları kullanılır (kullanım koşullarına uyum için).
"""
import re
import time

import httpx

from .crawler import EMAIL_RE, PHONE_RE, clean_email

YT_SEARCH = "https://www.googleapis.com/youtube/v3/search"
YT_CHANNELS = "https://www.googleapis.com/youtube/v3/channels"


class SocialError(Exception):
    pass


def _emails_in(text: str):
    out = []
    for m in EMAIL_RE.findall(text or ""):
        e = clean_email(m)
        if e and e not in out:
            out.append(e)
    return out


def _phones_in(text: str):
    out = []
    for m in PHONE_RE.findall(text or ""):
        n = re.sub(r"[^\d+]", "", m)
        if n not in out:
            out.append(n)
    return out[:5]


# ------------------------------------------------------------------ YouTube
def youtube_search(api_key, query, region="", language="", max_results=50, on_call=lambda: None):
    if not api_key:
        raise SocialError("YouTube Data API anahtarı tanımlı değil (Ayarlar).")
    http = httpx.Client(timeout=30)
    ids, token = [], None
    while len(ids) < max_results:
        params = {"part": "snippet", "type": "channel", "q": query, "maxResults": 50, "key": api_key}
        if region:
            params["regionCode"] = region
        if language:
            params["relevanceLanguage"] = language
        if token:
            params["pageToken"] = token
        r = http.get(YT_SEARCH, params=params)
        on_call()
        if r.status_code != 200:
            raise SocialError(f"YouTube API {r.status_code}: {r.text[:300]}")
        data = r.json()
        ids += [it["id"]["channelId"] for it in data.get("items", []) if it.get("id", {}).get("channelId")]
        token = data.get("nextPageToken")
        if not token:
            break
    ids = ids[:max_results]
    leads = []
    for i in range(0, len(ids), 50):
        r = http.get(YT_CHANNELS, params={"part": "snippet,statistics,brandingSettings",
                                          "id": ",".join(ids[i:i + 50]), "key": api_key})
        on_call()
        if r.status_code != 200:
            raise SocialError(f"YouTube API {r.status_code}: {r.text[:300]}")
        for ch in r.json().get("items", []):
            sn, st = ch.get("snippet", {}), ch.get("statistics", {})
            desc = sn.get("description", "")
            handle = sn.get("customUrl", "")
            url = f"https://www.youtube.com/{handle}" if handle else f"https://www.youtube.com/channel/{ch['id']}"
            web = ""
            m = re.search(r"https?://(?!(?:www\.)?(?:youtube|youtu\.be|instagram|facebook|twitter|x\.com|tiktok))"
                          r"[^\s]+", desc)
            if m:
                web = m.group(0).rstrip(").,")
            socials = {"youtube": url}
            for net, pat in (("instagram", r"https?://(?:www\.)?instagram\.com/[\w.]+"),
                             ("facebook", r"https?://(?:www\.)?facebook\.com/[^\s]+")):
                mm = re.search(pat, desc)
                if mm:
                    socials[net] = mm.group(0)
            leads.append({
                "source": "youtube", "external_id": "yt:" + ch["id"], "name": sn.get("title", ""),
                "country_code": sn.get("country", "") or region, "description": desc[:1500],
                "emails": _emails_in(desc), "phones_extra": _phones_in(desc), "website": web,
                "socials": socials, "followers": int(st.get("subscriberCount", 0) or 0),
                "category": "YouTube kanalı", "search_term": query,
            })
    return leads


# ------------------------------------------------------------------ Arama motoru API
SITE_FILTERS = {
    "facebook": "site:facebook.com",
    "instagram": "site:instagram.com",
    "youtube": "site:youtube.com",
    "linkedin": "site:linkedin.com/company",
    "tiktok": "site:tiktok.com",
    "web": "",
}

PROFILE_RE = {
    "facebook": re.compile(r"https?://(?:[a-z\-]+\.)?facebook\.com/(?!groups/|events/|watch|photo|story|"
                           r"posts/|reel|hashtag|marketplace)([^/?#\s]+)", re.I),
    "instagram": re.compile(r"https?://(?:www\.)?instagram\.com/(?!p/|reel/|explore/|stories/)([A-Za-z0-9_.]+)", re.I),
    "youtube": re.compile(r"https?://(?:www\.)?youtube\.com/(@[\w.\-]+|channel/[\w\-]+|c/[\w\-]+)", re.I),
    "linkedin": re.compile(r"https?://(?:[a-z]+\.)?linkedin\.com/company/([^/?#\s]+)", re.I),
    "tiktok": re.compile(r"https?://(?:www\.)?tiktok\.com/(@[\w.\-]+)", re.I),
}


def web_search(provider, api_key, query, country="", language="", num=20, page=1):
    if not api_key:
        raise SocialError("Arama motoru API anahtarı tanımlı değil (Ayarlar → Serper/SerpApi).")
    http = httpx.Client(timeout=30)
    if provider == "serpapi":
        params = {"engine": "google", "q": query, "num": num, "start": (page - 1) * num, "api_key": api_key}
        if country:
            params["gl"] = country.lower()
        if language:
            params["hl"] = language
        r = http.get("https://serpapi.com/search.json", params=params)
        if r.status_code != 200:
            raise SocialError(f"SerpApi {r.status_code}: {r.text[:300]}")
        items = r.json().get("organic_results", [])
        return [{"title": i.get("title", ""), "link": i.get("link", ""), "snippet": i.get("snippet", "")}
                for i in items]
    body = {"q": query, "num": num, "page": page}
    if country:
        body["gl"] = country.lower()
    if language:
        body["hl"] = language
    r = http.post("https://google.serper.dev/search", json=body, headers={"X-API-KEY": api_key})
    if r.status_code != 200:
        raise SocialError(f"Serper {r.status_code}: {r.text[:300]}")
    return [{"title": i.get("title", ""), "link": i.get("link", ""), "snippet": i.get("snippet", "")}
            for i in r.json().get("organic", [])]


def social_search(provider, api_key, network, term, country_code="", country_name="", language="",
                  pages=2, on_call=lambda: None):
    """Belirli bir ağda işletme profillerini arar, lead listesi döndürür."""
    site = SITE_FILTERS.get(network, "")
    q = f'{site} "{term}" {country_name}'.strip()
    leads, seen = [], set()
    for page in range(1, pages + 1):
        results = web_search(provider, api_key, q, country_code, language, num=20, page=page)
        on_call()
        if not results:
            break
        for it in results:
            link = it["link"]
            if network in PROFILE_RE:
                m = PROFILE_RE[network].search(link)
                if not m:
                    continue
                handle = m.group(1)
                profile_url = m.group(0).split("?")[0].rstrip("/")
                key = f"{network}:{handle.lower()}"
            else:
                profile_url, key = link, "web:" + link.lower().split("?")[0].rstrip("/")
            if key in seen:
                continue
            seen.add(key)
            text = f"{it['title']} {it['snippet']}"
            name = re.split(r"\s[|\-–•]\s|\(@|\s·\s", it["title"])[0].strip()
            lead = {
                "source": network, "external_id": key, "name": name or it["title"][:120],
                "country_code": country_code, "country": country_name,
                "description": it["snippet"][:1000], "emails": _emails_in(text),
                "phones_extra": _phones_in(text), "socials": {network: profile_url} if network != "web" else {},
                "category": f"{network.capitalize()} profili" if network != "web" else "Web sonucu",
                "search_term": term,
            }
            if network == "web":
                lead["website"] = link
            mm = re.search(r"([\d.,]+[KkMm]?)\s*(?:followers|takipçi|seguidores|abonnés|Follower)", text)
            if mm:
                lead["followers"] = _parse_count(mm.group(1))
            leads.append(lead)
        time.sleep(0.3)
    return leads


def _parse_count(s: str) -> int:
    s = s.replace(",", ".").strip()
    mult = 1
    if s[-1:].lower() == "k":
        mult, s = 1000, s[:-1]
    elif s[-1:].lower() == "m":
        mult, s = 1_000_000, s[:-1]
    try:
        if mult == 1:
            return int(s.replace(".", ""))
        return int(float(s) * mult)
    except ValueError:
        return 0


# ------------------------------------------------------------------ Instagram Business Discovery
def instagram_business_discovery(access_token, ig_user_id, username):
    """Herkese açık bir Instagram işletme/üretici hesabının bilgilerini döndürür."""
    if not (access_token and ig_user_id):
        return None
    fields = (f"business_discovery.username({username})"
              "{username,name,biography,website,followers_count,media_count}")
    r = httpx.get(f"https://graph.facebook.com/v21.0/{ig_user_id}",
                  params={"fields": fields, "access_token": access_token}, timeout=30)
    if r.status_code != 200:
        return None
    bd = r.json().get("business_discovery") or {}
    bio = bd.get("biography", "")
    return {"name": bd.get("name"), "website": bd.get("website", ""), "followers": bd.get("followers_count"),
            "description": bio, "emails": _emails_in(bio), "phones_extra": _phones_in(bio)}

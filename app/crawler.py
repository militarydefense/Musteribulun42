"""Firma web sitelerinden e-posta, telefon ve sosyal medya hesaplarını çıkarır.

robots.txt kurallarına uyar, site başına sınırlı sayıda sayfa (ana sayfa +
iletişim / künye / hakkımızda) ziyaret eder.
"""
import html
import re
from urllib.parse import urljoin, urlparse
from urllib import robotparser

import httpx
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; MusteriBulucu/1.0; +B2B iletisim bilgisi toplama)"

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9.\-]{1,190}\.[A-Za-z]{2,24}")
OBFUSCATED_RE = re.compile(
    r"([A-Za-z0-9._%+\-]{1,64})\s*(?:\[at\]|\(at\)|\{at\}| at |\[@\]|\(@\)| \[ät\] )\s*"
    r"([A-Za-z0-9\-]{1,63}(?:\s*(?:\.|\[dot\]|\(dot\)| dot )\s*[A-Za-z0-9\-]{1,63})+)", re.I)
PHONE_RE = re.compile(r"(?:\+|00)\d[\d\s().\-/]{7,18}\d")

CONTACT_WORDS = ("contact", "kontakt", "iletisim", "iletişim", "contacto", "contato", "contatti", "impressum",
                 "imprint", "about", "hakkimizda", "hakkımızda", "nous-contacter", "contactez", "kontakty",
                 "контакт", "yhteystiedot", "om-oss", "chi-siamo", "quienes-somos", "legal", "mentions",
                 "store", "magaza", "location", "standort", "اتصل")

SOCIAL_PATTERNS = {
    "facebook": re.compile(r"https?://(?:[a-z]+\.)?(?:facebook|fb)\.com/(?!sharer|share|dialog|plugins|tr\?|"
                           r"login|policy|privacy|help)[^\s\"'<>?#]+", re.I),
    "instagram": re.compile(r"https?://(?:www\.)?instagram\.com/(?!p/|explore|accounts|reel/)[A-Za-z0-9_.]+", re.I),
    "youtube": re.compile(r"https?://(?:www\.)?youtube\.com/(?:@[\w.\-]+|channel/[\w\-]+|c/[\w\-]+|user/[\w\-]+)", re.I),
    "twitter": re.compile(r"https?://(?:www\.)?(?:twitter|x)\.com/(?!share|intent|home)[A-Za-z0-9_]+", re.I),
    "linkedin": re.compile(r"https?://(?:[a-z]+\.)?linkedin\.com/(?:company|in)/[^\s\"'<>?#]+", re.I),
    "tiktok": re.compile(r"https?://(?:www\.)?tiktok\.com/@[\w.\-]+", re.I),
    "whatsapp": re.compile(r"https?://(?:wa\.me|api\.whatsapp\.com/send\?phone=)[\d+]+", re.I),
    "telegram": re.compile(r"https?://t\.me/[\w]+", re.I),
    "vk": re.compile(r"https?://(?:www\.)?vk\.com/[\w.]+", re.I),
}

JUNK_EMAIL = ("example.", "domain.", "sentry", "wixpress", "@2x", ".png", ".jpg", ".jpeg", ".gif", ".webp",
              ".svg", "yourname", "email.com", "@test", "noreply", "no-reply", "u003e", "godaddy",
              "schema.org", "jquery", "bootstrap", "@sentry")


def decode_cfemail(enc: str) -> str:
    try:
        key = int(enc[:2], 16)
        return "".join(chr(int(enc[i:i + 2], 16) ^ key) for i in range(2, len(enc), 2))
    except ValueError:
        return ""


def clean_email(e: str) -> str | None:
    e = e.strip().strip(".,;:()[]<>\"'").lower()
    if e.startswith("mailto:"):
        e = e[7:]
    e = e.split("?")[0]
    if not EMAIL_RE.fullmatch(e):
        return None
    if any(j in e for j in JUNK_EMAIL):
        return None
    return e


def extract(html_text: str, base_url: str):
    emails, phones, socials, links = set(), set(), {}, []
    soup = BeautifulSoup(html_text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        # JSON-LD içinde e-posta / telefon olabilir; sadece onu koru
        if tag.get("type") != "application/ld+json":
            tag.decompose()
    text = html.unescape(soup.get_text(" "))

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.lower().startswith("mailto:"):
            e = clean_email(href)
            if e:
                emails.add(e)
        elif href.lower().startswith("tel:"):
            num = re.sub(r"[^\d+]", "", href[4:])
            if len(num) >= 8:
                phones.add(num)
        else:
            full = urljoin(base_url, href)
            label = (a.get_text(" ") or "").lower()
            links.append((full, label))
    for el in soup.select("[data-cfemail]"):
        e = clean_email(decode_cfemail(el["data-cfemail"]))
        if e:
            emails.add(e)

    for m in EMAIL_RE.findall(text):
        e = clean_email(m)
        if e:
            emails.add(e)
    for user, dom in OBFUSCATED_RE.findall(text):
        dom = re.sub(r"\s*(?:\[dot\]|\(dot\)| dot )\s*", ".", dom, flags=re.I).replace(" ", "")
        e = clean_email(f"{user}@{dom}")
        if e:
            emails.add(e)
    for m in PHONE_RE.findall(text):
        num = re.sub(r"[^\d+]", "", m)
        if 9 <= len(num.lstrip("+0")) <= 15:
            phones.add(num if num.startswith("+") else "+" + num.lstrip("0"))

    raw = html_text
    for name, pat in SOCIAL_PATTERNS.items():
        for m in pat.findall(raw):
            m = m.rstrip("/\\\"'")
            if name not in socials:
                socials[name] = m
    return emails, phones, socials, links


class SiteCrawler:
    def __init__(self, max_pages=6, timeout=15, respect_robots=True):
        self.max_pages = max_pages
        self.respect_robots = respect_robots
        self.http = httpx.Client(timeout=timeout, follow_redirects=True, headers={
            "User-Agent": UA, "Accept-Language": "en,tr;q=0.8,*;q=0.5"})

    def _robots(self, url):
        rp = robotparser.RobotFileParser()
        try:
            r = self.http.get(urljoin(url, "/robots.txt"))
            if r.status_code == 200:
                rp.parse(r.text.splitlines())
            else:
                rp.parse([])
        except httpx.HTTPError:
            rp.parse([])
        return rp

    def crawl(self, url: str):
        if not url.startswith("http"):
            url = "http://" + url
        host = urlparse(url).netloc.lower().removeprefix("www.")
        rp = self._robots(url) if self.respect_robots else None
        queue, visited = [url], set()
        emails, phones, socials = set(), set(), {}
        errors = []
        while queue and len(visited) < self.max_pages:
            u = queue.pop(0)
            if u in visited:
                continue
            visited.add(u)
            if rp and not rp.can_fetch(UA, u):
                continue
            try:
                r = self.http.get(u)
            except httpx.HTTPError as e:
                errors.append(f"{u}: {type(e).__name__}")
                continue
            if r.status_code >= 400 or "html" not in r.headers.get("content-type", "html"):
                continue
            e, p, s, links = extract(r.text, str(r.url))
            emails |= e
            phones |= p
            for k, v in s.items():
                socials.setdefault(k, v)
            if len(visited) == 1:
                # Ana sayfadan iletişim / künye sayfalarını sıraya al
                scored = []
                for link, label in links:
                    lp = urlparse(link)
                    if lp.netloc.lower().removeprefix("www.") != host:
                        continue
                    blob = (lp.path + " " + label).lower()
                    score = sum(w in blob for w in CONTACT_WORDS)
                    if score:
                        scored.append((score, link.split("#")[0]))
                for _, link in sorted(scored, reverse=True):
                    if link not in queue and link not in visited:
                        queue.append(link)
        # Sitenin kendi alan adındaki e-postaları başa al
        ordered = sorted(emails, key=lambda x: (host.split(".")[0] not in x, x))
        return {"emails": ordered[:15], "phones": sorted(phones)[:10], "socials": socials,
                "pages": len(visited), "errors": errors}

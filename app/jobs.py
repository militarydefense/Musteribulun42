"""Arka plan işleri: tarama, zenginleştirme, sosyal medya araştırması."""
import json
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed

from . import db
from .crawler import SiteCrawler
from .gtip import keywords_for
from .places import PlacesClient, scan
from .social import instagram_business_discovery, social_search, youtube_search

_executor = ThreadPoolExecutor(max_workers=3)
_cancelled: set[int] = set()

COUNTRY_NAMES = {}  # main.py tarafından doldurulur: kod -> İngilizce ad


def cancel(job_id: int):
    _cancelled.add(job_id)
    db.update_job(job_id, status="iptal")


def submit(kind: str, title: str, params: dict) -> int:
    job_id = db.create_job(kind, title, params)
    _executor.submit(_run, job_id, kind, params)
    return job_id


def _run(job_id, kind, params):
    db.update_job(job_id, status="calisiyor")
    state = {"found": 0, "calls": 0}

    def log(msg):
        db.append_job_log(job_id, msg)

    def tick():
        state["calls"] += 1
        if state["calls"] % 5 == 0:
            db.update_job(job_id, api_calls=state["calls"])

    def stop():
        return job_id in _cancelled

    def save(leads):
        for lead in leads:
            _, new = db.upsert_lead(lead)
            if new:
                state["found"] += 1
        db.update_job(job_id, found=state["found"], api_calls=state["calls"])

    try:
        fn = {"maps": _job_maps, "enrich": _job_enrich, "youtube": _job_youtube,
              "social": _job_social}[kind]
        fn(params, log=log, tick=tick, stop=stop, save=save, progress=lambda p: db.update_job(
            job_id, progress=round(min(p, 1.0), 4)))
        if stop():
            log("İş kullanıcı tarafından durduruldu.")
            db.update_job(job_id, status="iptal", finished_at=db.now(), api_calls=state["calls"])
        else:
            log(f"Tamamlandı. Yeni kayıt: {state['found']}, API çağrısı: {state['calls']}")
            db.update_job(job_id, status="tamamlandi", progress=1, finished_at=db.now(),
                          found=state["found"], api_calls=state["calls"])
    except Exception as e:  # noqa: BLE001
        log(f"HATA: {e}")
        log(traceback.format_exc()[-1500:])
        db.update_job(job_id, status="hata", finished_at=db.now(), api_calls=state["calls"])


# ------------------------------------------------------------------ Google Maps
def _job_maps(p, log, tick, stop, save, progress):
    key = db.get_setting("google_api_key")
    client = PlacesClient(key, language=p.get("language") or "en", on_call=tick)
    countries = p.get("countries") or []
    cities = [c.strip() for c in (p.get("cities") or "").splitlines() if c.strip()]
    custom_terms = [t.strip() for t in (p.get("terms") or "").split(",") if t.strip()]
    max_calls = int(p.get("max_calls") or db.get_setting("max_calls_per_job", "1500") or 1500)
    depth = int(p.get("depth") or 4)
    auto_enrich = p.get("auto_enrich", True)

    targets = countries or [""]
    for ci, cc in enumerate(targets):
        if stop():
            return
        terms = custom_terms or keywords_for(p.get("gtip", "9303"), cc, include_local=p.get("local_terms", True))
        terms = terms[: int(p.get("max_terms") or 4)] if not custom_terms else terms
        label = COUNTRY_NAMES.get(cc, cc) or "şehir listesi"
        log(f"▶ {label}: terimler = {', '.join(terms)}")
        city_list = [f"{c}, {COUNTRY_NAMES.get(cc, cc)}" if cc else c for c in cities] if cities else None
        try:
            for frac in scan(client, terms, country_code=cc or None, cities=city_list, max_depth=depth,
                             max_calls=max_calls, on_batch=save, should_stop=stop, log=log,
                             relevance_filter=p.get("filter", True)):
                progress((ci + frac) / len(targets) * (0.6 if auto_enrich else 1))
        except Exception as e:  # noqa: BLE001
            log(f"{label} taramasında hata: {e}")
            if "limit" in str(e).lower() or "API anahtarı" in str(e):
                break
    if auto_enrich and not stop():
        log("▶ Web sitelerinden e-posta ve sosyal medya bilgileri toplanıyor...")
        _job_enrich({"only_missing": True}, log, tick=lambda: None, stop=stop, save=save,
                    progress=lambda x: progress(0.6 + 0.4 * x))


# ------------------------------------------------------------------ Zenginleştirme
def _job_enrich(p, log, tick, stop, save, progress):
    leads = db.leads_to_enrich(limit=int(p.get("limit") or 5000), only_missing=p.get("only_missing", True),
                               ids=p.get("ids"))
    if not leads:
        log("Zenginleştirilecek (web sitesi olan) kayıt yok.")
        return
    log(f"{len(leads)} web sitesi taranacak.")
    crawler = SiteCrawler(max_pages=int(db.get_setting("crawl_pages", "6") or 6),
                          respect_robots=db.get_setting("respect_robots", "1") != "0")
    ig_token, ig_id = db.get_setting("meta_access_token"), db.get_setting("ig_user_id")
    done, found_emails = 0, 0
    workers = int(db.get_setting("crawl_workers", "8") or 8)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(crawler.crawl, l["website"]): l for l in leads}
        for fut in as_completed(futs):
            lead = futs[fut]
            if stop():
                ex.shutdown(cancel_futures=True)
                return
            try:
                res = fut.result()
            except Exception as e:  # noqa: BLE001
                log(f"{lead['website']}: {e}")
                res = {"emails": [], "phones": [], "socials": {}}
            emails = res["emails"]
            if ig_token and ig_id and res["socials"].get("instagram") and not emails:
                user = res["socials"]["instagram"].rstrip("/").split("/")[-1]
                info = instagram_business_discovery(ig_token, ig_id, user)
                if info:
                    emails = info["emails"]
            db.mark_enriched(lead["id"], emails, res["phones"], res["socials"])
            done += 1
            if emails:
                found_emails += 1
            if done % 10 == 0 or done == len(leads):
                log(f"{done}/{len(leads)} site tarandı, e-posta bulunan: {found_emails}")
            progress(done / len(leads))


# ------------------------------------------------------------------ YouTube
def _job_youtube(p, log, tick, stop, save, progress):
    key = db.get_setting("youtube_api_key") or db.get_setting("google_api_key")
    countries = p.get("countries") or [""]
    terms = [t.strip() for t in (p.get("terms") or "").split(",") if t.strip()] or \
        keywords_for(p.get("gtip", "9303"))[:3]
    total = len(countries) * len(terms)
    n = 0
    for cc in countries:
        for term in terms:
            if stop():
                return
            q = f"{term} {COUNTRY_NAMES.get(cc, '')}".strip()
            leads = youtube_search(key, q, region=cc, max_results=int(p.get("max_results") or 50), on_call=tick)
            for l in leads:
                l["country"] = COUNTRY_NAMES.get(l.get("country_code", ""), "")
            save(leads)
            log(f"YouTube '{q}' [{cc or 'tümü'}]: {len(leads)} kanal")
            n += 1
            progress(n / total)


# ------------------------------------------------------------------ Facebook / Instagram / Web
def _job_social(p, log, tick, stop, save, progress):
    provider = db.get_setting("search_provider", "serper")
    key = db.get_setting("search_api_key")
    networks = p.get("networks") or ["facebook", "instagram"]
    countries = p.get("countries") or [""]
    terms = [t.strip() for t in (p.get("terms") or "").split(",") if t.strip()] or \
        keywords_for(p.get("gtip", "9303"))[:2]
    pages = int(p.get("pages") or 2)
    ig_token, ig_id = db.get_setting("meta_access_token"), db.get_setting("ig_user_id")
    total = len(networks) * len(countries) * len(terms)
    n = 0
    for cc in countries:
        local = keywords_for("9303", cc)[:1] if p.get("local_terms", True) and cc else []
        for net in networks:
            for term in list(dict.fromkeys(terms + local)):
                if stop():
                    return
                leads = social_search(provider, key, net, term, cc, COUNTRY_NAMES.get(cc, ""), pages=pages,
                                      on_call=tick)
                if net == "instagram" and ig_token and ig_id:
                    for l in leads:
                        info = instagram_business_discovery(ig_token, ig_id, l["external_id"].split(":", 1)[1])
                        tick()
                        if info:
                            for k, v in info.items():
                                if v and (k not in l or not l[k]):
                                    l[k] = v
                save(leads)
                log(f"{net} / {term} / {COUNTRY_NAMES.get(cc, cc) or 'global'}: {len(leads)} profil")
                n += 1
                progress(min(n / total, 1))
    if p.get("enrich_websites") and not stop():
        _job_enrich({"only_missing": True}, log, tick, stop, save, lambda x: None)


def params_json(job):
    try:
        return json.loads(job.get("params") or "{}")
    except ValueError:
        return {}

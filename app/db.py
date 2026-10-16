"""SQLite veritabanı katmanı: potansiyel müşteriler, işler ve ayarlar."""
import json
import sqlite3
import threading
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "musteriler.db"
_lock = threading.RLock()

SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,              -- google_maps | youtube | facebook | instagram | web
    external_id TEXT UNIQUE,           -- place_id, kanal id, profil url ...
    name TEXT,
    country_code TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    phone TEXT,
    intl_phone TEXT,
    website TEXT,
    emails TEXT DEFAULT '[]',
    phones_extra TEXT DEFAULT '[]',
    socials TEXT DEFAULT '{}',
    rating REAL,
    reviews INTEGER,
    maps_url TEXT,
    lat REAL,
    lng REAL,
    category TEXT,
    business_status TEXT,
    followers INTEGER,
    description TEXT,
    search_term TEXT,
    status TEXT DEFAULT 'yeni',
    notes TEXT DEFAULT '',
    enriched_at TEXT,
    created_at TEXT,
    updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country_code);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT,
    title TEXT,
    params TEXT,
    status TEXT DEFAULT 'bekliyor',   -- bekliyor | calisiyor | tamamlandi | hata | iptal
    progress REAL DEFAULT 0,
    found INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    log TEXT DEFAULT '',
    created_at TEXT,
    finished_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

JSON_FIELDS = ("emails", "phones_extra", "socials")


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


_conn = None


def conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = connect()
        _conn.executescript(SCHEMA)
    return _conn


def row_to_dict(row) -> dict:
    d = dict(row)
    for f in JSON_FIELDS:
        if f in d and isinstance(d[f], str):
            try:
                d[f] = json.loads(d[f])
            except ValueError:
                d[f] = [] if f != "socials" else {}
    return d


# ---------------------------------------------------------------- ayarlar
def get_setting(key: str, default: str = "") -> str:
    with _lock:
        r = conn().execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return r["value"] if r and r["value"] is not None else default


def all_settings() -> dict:
    with _lock:
        rows = conn().execute("SELECT key, value FROM settings").fetchall()
    return {r["key"]: r["value"] for r in rows}


def set_settings(values: dict):
    with _lock:
        c = conn()
        for k, v in values.items():
            c.execute("INSERT INTO settings(key,value) VALUES(?,?) "
                      "ON CONFLICT(key) DO UPDATE SET value=excluded.value", (k, v))
        c.commit()


# ---------------------------------------------------------------- müşteriler
def _merge_list(old, new):
    out = list(old or [])
    for x in new or []:
        if x and x not in out:
            out.append(x)
    return out


def upsert_lead(data: dict) -> tuple[int, bool]:
    """Kaydı ekler ya da mevcut kaydı yeni bilgilerle zenginleştirir.
    (id, yeni_mi) döner."""
    with _lock:
        c = conn()
        ext = data.get("external_id")
        existing = None
        if ext:
            existing = c.execute("SELECT * FROM leads WHERE external_id=?", (ext,)).fetchone()
        if existing is None and data.get("website"):
            existing = c.execute("SELECT * FROM leads WHERE website=? AND source=?",
                                 (data["website"], data.get("source"))).fetchone()
        ts = now()
        if existing:
            cur = row_to_dict(existing)
            upd = {}
            for k, v in data.items():
                if k in ("external_id", "source", "status", "notes"):
                    continue
                if k == "emails" or k == "phones_extra":
                    merged = _merge_list(cur.get(k), v)
                    if merged != cur.get(k):
                        upd[k] = json.dumps(merged, ensure_ascii=False)
                elif k == "socials":
                    merged = dict(cur.get("socials") or {})
                    for sk, sv in (v or {}).items():
                        merged.setdefault(sk, sv)
                    upd[k] = json.dumps(merged, ensure_ascii=False)
                elif v not in (None, "", [], {}) and not cur.get(k):
                    upd[k] = v
            if upd:
                upd["updated_at"] = ts
                sets = ", ".join(f"{k}=?" for k in upd)
                c.execute(f"UPDATE leads SET {sets} WHERE id=?", (*upd.values(), cur["id"]))
                c.commit()
            return cur["id"], False
        row = dict(data)
        for f in JSON_FIELDS:
            if f in row:
                row[f] = json.dumps(row[f] or ([] if f != "socials" else {}), ensure_ascii=False)
        row["created_at"] = row["updated_at"] = ts
        cols = ", ".join(row)
        qs = ", ".join("?" for _ in row)
        cur = c.execute(f"INSERT INTO leads ({cols}) VALUES ({qs})", tuple(row.values()))
        c.commit()
        return cur.lastrowid, True


def update_lead(lead_id: int, fields: dict):
    allowed = {"status", "notes", "name", "phone", "website", "city", "country", "emails", "socials"}
    upd = {k: v for k, v in fields.items() if k in allowed}
    for f in JSON_FIELDS:
        if f in upd and not isinstance(upd[f], str):
            upd[f] = json.dumps(upd[f], ensure_ascii=False)
    if not upd:
        return
    upd["updated_at"] = now()
    with _lock:
        sets = ", ".join(f"{k}=?" for k in upd)
        conn().execute(f"UPDATE leads SET {sets} WHERE id=?", (*upd.values(), lead_id))
        conn().commit()


def get_lead(lead_id: int):
    with _lock:
        r = conn().execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    return row_to_dict(r) if r else None


def delete_leads(ids: list[int]):
    with _lock:
        conn().executemany("DELETE FROM leads WHERE id=?", [(i,) for i in ids])
        conn().commit()


def query_leads(q="", country="", source="", status="", has_email=False, has_website=False,
                sort="created_at", order="desc", limit=50, offset=0):
    where, args = [], []
    if q:
        where.append("(name LIKE ? OR city LIKE ? OR address LIKE ? OR emails LIKE ? OR website LIKE ? OR notes LIKE ?)")
        args += [f"%{q}%"] * 6
    if country:
        where.append("country_code=?")
        args.append(country)
    if source:
        where.append("source=?")
        args.append(source)
    if status:
        where.append("status=?")
        args.append(status)
    if has_email:
        where.append("emails NOT IN ('[]','') AND emails IS NOT NULL")
    if has_website:
        where.append("website IS NOT NULL AND website<>''")
    w = ("WHERE " + " AND ".join(where)) if where else ""
    sort_cols = {"created_at", "name", "country", "city", "rating", "reviews", "followers", "status"}
    sort = sort if sort in sort_cols else "created_at"
    order = "ASC" if order.lower() == "asc" else "DESC"
    with _lock:
        total = conn().execute(f"SELECT COUNT(*) FROM leads {w}", args).fetchone()[0]
        lim = "" if limit is None else f"LIMIT {int(limit)} OFFSET {int(offset)}"
        rows = conn().execute(
            f"SELECT * FROM leads {w} ORDER BY {sort} {order} NULLS LAST, id DESC {lim}", args).fetchall()
    return total, [row_to_dict(r) for r in rows]


def leads_to_enrich(limit=1000, only_missing=True, ids=None):
    with _lock:
        if ids:
            qs = ",".join("?" for _ in ids)
            rows = conn().execute(f"SELECT * FROM leads WHERE id IN ({qs}) AND website<>''", ids).fetchall()
        else:
            extra = "AND enriched_at IS NULL" if only_missing else ""
            rows = conn().execute(
                f"SELECT * FROM leads WHERE website IS NOT NULL AND website<>'' {extra} LIMIT ?",
                (limit,)).fetchall()
    return [row_to_dict(r) for r in rows]


def mark_enriched(lead_id: int, emails, phones, socials):
    with _lock:
        cur = get_lead(lead_id)
        if not cur:
            return
        merged_soc = dict(cur.get("socials") or {})
        merged_soc.update({k: v for k, v in socials.items() if k not in merged_soc})
        conn().execute(
            "UPDATE leads SET emails=?, phones_extra=?, socials=?, enriched_at=?, updated_at=? WHERE id=?",
            (json.dumps(_merge_list(cur["emails"], emails), ensure_ascii=False),
             json.dumps(_merge_list(cur["phones_extra"], phones), ensure_ascii=False),
             json.dumps(merged_soc, ensure_ascii=False), now(), now(), lead_id))
        conn().commit()


def stats():
    with _lock:
        c = conn()
        total = c.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        with_email = c.execute("SELECT COUNT(*) FROM leads WHERE emails NOT IN ('[]','')").fetchone()[0]
        with_web = c.execute("SELECT COUNT(*) FROM leads WHERE website<>''").fetchone()[0]
        with_phone = c.execute("SELECT COUNT(*) FROM leads WHERE phone<>'' OR intl_phone<>''").fetchone()[0]
        countries = c.execute("SELECT COUNT(DISTINCT country_code) FROM leads WHERE country_code<>''").fetchone()[0]
        by_country = [dict(r) for r in c.execute(
            "SELECT country_code, country, COUNT(*) n, SUM(emails NOT IN ('[]','')) e FROM leads "
            "WHERE country_code<>'' GROUP BY country_code ORDER BY n DESC LIMIT 25")]
        by_source = [dict(r) for r in c.execute("SELECT source, COUNT(*) n FROM leads GROUP BY source")]
        by_status = [dict(r) for r in c.execute("SELECT status, COUNT(*) n FROM leads GROUP BY status")]
    return dict(total=total, with_email=with_email, with_web=with_web, with_phone=with_phone,
                countries=countries, by_country=by_country, by_source=by_source, by_status=by_status)


def map_points(country=""):
    with _lock:
        w, a = ("AND country_code=?", [country]) if country else ("", [])
        rows = conn().execute(
            f"SELECT id, name, lat, lng, city, country, emails, website, phone FROM leads "
            f"WHERE lat IS NOT NULL {w} LIMIT 20000", a).fetchall()
    return [row_to_dict(r) for r in rows]


# ---------------------------------------------------------------- işler
def create_job(kind: str, title: str, params: dict) -> int:
    with _lock:
        cur = conn().execute(
            "INSERT INTO jobs(kind,title,params,status,created_at) VALUES(?,?,?,?,?)",
            (kind, title, json.dumps(params, ensure_ascii=False), "bekliyor", now()))
        conn().commit()
        return cur.lastrowid


def update_job(job_id: int, **fields):
    if not fields:
        return
    with _lock:
        sets = ", ".join(f"{k}=?" for k in fields)
        conn().execute(f"UPDATE jobs SET {sets} WHERE id=?", (*fields.values(), job_id))
        conn().commit()


def append_job_log(job_id: int, line: str):
    stamp = datetime.now().strftime("%H:%M:%S")
    with _lock:
        conn().execute("UPDATE jobs SET log = substr(coalesce(log,'') || ?, -20000) WHERE id=?",
                       (f"[{stamp}] {line}\n", job_id))
        conn().commit()


def get_job(job_id: int):
    with _lock:
        r = conn().execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
    return dict(r) if r else None


def list_jobs(limit=50):
    with _lock:
        rows = conn().execute(
            "SELECT id,kind,title,status,progress,found,api_calls,created_at,finished_at "
            "FROM jobs ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


def country_counts():
    with _lock:
        rows = conn().execute("SELECT country_code, COUNT(*) n FROM leads GROUP BY country_code").fetchall()
    return [dict(r) for r in rows]

"""UN Comtrade ile GTİP (HS) koduna göre ülke bazında ithalat analizi.

Anahtar olmadan herkese açık 'preview' uç noktası kullanılır (en fazla 500 kayıt);
Ayarlar'a Comtrade abonelik anahtarı girilirse tam veri uç noktası kullanılır.
"""
import json
from pathlib import Path

import httpx

PREVIEW = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
FULL = "https://comtradeapi.un.org/data/v1/get/C/A/HS"

_countries = json.loads((Path(__file__).resolve().parent.parent / "static" / "countries.json").read_text("utf-8"))
A3_TO_A2 = {c["a3"]: c["code"] for c in _countries if c.get("a3")}
A2_TR = {c["code"]: c["tr"] for c in _countries}
TURKIYE = 792


def imports_by_country(hs_code="9303", year=2023, partner=0, api_key=""):
    """partner=0 → dünyadan toplam ithalat; partner=792 → Türkiye'den ithalat."""
    params = {"cmdCode": hs_code, "flowCode": "M", "period": str(year), "partnerCode": str(partner),
              "includeDesc": "true"}
    headers = {}
    url = PREVIEW
    if api_key:
        url = FULL
        headers["Ocp-Apim-Subscription-Key"] = api_key
    r = httpx.get(url, params=params, headers=headers, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f"Comtrade {r.status_code}: {r.text[:300]}")
    rows = {}
    for d in r.json().get("data", []):
        if d.get("motCode") not in (0, None) or d.get("customsCode") not in ("C00", None):
            continue
        a2 = A3_TO_A2.get(d.get("reporterISO", ""), "")
        key = d.get("reporterCode")
        val = d.get("primaryValue") or 0
        if key in rows and rows[key]["value"] >= val:
            continue
        rows[key] = {"reporter": d.get("reporterDesc"), "iso2": a2, "name_tr": A2_TR.get(a2, d.get("reporterDesc")),
                     "value": val, "qty": d.get("qty") or 0, "net_kg": d.get("netWgt") or 0}
    return sorted(rows.values(), key=lambda x: -x["value"])


def market_analysis(hs_code="9303", year=2023, api_key=""):
    world = imports_by_country(hs_code, year, 0, api_key)
    try:
        from_tr = {r["iso2"]: r["value"] for r in imports_by_country(hs_code, year, TURKIYE, api_key)}
    except RuntimeError:
        from_tr = {}
    total = sum(r["value"] for r in world) or 1
    for r in world:
        r["from_turkiye"] = from_tr.get(r["iso2"], 0)
        r["tr_share"] = round(100 * r["from_turkiye"] / r["value"], 1) if r["value"] else 0
        r["world_share"] = round(100 * r["value"] / total, 2)
    return world

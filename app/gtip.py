"""GTİP / HS kodları, çok dilli arama terimleri ve ambargo uyarıları."""

GTIP_CODES = {
    "9303": "Diğer ateşli silahlar ve benzeri cihazlar (av ve spor tüfekleri, tabancalar hariç)",
    "930310": "Ağızdan dolma ateşli silahlar",
    "930320": "Av veya atıcılık spor tüfekleri (en az bir yivsiz namlulu – av tüfekleri / shotgun)",
    "930330": "Av veya atıcılık spor tüfekleri (yivli namlulu – karabina / rifle)",
    "930390": "Diğerleri (işaret fişeği tabancaları, kurusıkı vb.)",
    "9302": "Tabancalar ve revolverler (9303/9304 hariç)",
    "9304": "Diğer silahlar (havalı tüfek / tabanca, cop vb.)",
    "9305": "Silah aksam, parça ve aksesuarları",
    "9306": "Mühimmat, fişek ve parçaları",
}

# GTİP koduna göre Google Maps / sosyal medyada kullanılacak anahtar kelimeler.
GTIP_KEYWORDS = {
    "9303": ["gun shop", "hunting store", "shotgun dealer", "firearms dealer", "hunting rifle shop",
             "sporting guns", "shooting supplies", "firearms importer", "hunting equipment distributor"],
    "930320": ["shotgun dealer", "shotgun shop", "clay shooting shop", "hunting shotguns", "gun shop"],
    "930330": ["rifle shop", "hunting rifle dealer", "gun shop", "firearms dealer"],
    "930310": ["black powder guns", "muzzleloader shop", "gun shop"],
    "930390": ["gun shop", "signal pistol dealer", "firearms dealer"],
    "9302": ["gun shop", "pistol dealer", "firearms dealer"],
    "9304": ["airgun shop", "air rifle dealer", "gun shop"],
    "9305": ["gun parts store", "firearms accessories", "gunsmith"],
    "9306": ["ammunition store", "gun shop", "shooting supplies"],
}

# Ülkenin yerel dilinde "silah mağazası" karşılıkları (Google Maps sonuçlarını artırır).
LOCAL_TERMS = {
    "TR": ["av bayii", "silah mağazası", "av malzemeleri"],
    "DE": ["Waffengeschäft", "Büchsenmacher", "Jagdgeschäft"],
    "AT": ["Waffengeschäft", "Büchsenmacher", "Jagdgeschäft"],
    "CH": ["Waffengeschäft", "armurerie", "Büchsenmacher"],
    "FR": ["armurerie", "magasin de chasse"],
    "BE": ["armurerie", "wapenhandel"],
    "LU": ["armurerie"],
    "IT": ["armeria", "negozio caccia"],
    "ES": ["armería", "tienda de caza"],
    "PT": ["armaria", "loja de caça"],
    "BR": ["loja de armas", "armaria"],
    "MX": ["armería"], "AR": ["armería"], "CL": ["armería"], "CO": ["armería"], "PE": ["armería"],
    "UY": ["armería"], "PY": ["armería"], "BO": ["armería"], "EC": ["armería"], "VE": ["armería"],
    "CR": ["armería"], "GT": ["armería"], "PA": ["armería"], "DO": ["armería"], "HN": ["armería"],
    "NL": ["wapenhandel", "jachtwinkel"],
    "PL": ["sklep z bronią", "sklep myśliwski"],
    "CZ": ["zbraně a střelivo", "myslivecké potřeby"],
    "SK": ["zbrane a strelivo", "poľovnícke potreby"],
    "HU": ["fegyverbolt", "vadászbolt"],
    "RO": ["armurerie", "magazin de arme"],
    "BG": ["оръжеен магазин", "ловен магазин"],
    "GR": ["οπλοπωλείο", "κυνηγετικά είδη"],
    "CY": ["οπλοπωλείο"],
    "RS": ["prodavnica oružja", "lovačka radnja"],
    "HR": ["trgovina oružjem", "lovačka trgovina"],
    "BA": ["prodavnica oružja"], "ME": ["prodavnica oružja"], "MK": ["продавница за оружје"],
    "SI": ["trgovina z orožjem", "lovska trgovina"],
    "SE": ["vapenbutik", "jaktbutik"],
    "NO": ["våpenbutikk", "jaktbutikk"],
    "DK": ["våbenhandel", "jagtbutik"],
    "FI": ["asekauppa", "metsästysliike"],
    "EE": ["relvapood", "jahipood"],
    "LV": ["ieroču veikals", "medību veikals"],
    "LT": ["ginklų parduotuvė", "medžioklės parduotuvė"],
    "RU": ["оружейный магазин", "охотничий магазин"],
    "UA": ["зброярня", "мисливський магазин"],
    "KZ": ["оружейный магазин", "охотничий магазин"],
    "AZ": ["ov mağazası", "silah mağazası"],
    "GE": ["იარაღის მაღაზია"],
    "AE": ["متجر أسلحة", "معدات صيد"], "SA": ["محل أسلحة", "معدات صيد"],
    "QA": ["متجر أسلحة"], "KW": ["محل أسلحة"], "OM": ["محل أسلحة"], "BH": ["متجر أسلحة"],
    "JO": ["محل أسلحة"], "EG": ["محل أسلحة"], "MA": ["armurerie", "محل أسلحة"],
    "TN": ["armurerie"], "DZ": ["armurerie"],
    "JP": ["銃砲店"], "KR": ["총포사"], "TH": ["ร้านปืน"],
    "ID": ["toko senjata", "toko berburu"], "MY": ["kedai senjata api"],
    "PH": ["gun store"], "VN": ["cửa hàng súng"],
}

# Bilgilendirme amaçlı: BM / AB / ABD silah ambargosu veya ciddi kısıtlaması bulunan ülkeler.
# Güncel liste için SIPRI ambargo veritabanı ve T.C. Ticaret Bakanlığı / MSB kontrol edilmelidir.
EMBARGO_COUNTRIES = {
    "AF": "BM (Taliban hedefli)", "BY": "AB", "CD": "BM (hedefli) / AB", "CF": "BM (hedefli)",
    "CN": "AB", "CU": "ABD", "HT": "BM (hedefli)", "IQ": "BM (devlet dışı aktörler)",
    "IR": "BM / AB", "KP": "BM / AB", "LB": "BM (devlet dışı aktörler)", "LY": "BM / AB",
    "ML": "AB", "MM": "AB", "NI": "AB", "RU": "AB / ABD", "SD": "BM (Darfur) / AB",
    "SO": "BM (hedefli) / AB", "SS": "BM / AB", "SY": "AB", "VE": "AB", "YE": "BM (Husiler)",
    "ZW": "AB", "ER": "AB",
}


def keywords_for(gtip: str, country_code: str = "", include_local=True) -> list[str]:
    gtip = (gtip or "9303").replace(".", "").strip()
    base = GTIP_KEYWORDS.get(gtip) or GTIP_KEYWORDS.get(gtip[:4]) or GTIP_KEYWORDS["9303"]
    terms = list(base)
    if include_local and country_code in LOCAL_TERMS:
        terms = LOCAL_TERMS[country_code] + terms
    seen, out = set(), []
    for t in terms:
        if t.lower() not in seen:
            seen.add(t.lower())
            out.append(t)
    return out

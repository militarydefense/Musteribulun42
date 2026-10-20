# Off The Books — Kanal Planı ve Dizi Kitabı

> Rakip referansı: saveo.house — "Every Dollar Leaves a Trail" (5 bölümde 155K takipçi).
> Mekanikleri alıyoruz, öncülü almıyoruz.

## 1. Kanal kurulumu

| Alan | Değer |
|---|---|
| Kanal adı | **Off The Books** |
| Instagram | **@offthebooks.tv** (açıldı) |
| YouTube handle | **@offthebooks.tv** ya da **@offthebookstv**: Instagram'la aynı olmalı, boş olup olmadığı kontrol edilecek |
| Profil fotoğrafı | `brand/avatar.png` |
| Dil | İngilizce |
| Kategori | Entertainment (eğitim bilgisi var ama format dizi) |
| Yayın | Her gün **19:00 ET = 02:00 TR** (YouTube'da zamanlanmış yükleme) |
| Format | Shorts, 70–90 sn, 1080×1920 |

**Kanal açıklaması (About):**

> You just won $50,000,000. Nobody can know. 🎟️🤫
>
> A new episode every day. Every episode ends with a choice. Comment your vote. The majority writes the next episode.
>
> Every rule in the story is real.
>
> ⚠️ Fiction for entertainment. Not financial or legal advice.

**Dizi adı (Sezon 1):** *NOBODY CAN KNOW*
**Dizi sloganı:** *The ticket is the easy part.*

## 2. Öncül

- **Hook cümlesi:** "You just won fifty million dollars."
- **Dünya:** Sıradan bir ofis çalışanı. Bilet çorap çekmecesinde. Kimse bilmiyor… henüz.
- **Asıl çatışma:** Paranın kendisi değil, paranın **getirdikleri**: vergiler, ismin kamuya açılması, akrabalar, dolandırıcılar, iş arkadaşları, kendi harcama dürtülerin.
- **Ton:** Gerilim, kara mizah, belgesel netliği. Asla "zengin oldun, eğlen" değil, her zaman "asıl sorun şimdi başlıyor".

## 3. Göstergeler (HUD)

Ekranın üstünde, rakipteki CASH/BANKED/SUSPICION yerine:

| Gösterge | Anlamı | Davranışı |
|---|---|---|
| **CASH** | Gerçekten elinde olan para | Vergi, harcama ve hatalarla düşer |
| **SPENT** | Bugüne kadar harcanan | "SPEND" oylarıyla artar |
| **EXPOSED** | Kimliğinin ortaya çıkma riski (%) | Her dikkatsizlikte yükselir, %100 = herkes biliyor (sezon finali tehdidi) |

Kurallar:
- Göstergeler bölümün ilk ~%60'ında **sabit kalır**. İlk hareket ya bir ödüldür ya bir ceza, ardından hemen tersi gelir.
- EXPOSED her zaman vurgu renginde gösterilir.
- Her bölümün sonunda **"WHERE YOU STAND"** özet ekranı (ledger kâğıdı üzerinde) olur.

## 4. Görsel kimlik

| Öğe | Karar |
|---|---|
| **Vurgu rengi** | Jackpot altını `#F5C518`. Tek vurgu, tek anlam: "dikkat, bu seni ele verir" |
| **Koyu zemin** | Gece laciverti `#0E1424` (bölüm kartları, kural kartları) |
| **Bilgi zemini** | **Muhasebe defteri kâğıdı**: krem `#F3EEDF`, ince yeşil çizgiler `#9DB89A`, kırmızı marj çizgisi. Kanal adının ("off the books") görsel karşılığı ve rakibin düz krem zemininden ayrışıyor |
| **Damga dili** | Altın ya da kırmızı eğik mühür: `TAXED`, `PUBLIC RECORD`, `FLAGGED`, `LEAKED` |
| **Tipografi** | Başlıklar: kalın grotesk (Inter Black / Archivo Black). Etiketler: monospace (JetBrains Mono / IBM Plex Mono) |
| **Altyazı** | Karaoke: konuşulan kelime beyaz, gelecek kelimeler gri, ekran ortasının biraz altında |

### Maskot: "Lucky"
Rakibin karakter tipinde, kıyafetleri siyah. Referans: `ep01/assets/lucky_sheet.png` (her sahne bu sayfayla üretilir).
- Bembeyaz, pürüzsüz, yuvarlak kafa; saç, kulak ve burun yok; nokta gözler; tüm duyguyu taşıyan kalın siyah kaşlar
- **Siyah şapka, önünde küçük altın $ arması**
- **Bol siyah hoodie, altın ip uçları**, siyah dar kot, beyaz spor ayakkabı
- Ayırt edici imza: altın $ ve altın ipler (kanalın vurgu rengi)

### Görsel katmanlar (rakipten öğrenildiği gibi dönüşümlü)
1. **Sinematik illüstrasyon:** yapay zekâ ile üretilen sahne ve yavaş kamera hareketi (zoom/pan)
2. **Ledger infografik:** kodla çizilen, kademeli kurulan animasyonlar
3. **Kural kartı:** lacivert zemin, küçük altın `RULE N` etiketi, tek cümle
4. **Gün kartı:** siyah zemin, `DAY N`, 0,6 sn, sessiz

## 5. Ses tasarımı

| Ses | Kullanım |
|---|---|
| Anlatıcı | ElevenLabs, derin, sakin, belgesel tonunda erkek ses (ilk bölümde 3 aday denenecek) |
| Alt müzik | Düşük tempolu gerilim pad'i + hafif trap hi-hat. Infografiklerde müzik incelir |
| `whoosh` | Her sahne geçişi |
| `tick` | Sayaçlar akarken (hızlanan tıkırtı) |
| `stamp` | Mühür düşüşü (TAXED, FLAGGED) |
| `cash_drop` | CASH düşerken kasa/yazar kasa sesi |
| `bass_hit` | Ters köşe anı ("Except that…") |
| `riser` | Seçim kartı öncesi |
| `silence` | DAY N kartları: tam sessizlik, 0,6 sn |

## 6. Bölüm şablonu (~80 sn)

```
 0–7   HOOK         "You just ..." + ters köşe
 7–10  BÖLÜM KARTI  PART N · <başlık>  /  NOBODY CAN KNOW
10–30  PERDE 1      Problem 1 (+ infografik) → Problem 2 (+ infografik)
30–36  KURAL        RULE N kartı
36–57  PERDE 2      DAY N → karakter bir plan yapar → göstergeler ilk kez hareket eder (ödül)
57–70  TERS KÖŞE    "Except..." → ceza (EXPOSED ya da CASH sıçrar)
70–76  ÖZET         WHERE YOU STAND (ledger)
76–80  SEÇİM        duygu vs mantık ikilemi
 son   CTA KARTI    PART N+1 TOMORROW · Comment X or Y. The majority writes Part N+1.
```

Ritim hedefleri: sahne başına 2–3 sn · her ~12 sn'de bir somut gerçek · her cümle bir soruyu açık bırakır.

## 7. Bilgi doğruluğu kuralı

Rakibin gücü **her kuralın gerçek olması** (FinCEN Form 112 alt notu gibi). Bizde de:
- Ekrandaki her rakam ve kural yayından önce kaynakla kontrol edilir.
- Her infografiğin altında küçük monospace kaynak notu bulunur (ör. `IRS Pub. 525`).
- Yaygın ama yanlış bilgiler ("piyango kazananların %70'i batar" gibi) **kullanılmaz**, ya da bir bölümde "bu istatistik uydurma" ters köşesi olarak işlenir.
- Eyaletten eyalete değişen kurallar "in most states" gibi doğru niteleyicilerle söylenir.

## 8. Oylama ve büyüme döngüsü

1. Bölüm yayınlanır, **pinned comment**: `HIDE or SPEND? 👇 Votes close in 20 hours.`
2. Aynı anda **topluluk sekmesi anketi** (YouTube anketleri yorum sayımından daha güvenilir)
3. Ertesi gün bölümün ilk saniyelerinde: `YOU VOTED: QUIT (63%)`, izleyiciye sözünü tutuyoruz
4. Her iki sonuç için de bir sonraki bölümün taslağı önceden hazır olur, böylece üretim günü sıkışmaz
5. Her 7 bölümde bir **"Full Season"** uzun video derlemesi (uzun format, daha yüksek RPM)

## 9. Sezon 1 kabaca yay (oylarla değişecek)

| Bölüm | Başlık | Ana konu | Olası seçim |
|---|---|---|---|
| 1 | The Number Is a Lie | Toplu ödeme vs taksit, vergi, ismin kamuya açılması | QUIT or STAY (işi bırakmak) |
| 2 | Two Weeks' Notice / Business as Usual | İş arkadaşları, ani davranış değişikliğinin ele vermesi | — |
| 3 | The Trust | Avukat, anonim tröst, ödülü talep etme | — |
| 4 | Family Dinner | Akrabalar, hediye vergisi sınırı | TELL or LIE |
| 5 | Unknown Number | Dolandırıcılar, sahte "lottery official" telefonları | — |
| 6 | The First Big Buy | Yaşam standardı enflasyonu, araba amortismanı | SPEND or INVEST |
| 7 | Exposed | Sezon finali: EXPOSED %100'e yaklaşır | — |

## 10. Üretim hattı

Mevcut Brain vs Wallet altyapısı (`video7/src`: `scene.html`, `scenes.js`, `script.json`, `mix.py`, `finalize.sh`) temel alınır:

1. `script.json`: sahneler, seslendirme, HUD değerleri, infografik tanımları
2. Yapay zekâ ile illüstrasyonlar (karakter sayfası referansıyla)
3. HTML motoru: illüstrasyonlara kamera hareketi + HUD + infografikler + kartlar + karaoke altyazı
4. ElevenLabs seslendirme → kelime zamanlaması → altyazı senkronu
5. `mix.py`: anlatım + müzik + SFX
6. Render ve `UPLOAD.md` (başlık, açıklama, etiketler, pinned comment)

**Yükleme notu:** Yapay zekâ ile üretilen görseller gerçekçi değil, çizgi illüstrasyon. YouTube'un "altered/synthetic content" beyanı gerçek görünen içerik için zorunlu. Yine de her yüklemede kontrol edilecek.

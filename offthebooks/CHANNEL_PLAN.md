# Off The Books — Kanal Planı ve Dizi Kitabı

> Rakip referansı: saveo.house — "Every Dollar Leaves a Trail" (5 bölümde 155K takipçi).
> Mekanikleri alıyoruz, öncülü almıyoruz.

## 1. Kanal kurulumu

| Alan | Değer |
|---|---|
| Kanal adı | **Off The Books** |
| Instagram | **@offthebooks.tv** (açıldı) |
| YouTube handle | **@offthebooksdaily** (açıldı, ayrıntılar `YOUTUBE.md`) |
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

## 11. Üretim bütçesi (21 Ekim 2026 kararı)
- 1 aylık deneme, her gün bir bölüm, kalite düşürülmeden: Lucky'li sahneler 2K, MiniMax anlatıcı (`English_Deep-tonedMan`) + gerektiğinde ikinci karakter sesi.
- Gerçekleşen maliyet: Part 1 = 74 kredi, Part 2 = 48 kredi, Part 3 = 110 kredi (17 yeni görsel + 5 ses parçası). Hedef ortalama ~45–50 kredi/bölüm (ayda ~1.400–1.500).
- Kredi azalınca kullanıcı ekleme yapacak; her bölüm öncesi bakiye kontrol edilip kullanıcıya bildirilir.

## 12. Bölüm kapağı şablonu
Her bölümün kapağı `engine/cover.py` ile üretilir ve videonun son karesine eklenir (Reels/Shorts kapağı olarak seçilir):
`NOBODY CAN KNOW` · **PART + dev renkli numara** (her bölümde farklı renk, döngüsel) · bölüm adı · o bölümün en güçlü sahnesi.
Yazılar profil ızgarasının kırptığı 1080×1440 alanın içinde kalır. Part 1 profile sabitlenir.
```
python3 -I ../engine/cover.py assets/<sahne>.png <N> "BAŞLIK SATIR 1|SATIR 2" assets/cover.png [odak 0..1]
bash ../engine/finalize.sh build assets/cover.png build/full.mp4
```

## 13. Bölüm yazım kuralları (Part 1–2 verilerinden)
1. **İlk cümle öncülü anlatır** (izleyicilerin ~%100'ü takipçi değil): "You won fifty million dollars, nobody can know, and …" + bugünün tehdidi, ~3–6 sn.
2. Oy sonucu kısa bir bilgi olarak geçer ("And you're the one who voted to stay."), açılışın kendisi olmaz. Bölüm başında geri sarma yok.
3. Akan, sohbet eden cümleler; anlatıcı `English_Insightful_Speaker`, hız 1.0. Karakter replikleri ayrı sesle.
4. Her cümle yeni bir illüstrasyon ya da ifade varyasyonu getirir; kesmeler kelimelere bağlıdır (`beats(..., {cuts})`). Hiçbir kare ~2,5 sn'den uzun kalmaz.
5. Bilgi sahnenin üstüne etiket olarak yazılır (`overlayTag`). Düz kart yalnızca kaydetme listesi ve son çağrı; son çağrı da sahnenin üstünde.
6. Paylaşım, kaydetme, yorum ve takip çağrıları hikâyenin içinde, birer kez.
7. Ses: kayıt foley (`engine/sfx`), **whoosh hiç kullanılmaz** (kullanıcı kararı, 22 Ekim; riser'da da gürültü süpürmesi yok), müzik konuşmanın ~5 dB altında (23 Ekim: rakiplerle ölçülerek 8 dB'den yükseltildi; `MUSIC_DB=2.5`, `DUCK=.25`), müzik ilk kareden itibaren çalar. Varsayılan fon: `engine/music/tense_b.mp3` (gerilim, nabız gibi bas, tik tak; alternatif `tense_a.mp3`).
8. Teslim: `releases/partNN/` (Instagram kesimi kapak karesiz + ayrı kapak, YouTube kesimi kapak kareli, hikâyeler, README).

## 14. Rakibin Part 3'ünden dersler (22 Ekim)
1. **İzleyiciyi hikâyeye yaz:** oy sonucu gerçek yüzdeyle, en iyi yorum ekranda Instagram yorum kartı olarak (kullanıcı adı bulanık). Rakip, yorumdaki bir cümleyi ("50k is an inch, he'll take a mile") kötü karakterin repliğine çevirdi.
2. **Karakterlere isim etiketi** (COUSIN DRE). Bizde: THE BOSS · MR. GRANT.
3. **Gösterge yalnızca yükselir** (SUSPICION 58→64→72→76→81) ve büyük sıçramalar ekranın ortasında büyük sayıyla gösterilir.
4. **Gerçek bilgi = olayın sebebi:** 10.000$ üstü nakit alımı alıcının adını bildirir → kuzen yakalanır → iz sana gelir. Bilgi süs değil, hikâyeyi ilerletir.
5. **Kural kırılır, ceza gelir** (RULE 2 + BROKEN damgası). Sadece "kurala uydun" bölümleri gerilimi düşürür.
6. **Grafik çeşitliliği:** 3'lü kolaj, yükselen sayaç ($400 → $43,303), dedektif panosu, CCTV + işaret kutusu, kırmızı daire. Hepsi kredisiz canvas çizimi.
7. **Kısa, kesik cümleler** gerilim anlarında ("Three cars back. The whole drive. 2am. Headlights.").
8. **İkinci tehdit katmanı** sonda ("Dre followed you. And someone followed Dre.").
9. **Oylamadan sonra açık uç:** "There's a third way out… it's been in your pocket this whole episode." Videoyu sonuna kadar izletir, tekrar izletir, yorumda tahmin yaptırır.
10. Rakip paylaş/kaydet çağrısı **yapmıyor**; etkileşim izleyiciyi hikâyeye katmaktan geliyor. Bizde çağrılar birer kez ve kısa kalsın.

## 15. Yayın öncesi kontrol listesi (Part 3 verisiyle doğrulanınca kalıcı standart)
Ölçüt: Part 3 Instagram'da 10. saniyede kalan izleyici **≥ %55** (Part 2: ~%40). Tutarsa her bölüm bu listeden geçmeden teslim edilmez.

**İlk 10 saniye**
- [ ] İlk cümle öncülü söylüyor (milyonlar + kimse bilmemeli + bugünün tehdidi), ≤ 6 sn
- [ ] Ekranda ilk karede büyük öncül yazısı (YOU WON $50,000,000)
- [ ] Oy sonucu kısa damga; gerçek bir izleyici yorumu kartı (kullanıcı adı bulanık)
- [ ] Geri sarma yok; 10. saniyeden önce bir ters köşe/espri
- [ ] Tehdit sayıyla görünür (kırmızı etiket + HUD kırmızı yanıp sönme)

**Hikâye**
- [ ] Göstergeler yalnızca yükselir
- [ ] Gerçek bilgi olayın sebebidir (süs değil), kaynakla kontrol edildi, gerekiyorsa "most states"
- [ ] Bir kural çiğnenir ve cezası gelir
- [ ] Karakterlerin isim etiketi var
- [ ] Gerilim anlarında kısa, kesik cümleler
- [ ] Sonda ikinci tehdit katmanı + oylamadan sonra açık uç

**Görsel ve ses**
- [ ] Hiçbir kare ~2,5 sn'den uzun değil; en az 3 grafik türü (etiket, sayaç, kolaj, pano, işaret)
- [ ] Anlatıcı English_Insightful_Speaker, karakterler ayrı ses
- [ ] Whoosh yok; foley + müzik konuşmanın 8 dB altında; -14 LUFS
- [ ] Seslendirme kontrolü "voice check: ok"

**Teslim**
- [ ] Instagram ve YouTube aynı video (YouTube'da son karede kapak)
- [ ] Ayrı kapak (yazılar 3:4 alanda, yüzü kapatmıyor)
- [ ] Sonuç/geri sayım ve canlı oylama story'leri
- [ ] README: açıklama, başlık, etiketler, sabit yorum (her biri ayrı kod bloğunda)

## 16. Part 3 ilk 2 saat verisi (Instagram, 22 Ekim 23:37)
| | Part 2 (12 sa) | Part 3 (2 sa) |
|---|---|---|
| Görüntüleme / izleyen | 244 / 209 | 372 / 240 |
| Görüntüleme ÷ izleyen (tekrar izleme) | 1,17 | **1,55** |
| Ortalama izleme | 21 sn / 70 sn (%30) | 27 sn / 85 sn (%32) |
| Geçme oranı | %32,2 | **%28,8** |
| 10. saniyede kalan | ~%40 | **~%50–55** |
| Orta bölüm platosu | ~%30 | **~%40** |
| Beğeni oranı | %0,9 | %1,6 |
| Takip / profil ziyareti | 0 / — | 1 / 16 |
| Paylaşım / kaydetme | 0 / 0 | 0 / 0 |

Sonuç: açılış düzeltmesi işe yaradı (§15 listesi korunur). Yeni kayıp noktaları:
1. **~63. sn, kaydetme kartı:** düz kart "video bitiyor" sinyali veriyor, plato burada kırılıyor; kaydetme yine 0. → Düz kaydetme kartı kaldırılır; liste gerekiyorsa sahnenin üstünde, ortada ve kısa.
2. **~72–75. sn, son çağrı kartı:** izleyici %5'e düşüyor, sondaki açık ucu neredeyse kimse görmüyor. → Son çağrı sahnenin üstünde ve kısa (rakip gibi), açık uç oylama sorusundan hemen sonra; sessiz kapanış kartı yok.

### 16b. Part 3, 11. saat (23 Ekim 08:04) ve kesinleşen kurallar
| | Part 1 (12 sa) | Part 2 (12 sa) | **Part 3 (11 sa)** |
|---|---|---|---|
| Görüntüleme / izleyen | 1.459 / ~1.240 (4. saatte durdu) | 244 / 209 | **832 / 678 (hâlâ büyüyor)** |
| Ortalama izleme | 31 / 84 sn | 21 / 70 sn | 30 / 85 sn |
| Geçme oranı | %33,8 | %32,2 | %31,5 |
| Beğeni / yorum | 24 / 11 | 2 / 3 | **20 / 9** (beğeni oranı %2,8) |
| Kaydetme / yeniden paylaşım | 1 / 0 | 0 / 0 | **4 / 2** |
| Profil ziyareti / takip | 62 / 0 | — / 0 | **41 / 4** |
| Paylaşım (DM) | 0 | 0 | 0 |
| Ülke | — | — | ABD %26,8, Hindistan %17, Yunanistan %4,3, İngiltere %4, Türkiye %3,7 |

Ayrılma anları ("İnsanlar Reels videonu gördüğünde"): 0:00 (~%35), **~0:10 oy/yorum kısmının sonu (~%22)**, **~1:05 SAVE THIS kartı (~%11)**; son çağrı kartında izleyici ~%5'e iniyor.

**Kesinleşen kurallar (Part 4'ten itibaren):**
1. Oy sonucu + izleyici yorumu açılışta en fazla ~2 sn; uzun yorum anı 20–30. saniyede.
2. Düz kaydetme kartı yok; son çağrı sahnenin üstünde, kısa; açık uç oylama sorusundan hemen sonra, sessiz kapanış kartı yok.
3. YouTube akışı için ilk kare: parlak, yakın plan yüz, tek iri satır, ilk 0,5 sn'de hareket (Part 2 YouTube akışında %46 kaldı).
4. Zamanlanmış yayın denemesi: 02:00 TR (19:00 ET).
5. Oylar ikiye bölününce "so you did both" ile iki tarafı da hikâyeye yaz.

## 17. Hesabın sesi (23 Ekim)
- İzleyiciye görünen hiçbir metinde Türkiye saati ya da "(TR)" yazılmaz. Saat gerekiyorsa ET (ABD Doğu), tercihen göreli süre: "Votes close in 6 hours", "Part 4 drops tonight".
- Çeviri: 20:00 TR = 13:00 ET (Ekim–Kasım başı, EDT); 3 Kasım sonrası (EST) 20:00 TR = 12:00 ET.

## 18. İkinci rakip (plotshift.studios, "You found $20 million", 23 Ekim)
85 sn, ~15 farklı görsel; görseller 4–6 sn kalıyor ama ekran her 1–2 sn'de **üstüne binen arayüz öğeleriyle** değişiyor. Uygulanacaklar (hepsi kredisiz, canvas):
1. **Tek kelimelik dev altyazı** (ekranın alt-ortası, kalın, gölgeli), satırlık karaoke yerine.
2. **İlk karede sayaç:** "YOU JUST FOUND $0 → $20,000,000" 1,5 sn'de yükselir; hareket 0. saniyede başlar.
3. **Hikâye içi arayüz:** telefon mesaj balonları (UNKNOWN SENDER), gelen arama kutusu, pil %1 → %0, saat 11:47 P.M., "13 MINUTES LEFT TO DECIDE" geri sayımı, bilgi kutuları (200,000 BILLS, ≈72 KG → 200 KG sayacı), daktilo listesi.
4. **Negatif/ters renk flaşı** ters köşe kelimelerinde (whoosh yerine görsel geçiş).
5. **Kural güncellemesi (§13.4):** "≤2,5 sn'de yeni görsel" yerine "≤2 sn'de ekranda yeni bir şey" (görsel, arayüz öğesi, sayaç, kamera kesmesi). Daha az görsel = daha az kredi.
6. Yakın plan karakter yüzü + sahne üstünde oy butonları; video siyah 2 sn ile biter (döngü).
7. Hikâye: sade gizem ve son tarih; öğretici bilgi yok. Bizim farkımız gerçek bilgiler; onları koruyup daha kısa tutuyoruz.

## 19. İkinci rakip, Part 2 (107 sn) — Part 4'e kopyalanacaklar
1. **Oy sonucu yarışı:** "THE VOTES ARE IN" kutusu, RETURN/KEEP çubukları 0'dan gerçek yüzdeye yarışarak dolar, "RETURN WON" rozeti (~3 sn). Bizde gerçek sayılarla; berabere ise "TIE → SO YOU DID BOTH" damgası.
2. **Açılış:** 1,5 sn önceki bölümden hızlı görsel özet + siyah "PART II" kartı (1 sn) + oy yarışı. Bizim kuralımız gereği öncül cümlesi yine ilk saniyelerde kalır.
3. **Daktilo isim etiketi:** "BEN · AN OLD FRIEND · ALMOST A YEAR SINCE YOU LAST MET".
4. **Daktilo talimat kutusu, anahtar kelimeler renkli:** "TAKE TWO STACKS. KEEP THE REST HIDDEN."
5. **Sayaç/bilgi kutuları:** ağırlık 0 → 220 LB, "13 MINUTES UNTIL MIDNIGHT", "CURRENT TIME 11:58 P.M.", "MEETING LOCATION 18 MERCER ROAD" (daktilo).
6. **Telefon mesajı kutusu:** "FROM YOUR NUMBER ***-8147" + mesaj metni.
7. **Çelişki kutusu (ipucu):** "YOU SAID: SOMETHING / HE SAID: BAGS". İzleyiciye dedektiflik yaptırır, tekrar izletir. Her bölüme dikkatli izleyiciyi ödüllendiren bir ipucu koy.
8. **Geçmişe dönüş araları:** geçmiş olaydan bahsedilince önceki bölümlerin görselleri 1–2 sn araya girer (kredisiz).
9. **İki karakterli diyalog sahnesi:** karşılıklı çekim, ikinci ses; anlatıcı kısa.
10. **Siyah kare kesmeleri** (0,3–0,5 sn) büyük açıklamadan önce + siyah-beyaz/negatif flaş.
11. **Son:** sahne kararır, "WHAT WOULD YOU DO?" başlığı, iki seçenek kutusu ve her birinin altında **tek satırlık sonucu**; "COMMENT YOUR CHOICE · Your votes decide what happens next"; soru iki kez sorulur; siyah 1,5 sn ile biter.
12. Az görsel (diner'da 4–5 açı), çok arayüz öğesi. Öğretici bilgi yok; bizde bilgiler kalır ama kısa.

## 20. Ses efekti kütüphanesi (23 Ekim eklemeleri)
`engine/mix.py` içinde, SFX olaylarına isteğe bağlı süre (`d`) verilebilir:
- `knock3`: kapıya üç kez vurma (kayıt) · `keyboard`: klavye (patron bilgisayar başındayken) · `ring`: cep telefonu zil sesi · `buzz`: titreşim
- `rec_beep`: kayıt başlarken iki tonlu bip · `crickets`: gece sahneleri için ağustos böceği/cırcır ambiyansı
- `fill`: gösterge/çubuk dolarken dijital tırmanan bip + onay sesi (sayaçlar, oy yarışı, EXPOSED sıçramaları)
- `typewriter`: daktilo tuşları + satır sonu zili (daktilo efektli kutular, isim etiketleri)
Kural: her ekran öğesinin kendi sesi var; whoosh yok. Örnek dinleme: `releases/part04/New_SFX_Demo.m4a`.

## 21. Kesme süreleri ve efekt ses ayarı (23 Ekim)
- Her bölümde render sonrası kesme ölçümü yapılır (`ffmpeg select=gt(scene,0.18)`): aynı görsel art arda iki kare olursa tek sahne gibi algılanır, sayılmaz. Hedef: hiçbir sahne **2,8 sn'den uzun** değil, hiçbir normal kesme **0,9 sn'den kısa** değil (izleyici ne olduğunu anlamalı) (negatif flaş ve siyah kesme hariç; onlar bilerek kısa).
- Aynı görselin iki kırpması arka arkaya gelmez; aynı görsel tekrar kullanılacaksa araya başka görsel girer.
- Efektler `SFX_GAIN=.42` ile daha yüksek; efekt çalarken müzik ~6 dB kısılır, efekt bitince ~350 ms'de geri gelir.

## 22. Part 4'e eklenen kredisiz öğeler (23 Ekim) — sonraki bölümlerde de kullanılır
- `deadlineChip`: HUD etiketinin yanında gerçek zamanlı geri sayım ("⏱ FRIDAY 5PM · 2D 07:58:00"), ikinci tehditten sonra kırmızı.
- `typedList`: numaralı daktilo listesi; `segText` ile anahtar kelimeler renkli (altın = önemli, kırmızı = tehlike). `infoBox` değeri de renkli parça listesi alabilir.
- `beats(..., { push })`: tedirgin sahnelerde hızlanan yaklaşma (dolly-in) + kenarlardan kapanan karartma; derinlik hissi. Part 4: kapı .12, "Half…" .16, "signature" .20, mutfak .12, yükleme .15, ikinci ses .22.

## 23. Açılış kuralı güncellemesi (23 Ekim, Part 4 yeniden kurgu)
- §13.1'in uygulaması değişti: ilk cümle konuyu **ve bu bölümün yeni olayını** birlikte söyler. Konuyu sadece özetlemek (Part 1'in haberini tekrar vermek) çatışma vermez.
- **Soğuk açılış:** bölümün en güçlü repliği (genelde karakter sesi) ilk 2–3 sn'de, kayıt/ekran arayüzüyle. Hemen ardından konu cümlesi. Aynı replik bölümün ortasında tekrar gelir (izleyici tanır).
- Ardından "Here's how." (≤1 sn) + önceki bölümden 3 hızlı kare + bölüm numarası siyah ekranda (bölümün renginde) + derin vuruş. Uzun geri sarma yok.
- Oy kısmı ≤2,5 sn; seslendirme "Your comments picked it: …" gibi kısa, "tied/vote came in" gibi iç ayrıntı yok.
- Para sayacı ekranın ortasında dev (`bigCounter`) + `money_count` sesi. Damgalar yüzlerin üstüne gelmez.
- Teslimden önce soru: **"Bu videoyu ilk kez görsem ilk 3 saniyede durur muydum?"** Cevap kısa ve dürüst olarak teslim notuna yazılır.

## 24. Kullanıcı düzeltmeleri (23 Ekim)
- Bölüm numarası ekranı (PART N) en az ~1,5 sn ekranda kalır; önündeki hatırlatma kareleri en fazla 2 tane, her biri ≥0,4 sn.
- Ağustos böceği/cırcır sesi **kullanılmaz** (ofis hikâyesinde yersiz duruyor).
- Tek kelimelik altyazı 84 px (önce 112), en fazla 820 px genişlik.
- Siyah kare kesmesi kullanılmaz; negatif flaş yalnızca 1–3 büyük ters köşede.

## 25. Rakip 1 Part 8 analizi: "hikâye tonu" (23 Ekim)
Ölçüm (anlatım temposu, 5 sn pencereler): rakip 108–240 kelime/dk (sapma 39), biz 132–216 (sapma 23). Ortalama aynı (174), fark **değişkenlikte**: rakip bilgi verirken hızlanıyor, açıklamada yavaşlıyor. Rakipte 0,35 sn'den uzun 17 duraklama, ortalama 0,76 sn, en uzunu 1,7 sn ("No name." sonrası). Bizde 32 duraklama, ortalama 0,56 sn: çok sayıda eşit, kısa boşluk = "düz akış" hissi.
Görsel/ses gözlemleri:
1. Her sahnenin kendi rengi var: kasa sahnesi pembe-kırmızı, kapı yağmurda soğuk mavi, büfe sıcak sarı, siluet sahnesi far ışığı. Bizde neredeyse her sahne aynı lacivert-altın.
2. Karakter kendi sesiyle, mırıldanır gibi konuşuyor ("I know that signature.", "Somebody took my mail."); yakın plan yüz ifadesiyle eşleşiyor.
3. Geçişler hikâyedeki nesneden doğuyor: beyaz kopya üstüne sarı kopya kayıyor, posta damgası basılıyor, kimlik kartında isim daktiloyla yazılıyor, farlar silueti açığa çıkarıyor, dev sayaç ("26 → 1,355 NAMED HIM") karakterin üstünde dönüyor.
4. İzleyici hikâyenin karakteri: "200,000 of you stole $10 million. Together." / "Over 1,300 of you named the man who helped you."
5. Efektler sahneye özgü ve anlatıcının altında; müzik sürekli ve gerilimi taşıyor.
Uygulama planı (Part 5):
- Anlatıcı: duygu etiketleri destekleyen ses (ElevenLabs v3: [whispers], [pause], [slowly], [nervously]) denenir; bilgi cümleleri hızlı, açıklamalar yavaş ve 0,8–1,5 sn dramatik sessizlikle. `align.py`'a satır başına özel duraklama (`"pause"`).
- Lucky'nin iç sesi: fısıltı, hafif yankı/alçak geçiren filtre, italik altyazı.
- Karakter tonlaması sahneye göre (Grant: alaycı / tehditkâr / panik).
- Sahne başına renk tonu (soğuk mavi = tehdit, sıcak = güvenli, kırmızı = tehlike, soluk = geçmiş) — kodla, kredisiz.
- Nesneden doğan geçişler (kâğıt kayması, ekran içinden geçiş, damga, ışık parlaması) — kodla.
- Lucky için 3–4 ifade varyasyonu (korku, rahatlama, öfke, kurnaz gülümseme).

## 26. Part 4 ilk saat dersi (23 Ekim)
Part 4 (Instagram, ~1 sa): geçme %44 (Part 3 %29), 10. sn ~%27 (Part 3 ~%50), ortalama 15 sn; ilk paylaşımlar (%3,3).
Kırılmalar: 0–3 sn (başka karakterin sesiyle soğuk açılış + yazı kutusu: "sen" yok, konu 2,3. sn'de) ve ~9,5 sn (siyah PART 4 kartı = "bitti/reklam" sinyali).
Kurallar:
- **Açılış Part 3 formülü:** anlatıcı + "You won fifty million dollars…" ilk kelimeden, parlak sayaç ilk karede. Soğuk açılış (başka karakterin repliği) kullanılmaz.
- **Siyah ara kart yok;** bölüm numarası sahnenin üstünde küçük etiket.
- **Her bölümde tek değişken** denenir; teslim notunda hangisi olduğu yazılır.
- TikTok Part 4 bu formülle ayrı kurgu (`ep04tt/`): iki açılışın karşılaştırması.

## 27. İkinci seri kararı: Titanik (25 Ekim)
- "Nobody Can Know" (NCK) 2–3 bölümde güçlü bir finalle kapanır; kanalda kalır ve yeni izleyiciye yönlendirilir.
- Yeni seri: Titanik'ten kaçış, izleyici oylarıyla. Çalışma adı "LAST LIFEBOAT". Kurgu, gerçek olaylardan esinlenme ("Fiction inspired by real events"); gerçek yolcular karikatürleştirilmez.
- Kanal kimliği bağlantısı: karakterin yanında sahibi belirsiz bir servet (emanet mücevher/para çantası).
- Yapı: gerçek zaman çizelgesi 23:40 (buzdağı) → 02:20 (batış), ekranda sürekli geri sayım; her bölüm ~10–15 dk. 12–15 bölüm (+ Carpathia/New York ile 20'ye kadar).
- Kurallar NCK ile aynı (§13, §15, §26): anlatıcı + "you" ilk kelimede, konu + bölümün yeni olayı ilk cümlede, parlak ilk kare, siyah ara kart yok, her bölümde tek yenilik.
- Gerçek bilgi: 2.224 kişi / 1.178 filika kapasitesi, ilk filika 65 kişilik 28 kişiyle, su -2°C, Californian'ın yardıma gelmemesi vb. Her rakam yayından önce kaynakla kontrol edilir.
- İki seri birlikte: profilde ayrı öne çıkan story + ayrı oynatma listesi, kapaklarda seri adı ve renk farkı. Biri patlarsa diğerine çapraz yönlendirme (sabit yorum, açıklama, son karede "other story on my profile").
- Önce 3 bölümlük test; rakamlara göre devam.

## 28. Titanic Part 1 "The Bag" (25 Oct)
- Hero Tommy (3rd class), Lady (English_Graceful_Lady, female), Steward (English_Debator), Bowler Hat man (English_CaptivatingStoryteller), inner voice filtered.
- Frame 0: Tommy + giant ticking "THE TITANIC SINKS IN 2:39:59"; HUD = story clock that jumps forward between scenes + DANGER %.
- Real facts on screen: 1,178 lifeboat seats vs ~2,224 aboard (1,046 without a seat); 3rd class reached the deck too late.
- New SFX: horn, groan, water, heartbeat, bell3, gate. Music: assets/music.mp3 (Suno orchestral, first 4 s cut).
- Vote STAY / RUN. 85 s, 20 images. Release: releases/titanic_part01/.
- 25 Oct v2 (user: "first scenes stay too long, every cut looks the same, add emotion"): voice 77 s (inner silences capped at 0.24 s, opening line +7% tempo),
  hook = 6 pictures in 5.7 s; beats() frames take a 5th option {tr: crash|flash|whip|glitch|red|dip|shake|tilt, move: in|out|left|right|up|down|crash,
  rot: dutch degrees, fx: sway|flicker|pulse, shake}. Rule: neighbouring cuts never use the same transition; emotion → move (fear: crash+pulse, chaos: sway+rot, dread: dip+flicker).

## 29. Titanic Part 1 data (~8 h, IG)
- 1,288 views / 1,071 viewers, avg 26 s (of 78 s), skip 33.4% (30 min: 14.6%), likes 29 (2.6%), comments 4, saves 5 (0.5%), shares 1, follows 1.
- Curve still climbing steeply at 8 h, far above typical; 91.4% from Reels tab (non-followers).
- Retention: ~100→60% in first ~3 s, ~45% by ~6 s, then FLAT ~38% to ~1:05, then drops at the vote/CTA → people who pass 6 s watch to the end.
- Weak spots: (1) first 3 s still loses ~40%; (2) the drop at the CTA hides the open loop (bowler hat) from most viewers; (3) follows 1/1,071 → no reason to follow.
- Vote so far: RUN 4/4 (just_clark24 "Run of course", naomi.geiwald, carlo_yinke_, + 1).
- Part 2 rules: open loop BEFORE the CTA, CTA ≤ 2 s at the very end; give a follow reason ("follow to see if Tommy makes it off").
- YouTube NCK Part 5 (~14 h): 461 views, flat for ~9 h then a steady climb (still rising), 95.7% Shorts feed, 58.3% kept watching
  (best so far; Part 2 was 43%), avg 0:31 of 1:19, 2.3 h watch time. YouTube pushes late — judge YT at 48 h, not at 3 h.
- YouTube NCK Part 2 (lifetime): 770 views, flat after ~1.5 days, +3 subs; avg 0:36 (49.3%).
  Retention: >100% at 0:00 (rewinds), 100→66% between ~0:03 and ~0:10 (the recap after the cold-open line), ~45% at 0:25,
  flat ~35% to ~1:02, then drops at the vote/CTA. Same CTA drop as Titanic P1 → rule confirmed: open loop before CTA, CTA last ≤2 s;
  no recap in the first 10 s ("you voted X" goes after the new event, not before it).

## 30. NCK Part 6 (45 s, first ~2.5 h IG, posted ~19:00)
- 487 views / 258 viewers (1.9 views per viewer → rewatches), avg 18 s of 44 s (41%), skip 20.7% (IG: "lower" ✓),
  likes 2.9% (higher ✓), comments 1.2% (higher ✓, 5), saves 0.2%, shares 0. Curve above typical.
- Retention: 100→~58% by 0:05, ~48% at 0:12, slow slide to ~37% at 0:28, then a step down at ~0:29–0:33 (= the
  "Send this to someone…" line) to ~25%, flat ~22% to 0:42. ~20% reach the end (Titanic P1 78 s: ~5%).
- Lessons: short (45 s) works — 4× more people reach the end; the mid-video share line costs ~10% and got 0 shares →
  never put a CTA in the middle; share ask goes in the caption/pinned comment or in the last 2 s only.
- Part 6 at ~3 h: 894 views / 645 viewers, curve jumped up at ~2.5 h (second wave, well above typical), IG badge
  "more comments than nearby Reels in the first 3 h". Skip 27.0%, likes 3.2%, comments 0.9% (7), saves 1, shares 0,
  follows 2, avg 19 s / 44 s. Comments are the signal that opened the second wave → reply to every comment fast.
- Part 6 at ~4 h: 1,420 views / 1,152 viewers (Titanic P1 needed 8 h for 1,071), still climbing steeply; skip 30.7%,
  likes 35 (3.0%), comments 9, saves 4, shares 0, avg 20 s. Profile visits 19 → follows 3. 99.8% non-followers, US 40%.
  Skip moments: the only real skip spike is 0:00–0:03 (~30%); almost nobody skips mid-video. → the 45 s format works;
  the remaining lever is the first 3 s, and the profile (19 visits → 3 follows) should explain both series.
- Titanic P3 fix (26 Oct): user spotted realistic human silhouettes/skin in 3 shots (x3 officer crowd, x6 glove arm,
  ep02 w6 crewman). RULE: every image with people gets the hero sheet as a reference + "every person has a round pure
  white head, no skin color, white glove hands, no realistic humans"; check each image for skin/realistic faces before render.

## 31. ALTIN KURAL (27 Oct, kullanıcı): ilk saniyede izleyiciye SORU sor
Sorun: bütün açılışlarımız bir DURUM ANLATIYORDU ("You won $50M…", "You're on the sinking Titanic…"). İzleyici seyirci
kalıyor ve ilk 3 sn'de ~%30–40'ı gidiyor. Rakipler izleyiciye doğrudan bir karar sorusu soruyor ("What would you do?",
"Would you take it?", "Can you survive this?") → izleyici kafasında cevap vermeye başlıyor ve hikâyenin içine giriyor.

Uygulama (her bölüm, iki seri):
1. 0.0 sn: ses ve ekran AYNI ANDA bir soruyla başlar. Önce soru, sonra bağlam. Ses öncesinde efekt/boşluk yok.
2. Soru: "you" + ikili karar + yüksek bedel; 1,5 sn'de okunur (≤8 kelime ekranda). Örn. "Would you…?", "What would you do?",
   "Could you say no?", "Would you survive?". Cevabı bilmek için izlemek gerekir.
3. Ekranda dev soru metni (frame 0, ortada, thumbnail'de okunur) + parlak tek görsel. Sayaç/ HUD sonra.
4. Hemen ardından (≤2 sn) soruyu doğuran durum: "Because right now…" — yeni olay, özet değil.
5. Oylama aynı soruyla kapanır (callback): videonun başında kafasında cevap veren izleyici yorumda yazar.
6. Her bölüm 2–3 soru alternatifi yazılır, en kısa/en kişisel olan seçilir. Kontrol sorusu: "Bunu duyunca cevap vermeden
   geçebilir miyim?" Geçebiliyorsam soru zayıf.

## 32. ONAY SÜRECİ (27 Oct, kullanıcı kuralı) — her bölüm, iki seri
1. Önce hikâyenin TÜRKÇE metnini yaz: açılış sorusu (2–3 seçenek), sahne sahne akış, gerçek bilgi, ters köşe,
   oylamadan önceki merak sahnesi, oylama seçenekleri, kapanış. Görsel listesi ve tahmini süre/kredi.
2. Kullanıcıya gönder ve BEKLE. Onay gelmeden görsel, ses veya render üretme (kredi harcama yok).
3. Değişiklik istenirse birlikte düzenle, son hali tekrar göster.
4. Onaydan sonra: İngilizce seslendirme metni → görseller → ses → render → paket (video, kapak, metinler).

## 33. Titanic P3 data (~12 h IG) — series trend is down
- P3: 347 views / 308 viewers, skip 49% (P1 33%, P2 41%), likes 0.6%, 0 comments, 0 shares/saves, avg 15 s / 41 s,
  below typical. Retention: 100→~55% by 0:03, ~45% at 0:06, then FLAT ~38% to 0:38 → story holds, the opening loses.
- Same 45 s format worked for NCK P6 (skip 21–30%). Difference = the opening promise: NCK frame 0 = universal fantasy
  ("YOU WON $50,000,000"); Titanic P2/P3 frame 0 = a plot only returning viewers understand (bag, lady, bowler hat),
  dark night images, "PART 3" text. Vote words CLIMB/GRAB also need backstory → 0 comments.
- Conclusion: each Titanic part must work for someone who never saw Part 1 (self-contained dilemma + survival stakes),
  open with a question (§31), bright first frame, no part number on frame 0.
- 27 Oct correction (user): NCK is NOT proven either (ceiling ~1,500). Competitors hit millions on their first video by
  putting the viewer inside the story with a question in the first second. From now on §31 is the core of every episode.
- 27 Oct (user): after the question hook the story must MOVE — viewers want the answer fast. Part 7 cut 52 s → 43.7 s:
  pauses inside lines ≤0.22 s, gap between lines 0.12 s, voice tempo ×1.12, redundant line removed, a cut every ~1.4 s.
  Rule: max 45 s; no line exists only to "explain"; every line moves the answer to the opening question closer.

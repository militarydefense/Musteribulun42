# Küresel Müşteri Bulucu – Av & Spor Silahları (GTİP 9303)

Dünya genelinde silah mağazalarını, av malzemesi bayilerini ve distribütörleri bulan,
iletişim bilgilerini (telefon, e-posta, web sitesi, sosyal medya) toplayıp tek listede
yöneten, Türkçe arayüzlü web tabanlı program.

## Özellikler

| Modül | Ne yapar | Kaynak |
|---|---|---|
| **Google Maps taraması** | Seçilen ülkelerde (veya şehirlerde) "gun shop" ve yerel dildeki karşılıklarıyla (Waffengeschäft, armurerie, armería, оружейный магазин…) işletmeleri bulur. Ülke haritası ızgaralara bölünür, yoğun bölgeler otomatik olarak alt bölgelere ayrılır, böylece 60 sonuç sınırı aşılır. | Google Places API (New) |
| **E-posta bulucu** | Bulunan her firmanın web sitesini (ana sayfa + iletişim / künye / hakkımızda sayfaları) tarar; e-posta, telefon, Facebook, Instagram, YouTube, LinkedIn, WhatsApp, Telegram vb. bağlantılarını çıkarır. Gizlenmiş e-postaları (`info [at] firma [dot] com`, Cloudflare koruması) çözer. | Firmaların kendi web siteleri |
| **GTİP pazar analizi** | 9303 (ve 9302, 9304, 9305, 9306, alt pozisyonlar) için ülkelerin yıllık ithalat hacmini, dünya payını, **Türkiye'den aldıkları tutarı ve payı** gösterir. Seçilen ülkeler tek tıkla Google Maps / sosyal medya taramasına aktarılır. | UN Comtrade |
| **Sosyal medya derin tarama** | Facebook, Instagram, LinkedIn, TikTok profillerini ve web sonuçlarını ülke + anahtar kelimeyle bulur; YouTube kanallarını abone sayısı, açıklama ve açıklamadaki e-postalarla birlikte çeker. Instagram işletme hesaplarının biyografi / web sitesi / takipçi bilgisi Meta API ile eklenebilir. | Serper.dev veya SerpApi, YouTube Data API v3, Meta Graph API |
| **Müşteri listesi (CRM)** | Filtreleme (ülke, kaynak, durum, e-postası olanlar), sıralama, durum takibi (Yeni → İletişime geçildi → Teklif verildi → Müşteri), notlar, **Excel / CSV dışa aktarma**. | – |
| **Harita & panel** | Tüm firmaları dünya haritasında kümeler halinde, ülke bazında istatistiklerle gösterir. | OpenStreetMap |
| **Ambargo uyarısı** | BM / AB / ABD silah ambargosu bulunan ülkeler ⚠ ile işaretlenir; tarama öncesi onay ister. | Dahili liste |

## Kurulum

**Gereksinim:** Python 3.10+ ([python.org](https://www.python.org/downloads/) – Windows'ta kurarken "Add to PATH" işaretleyin).

- **Windows:** `baslat.bat` dosyasına çift tıklayın. İlk açılışta gerekli paketler kurulur, tarayıcıda `http://localhost:8000` açılır.
- **Mac / Linux:** `./baslat.sh`
- **Sunucu (Docker):** `docker build -t musteri-bulucu . && docker run -d -p 8000:8000 -v $(pwd)/data:/app/data musteri-bulucu`

Veriler `data/musteriler.db` dosyasında saklanır (yedeklemek için bu dosyayı kopyalamanız yeterli).

## 📱 Cep telefonundan kullanım

Arayüz telefona tam uyumludur: alt menü çubuğu, kart görünümlü müşteri listesi, dokunmatik butonlar.
Telefonda **"Ana ekrana ekle"** yapınca normal bir uygulama gibi simgesiyle, tam ekran açılır
(iPhone: Safari → Paylaş → *Ana Ekrana Ekle* · Android: Chrome → ⋮ → *Uygulamayı yükle*).
Giriş şifre ile yapılır ve oturum 30 gün açık kalır.

### A) Aynı Wi-Fi ağında (ofiste / evde) – en kolay yol
1. Bilgisayarda **`baslat-telefon.bat`** (Mac/Linux: `./baslat-telefon.sh`) dosyasını çalıştırın.
   Windows Güvenlik Duvarı sorarsa *Özel ağlar* için **İzin ver** deyin.
2. Konsolda yazan **panel şifresini** not edin (Ayarlar'dan değiştirebilirsiniz).
3. Bilgisayarda **Ayarlar → 📱 Telefondan erişim** bölümündeki **QR kodu** telefon kamerasıyla okutun.

Bilgisayar açık ve program çalışır durumda olmalıdır.

### B) Her yerden (4G/5G, yurt dışı) – bulut sunucusu
Bilgisayar kapalıyken de çalışır, taramalar sunucuda devam eder. Üç seçenek:

| Seçenek | Zorluk | Aylık maliyet (yaklaşık) |
|---|---|---|
| **Render.com** – proje dosyalarını özel bir GitHub deposuna yükleyin → Render'da *New → Blueprint* → depoyu seçin → `PANEL_PASSWORD` girin. `render.yaml` her şeyi otomatik kurar, HTTPS adresi verir (ör. `https://musteri-bulucu.onrender.com`). | Kolay | ~$7 + disk ~$0,25 |
| **Kendi VPS'iniz** (Hetzner, DigitalOcean, Turhost vb.) – `docker-compose.yml` ile alan adınızda otomatik HTTPS: `.env` içine `ALAN_ADI=` ve `PANEL_PASSWORD=` yazıp `docker compose up -d`. | Orta | ~$5 |
| **Cloudflare Tunnel** – bilgisayarınızda program çalışırken `cloudflared tunnel --url http://localhost:8000` komutu geçici bir HTTPS adresi verir (sunucu gerekmez). | Kolay | Ücretsiz |

İnternete açık modda (`APP_PUBLIC=1`, tüm sunucu kurulumlarında otomatik) şifresiz giriş mümkün değildir;
şifre girilmemişse program rastgele bir şifre üretip sunucu kayıtlarına yazar. Yanlış şifre denemeleri yavaşlatılır.

## API anahtarları (Ayarlar sekmesi)

1. **Google Maps Platform** (zorunlu – Maps taraması için)
   [console.cloud.google.com](https://console.cloud.google.com) → proje oluştur → *APIs & Services → Library* →
   **Places API (New)**, **Geocoding API**, **YouTube Data API v3** etkinleştir → *Credentials → API key*.
   Faturalandırma hesabı gerekir. Text Search (Pro) yaklaşık **$32 / 1000 istek**; Google her ay belirli bir ücretsiz kullanım tanır.
   Program her taramadan önce tahmini çağrı sayısı ve maliyeti gösterir, "Maks. API çağrısı" ile üst sınır koyabilirsiniz.
2. **Serper.dev** (Facebook / Instagram / LinkedIn / TikTok araması için) – [serper.dev](https://serper.dev) üzerinden ücretsiz kayıt, ilk 2.500 sorgu ücretsiz. Alternatif: SerpApi.
3. **Meta Graph API** (isteğe bağlı) – Instagram işletme hesaplarının biyografi/web sitesi bilgisini çekmek için kendi Instagram işletme hesabınıza bağlı erişim anahtarı ve IG kullanıcı ID'si.
4. **UN Comtrade** (isteğe bağlı) – anahtarsız ücretsiz önizleme kullanılır; daha fazla veri için [comtradedeveloper.un.org](https://comtradedeveloper.un.org).

## Önerilen iş akışı

1. **GTİP Pazar Analizi** → 9303 → *Analiz Et* → en çok ithalat yapan ülkeleri inceleyin → *İlk 20'yi seç* → *Google Maps'te tara*.
2. **Google Maps Taraması** → terimleri kontrol edin → *Taramayı Başlat*. Tarama bitince web siteleri otomatik taranıp e-postalar eklenir.
3. **Sosyal Medya** → aynı ülkeler için Facebook / Instagram / YouTube taraması.
4. **Müşteri Listesi** → "E-postası olanlar" filtresi → *Excel indir* → CRM'inize veya e-posta aracınıza aktarın.

İlerlemeyi **İşler** sekmesinden canlı izleyebilir, istediğiniz zaman durdurabilirsiniz.
Aynı firma farklı taramalarda tekrar bulunursa çift kayıt oluşmaz; eksik bilgiler birleştirilir.

## Bilinmesi gerekenler

- **GTİP ile firma araması:** Firma bazlı gümrük (ithalatçı) kayıtları herkese açık değildir. Program GTİP kodunu
  (1) ülke bazında pazar büyüklüğü analizi ve (2) koda karşılık gelen ürün terimleriyle firma araması için kullanır.
  ImportGenius, Panjiva, Volza gibi ücretli ticaret veritabanlarından alınan listeler Excel'den içe aktarılacak şekilde genişletilebilir.
- **Sosyal medya:** Facebook ve Instagram, giriş gerektiren içeriklerin otomatik kazınmasını kullanım koşullarıyla yasaklar ve hesap kapatabilir.
  Bu nedenle program yalnızca resmi API'leri ve herkese açık arama sonuçlarını kullanır.
- **Yasal:** 9303 ihracatı MSB ve Ticaret Bakanlığı izinlerine tabidir; alıcının ülkesindeki ithalat lisansını doğrulayın.
  Toplanan e-postalar kişisel veri sayılabilir (AB'de GDPR, Türkiye'de KVKK): toplu gönderimlerde firmaya özel, ilgili teklif
  gönderin, kaynağı belirtin ve abonelikten çıkma seçeneği sunun.

## Dosya yapısı

```
app/main.py      Web sunucusu ve API uçları
app/places.py    Google Places taraması (ızgara + otomatik bölme)
app/crawler.py   Web sitelerinden e-posta / telefon / sosyal medya çıkarımı
app/social.py    YouTube, Facebook, Instagram, LinkedIn, TikTok araştırması
app/comtrade.py  UN Comtrade GTİP ithalat analizi
app/gtip.py      GTİP kodları, çok dilli arama terimleri, ambargo listesi
app/jobs.py      Arka plan işleri
app/db.py        SQLite veritabanı
static/          Türkçe web arayüzü
```

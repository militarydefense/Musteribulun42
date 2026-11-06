# Google Earth uzaydan yakınlaşma (Shorts)

`gobeklitepe_short.mp4` bu betiklerle üretildi: 1080x1920, 60 fps, 30 saniye.

## Neden ekran kaydı değil?
Bulut makinesinde ekran kartı yok, Google Earth işlemciyle çiziliyor. Gerçek zamanlı kayıtta
kareler düşüyor (takılma) ve uçuş sırasında görüntüler yetişmiyor (bulanıklık). Bu yüzden:

1. **`capture_stills.js`**: Google Earth'ü 2x çözünürlükte açar, etiketleri kapatır ("Clean")
   ve 400 m'den 52.000 km'ye kadar 35 yükseklikte (her adım ×1,41) tepeden fotoğraf çeker.
   Her fotoğraf, görüntü tamamen yüklenip sabitlenene kadar beklenerek alınır (`plan.json`).
2. **`zoom.py register`**: Ardışık fotoğrafları OpenCV ECC ile hizalar (eşleşme ≈ %99).
3. **`zoom.py render zoom_raw.mp4`**: `path.json`'daki kamera yolunu izleyerek 60 fps kare
   üretir. Her karede en net fotoğraf kullanılır, seviyeler yumuşak kenarlarla birleştirilir.
4. **`final.py çıktı.mp4`**: Ekran yazılarını, "Görüntü: Google Earth" atfını ve ses
   tasarımını (uğultu, rüzgâr, iniş vuruşu) ekler.

Çalıştırma sırası (`stills/` klasörü ile aynı dizinde):
```
node capture_stills.js
python3 zoom.py register
python3 zoom.py render zoom_raw.mp4
python3 final.py gobeklitepe_short.mp4
```
Gerekenler: Playwright + Chromium, Python 3, `opencv-python-headless`, `numpy`, ffmpeg.

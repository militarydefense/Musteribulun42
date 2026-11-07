# Pripyat film (pripyat_short_en.mp4) – 1080×1920, 60 fps, 29.1 s
Pipeline: AI plates (ChatGPT) → Depth-Anything-V2 depth (`depth.py`) → `render25d.py` 2.5D renderer:
parallax camera (dolly/truck/pedestal, iterative depth lookup), depth-based aerial perspective with
pre-baked scattering, camera-driven shutter motion blur (per-pixel camera vectors, taps only when the
camera moves), 1.5× supersampled float buffer, one post pass: quarter-res bloom → ACES → grade → grain → vignette.
~0.7 s/frame on 4 CPU cores (2 processes in parallel).
Real footage: Google Earth zoom (`zoom.py`) and Nikolai Fomin's Street View photosphere at the wheel
(lifted framing to exclude nav arrows and a third-party logo). Music: `compose_dark.py`. Assembly: `build.py`.

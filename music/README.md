# zoomtosecrets theme

`zoomtosecrets_theme.mp3`: original 31-second melodic EDM cue (G minor, 140 BPM).
Builds up during the zoom, drop at 19.45 s for the dive into the ground view.

It is generated entirely in code by `compose.py` (oscillators, filters and
noise only, no samples or third-party recordings), so the channel owns it and
it can be used in any video without credit.

```
python3 compose.py track.wav 31.0      # length in seconds as 2nd argument
```
Use it in a video: `MUSIC=track.wav python3 tools/google-earth-zoom/assemble.py final en out.mp4`

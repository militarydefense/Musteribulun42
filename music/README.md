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

## zoomtosecrets_trend.mp3
Original dark, bass-heavy club/phonk-style groove (100 BPM, B♭ minor), made by
`compose_trend.py` from oscillators and noise only. Eerie intro under the hook
(0-3 s), groove from 3 s, drop at 22.2 s.
```
START=3.0 DROP=22.2 python3 compose_trend.py trend.wav 35.0
```

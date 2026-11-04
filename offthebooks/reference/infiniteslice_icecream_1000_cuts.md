# @infiniteslice01 — "Ice Cream vs 1000 cuts" (5 screen recordings, 4 Nov) — 0.1 s breakdown

Recordings: 14.0 + 14.0 + 14.0 + 14.0 + 8.7 s, 1080x1920, 30 fps. Read frame by frame at 10 frames/s (every 0.1 s, 630 frames),
key frames at full size, audio onsets and loudness per 0.5 s. The recordings are back to back; times below are per recording (R1–R5).
Video stats visible on screen: 1,774 likes · 28 comments · 72 reposts · 151 shares.

## Look
- Object: an ice-cream sandwich (brown cookie top and bottom with dots, a thick cream layer), long rectangle, ~70% of the frame width.
- Board, dark counter, dark green brick wall — the same stage as our videos. Big chef's knife with motion-blur "ghost" copies when fast.
- Text: big white cut number + gold "CUTS" at the top; "0 / CUBES" at the bottom, which stays 0 until cubes exist.
  Above ~100,000 the cube count is shown rounded with "≈" (≈ 67,000 … ≈ 26,780,000).
- No camera push, no camera move at all. Rounds change with a hard cut (no slide).

## Cut logic (only 2 directions, not 3)
1. **Lengthwise**: the knife cuts slices across the length. Every slice is pushed a little away from the next: **real gaps open
   between the slices**, the block visibly falls apart into slabs (ours only draws lines).
2. The knife turns flat along the length (~0.5–1.0 s), then **crosswise** from the front: each stroke cuts off a row; the row
   breaks into cubes that **tip over and spread flat on the board** (not a cone). By the end the whole board is covered by an
   even carpet of tiny cubes (cream white with brown cookie bits).
- Cube count = (lengthwise slices) × (crosswise rows): round 10 = 6×6 = 36, round 50 = 26×26 → 4,040 … round 1000 ≈ 26,780,000.

## Timeline at 0.1 s
### R1 (0.0–14.0 s) — round 10, then round 50
| t (s) | cuts | cubes | what happens |
|---|---|---|---|
| 0.0 | 1 | 0 | first cut already landing in the first frame |
| 0.0–1.5 | 1→5 | 0 | 5 lengthwise cuts, ~0.35 s each, slices open up with gaps |
| 1.5–2.5 | 5 | 0 | knife lies flat along the front edge (turn) |
| 2.5–4.0 | 6→9 | 6→24 | crosswise rows break off, cubes tip over toward the camera |
| 4.0–4.8 | 10 | 30→36 | last row, hold on 10 cuts / 36 cubes |
| 4.9 | 0 | 0 | hard cut to a new sandwich (round 50) |
| 4.9–9.0 | 1→25 | 0 | 25 lengthwise cuts, ~0.16 s each, blurred knife |
| 9.0–10.2 | 25 | 0 | turn |
| 10.2–13.9 | 26→49 | 148→3,736 | crosswise; cubes spread over the board |
### R2 (0.0–14.0 s) — end of 50, round 100
| 0.0–0.5 | 49→50 | 3,892→4,040 | end of round 50, hold ~0.4 s |
| 0.6 | 1 | 0 | hard cut, round 100 |
| 0.6–4.6 | 1→50 | 0 | 50 lengthwise cuts (~0.08 s each) |
| 4.6–5.6 | 50 | 0 | turn |
| 5.6–9.7 | 51→100 | 180→27,629 | crosswise |
| 9.7–10.1 | 100 | 27,629 | hold |
| 10.2 | 0 | 0 | hard cut, round 250 |
| 10.2–14.0 | 3→69 | 0 | lengthwise |
### R3 — round 250
| 0.0–2.2 | 71→125 | 0 | lengthwise ends at 125 |
| 2.2–3.4 | 125 | 0 | turn |
| 3.4–8.5 | 128→250 | ≈5,000→≈410,000 | crosswise; "≈" rounding starts |
| 8.6 | 0 | 0 | hard cut, round 500 |
| 8.6–14.0 | 8→195 | 0 | lengthwise |
### R4 — round 500
| 0.0–2.0 | 242→250 | 0 | lengthwise ends at 250 |
| 2.0–2.5 | 250 | 0 | turn |
| 2.5–7.6 | 269→494 | ≈212,000→≈3,282,000 | crosswise |
| 7.7 | 0 | 0 | hard cut, round 1000 |
| 7.7–14.0 | 0→492 | 0 | lengthwise, ~0.012 s per cut (pure blur) |
### R5 — round 1000
| 0.0–0.1 | 494→500 | 0 | lengthwise ends |
| 0.1–1.4 | 500 | 0 | turn |
| 1.5–7.5 | 503→1,000 | ≈17,000→≈26,780,000 | crosswise, board fills with a white carpet |
| 7.5–8.7 | 1,000 | ≈26,780,000 | hold (~1.2 s) |

## Sound
- No music, no voice. Round 10: single chops every ~0.4 s (audible board knocks). From round 50 on: a continuous dense chopping
  texture at constant loudness; short silences (~0.3–0.6 s) only at the hard cuts between rounds.

## Round lengths (approx.)
10: ~4.9 s · 50: ~9.7 s · 100: ~9.6 s · 250: ~12 s · 500: ~13 s · 1000: ~14 s → ~63 s total. Ours: 43.7 s.

## Differences from our videos (what makes theirs more pleasant to watch)
1. Slices really separate (gaps) during the lengthwise phase → the object visibly falls apart from the first cut.
2. Cubes spread into a flat, even carpet over the board; ours pile into a cone.
3. Bottom counter is CUBES and stays 0 until the crosswise phase → a second "explosion" moment when it starts climbing.
4. Longer rounds (the big rounds 12–14 s), no camera move, hard cuts between rounds.
5. Only 2 cut directions (no horizontal layer cut).

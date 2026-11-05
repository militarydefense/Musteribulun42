# State: Merer'in Defteri (Quick mode)

Read this first in a new session, after loading the cinecode skill (Claude Code: the Skill tool, never a plain read of SKILL.md), then `python3 /root/.claude/skills/cinecode/scripts/init_film.py . --update-tools` silently (the kit's newest tools). Kit: /root/.claude/skills/cinecode · Method: `/root/.claude/skills/cinecode/references/quick-mode.md`

- **Phase:** 4 Draft (v2 delivered)  <!-- 1 Questions · 1b Research (if chosen) · 2 The card (text gate) · 3 Two scenes as stills (gate) · 3b The rest · 4 Draft · 5 Revisions on drafts (max 2) · 6 Final render · delivered -->
- **Format source:** <none · saved format name (FORMAT.md)>
- **Purpose:** cinematic (`/root/.claude/skills/cinecode/references/purpose-cinematic.md`)
- **Idea:** Piramitler ile ilgili yeni bir film (user) → picked: one block's journey, from Merer's logbook (Wadi al-Jarf papyri): a crew hauls Tura limestone across the flooded Nile to Giza; the logbook's dry entries as cards (s2)
- **Medium:** Hareketli grafik (motion design)
- **Curiosity:** 0–2 s: who writes these red day numbers, and what do they count? · held: the cargo is only 'bir taş' until 21.6 s · paid 21.6–26.4 s: the block becomes the pyramid's white casing, and 26.4 s: this is the oldest papyrus, found 2013
- **Format:** 30 s, 9:16, 1080x1920, 30 fps · **Loop:** no · **Delivered to:** Reels · TikTok · Shorts
- **Look · mood:** authored: Merer'in defteri (papyrus, black ink, red rubrics; the map is drawn in ink on the logbook) · dry, patient, proud
- **Director card:** <code fit (how each thing is seen) · structure · look · palette hex with roles and how colour is laid · atmosphere, one line per place · light arc · camera character · motion per kind · tempo, BPM and cut rhythm · music (genre, key, progression, groove, lead, arc) · transitions · motion design devices and the job each does (motion-design.md; or none, and why) · finish per scene (finish.md: the devices each scene takes, and the ones left off where they would hurt) · ending · signature and where · checks (seconds and what each proves) · changes the user made> · **Finishing:** <none · motion blur · print tone · gate weave>
- **Type:** apfel-editorial: Newsreader (entries) + Apfel Grotezk (day numbers, labels) · user's reason: picked by the card · no rule breaks · no captions
- **Sound (Q4):** music + SFX, no words · **Voice:** none
- **Music:** recording: `audio/music.wav` (cut from `assets/music/kitchen-percussion-dance.wav`, SpaceMonk, CC BY, 2.391 s → 32.391 s), BPM 100.10, bar 2.398 s (user)
- **Sound identity:** <one line, fitted to Q4>
- **References (Q5):** search · research/boat (Met/AIC boat models), research/pyramid (casing stone, BM) · papyrus palette from research/look-4
- **Chapters (internal, over 60 s only):** <C1 0:00-0:20 · → C2 via … > · **Motifs:** <what travels and how it transforms>
- **Beats:** <t0 beat · subject action · camera line · transition (one line each, or "see below")>
- **Key moments:** <2–4: time · what the film rests on there · its sound moment> · **Thesis line:** <the chosen wording> · **Ending:** <how it closes>
- **On-screen names:** <labels for places, products or people, or "none">
- **Sound design:** <ambience per scene · SFX cues · ROOM · arrangement (sections × parts) · lead timbre>
- **Last output:** renders/draft-v2.mp4 (half size, no finishing) · checks: hook PASS · action 2 CHECK (hook, turn) · sound flags kept: buried, all code, late (archives blocked) · listening note sent yes
- **Open notes:** <notes/round-N.md: the open items, or none>
- **Revision round:** 0 of 2 <!-- a re-plan (new scenes or a new length) is shown as a new plan + one still per scene; it does not count as a round -->
- **Re-plans:** <none · date: what changed, stills approved>
- **Next action:** <one line>

## Log
| Date | What | File |
|---|---|---|

## The card (v1)
Logline: one limestone block's trip from Tura to Giza, told only by Merer's dry logbook entries; the turn is that "bir taş" is the pyramid's white skin, and the log itself is the oldest papyrus ever found.
Form: one continuous shot across one papyrus page; the camera follows the boat along an ink map that draws itself. Bars at 2.40 · 4.80 · 7.19 · 9.59 · 11.99 · 14.39 · 16.78 · 19.18 · 21.58 · 23.98 · 26.38 · 28.77.
Beats:
- 0.0–2.4 hook: a red reed stroke writes "Gün 25" across the frame, macro, crane down onto the papyrus; brush scratch + first drum hit.
- 2.4–7.2 Tura: the ink map draws the cliff; a block outline is cut from its hatching, chisel ticks on beats; card "Tura'da taş yükledik." push-in.
- 7.2–12.0 boat: ink boat drawn in one line, 40 tick marks become the crew; the flood floods the map in a blue wash under the hull; card "Ekip: kırk kişi. Yük: bir taş." track right with the boat.
- 12.0–16.8 night at She-Khufu: the papyrus darkens to umber, stars as ink dots, the boat rocks; card "Geceyi Khufu Gölü'nde geçirdik." locked hold, water lap.
- 16.8–21.6 morning: day returns as a wipe of light; a triangle rises on the horizon line; card "Sabah Akhet-Khufu'ya yelken açtık." pull-back.
- 21.6–26.4 turn: the block slides into the pyramid's face and turns white; the whole face fills with thousands of small white blocks, one per trip; card "Bir taş. Sonra binlercesi." freeze frame on the bar at 23.98.
- 26.4–30.0 end: crane up off the page: it is a torn papyrus fragment; card "Merer'in defteri, MÖ 2560 civarı. Bulundu: 2013." music fades on the bar.
Director card: code fit: everything is ink on papyrus (2D canvas, no GPU needed): the boat after the Met/AIC models in side profile, the crew as tally strokes, the pyramid as a hatched triangle that becomes white casing; no realistic people. Palette: papyrus #D8C39A ground, ink #1E1A16 lines, red ochre #A8342A day numbers and route, Nile wash #3F6F8C water, casing white #F2EEE4, night umber #5A4632. Atmosphere: Tura cliff in dry hatch; river in wet wash that bleeds at its edges; night as a darker multiply over the papyrus fibres. Light arc: day → night umber at 12.0 → day wipe at 16.8 → casing white glow at 21.6. Camera: flat planes (CAM), calm and held, signature crane down (hook, turn, reversed at the end). Motion: ink strokes draw on with ease-out, the boat bobs softly, cards write in letter by letter then hold 2 s. Tempo: standard, cuts none (one shot), beats on bars at 100.1 BPM. Sound: brush scratch, chisel tick, rope creak, water lap, night insects, a deep stone thud at 23.98. Finishing: papyrus fibre texture + light grain; motion blur, print tone, gate weave off. Signature: the red rubric stroke returns at each new day and as the final date. Checks: 1.0 s red stroke reads at 9:16; 9.0 s boat and 40 ticks read; 23.98 s freeze, white face legible; 28.0 s end card fits.

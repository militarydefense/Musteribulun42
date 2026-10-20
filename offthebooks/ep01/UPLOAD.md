# Off The Books — Part 1: The Number Is a Lie

**File:** `Off_The_Books_Part1.mp4` (84.7 s, 1080×1920, -14 LUFS). The last 0.2 s is the cover frame; drag the cover slider to the end.

**Title**
```
You Won $50 Million. You Get $14 Million. 🎟️ | Nobody Can Know, Part 1
```

**Description**
```
You just won $50,000,000. Nobody can know. Part 1 of a daily story where YOU decide what happens next.

Every rule in the story is real:
• The advertised jackpot is paid over 30 years. The cash option is far less (≈ $22M on a $50M Mega Millions jackpot, Jul 2026).
• 24% federal withholding on prizes over $5,000. The top federal rate is 37%.
• In most states your name becomes public record. The state where the ticket was sold decides.

👇 Comment QUIT or STAY. The majority writes Part 2.

Fiction for entertainment. Not financial, tax or legal advice.

#lottery #money #personalfinance #story #shorts
```

**Pinned comment:** `QUIT or STAY? 👇 The majority writes Part 2. Votes close in 20 hours.`
**Community poll:** `Part 1: Your boss just asked you to stay late. → QUIT / STAY`

**Checklist:** Language English · Not made for kids · Altered/synthetic content: AI-generated cartoon stills, not realistic, disclosure not required (check the current YouTube rule) · Category Entertainment · Schedule 19:00 ET (02:00 TR)

## Rebuild
```
python3 -I ../engine/align.py assets/narration.mp3 script.json build 1.12
python3 -I ../engine/build.py .
node ../engine/render.js build
python3 -I ../engine/mix.py build
bash ../engine/finalize.sh build assets/thumbnail.png Off_The_Books_Part1.mp4
```
Voice: Pollo / MiniMax speech-2-8-hd, `English_Deep-tonedMan`, sped up 1.12×. Stills: gpt-image-2-5 with `assets/lucky_sheet.png` as reference.

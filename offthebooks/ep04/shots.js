// Off The Books — Part 4 "On Tape" (RECORD).
// Built on the lessons of both competitors: a counter moving on frame one, the vote as a race,
// in-story UI on top of every scene (nothing holds still for 2 s), one big word captions,
// a planted clue (contradiction box), a broken rule with a price, a second threat, choices with consequences.
/*UI*/

loadImages(['r1', 'r3', 'r4', 'r6', 'r7', 'r8', 'r11', 's4', 'p5', 'p7', 'p8', 'p10', 'q1', 'q2', 'q6', 'q7', 'q8', 'q11', 'q12', 'q14', 'q15', 'q16']);
const NO_CAPTION = new Set(['black']);
const CAPTION_MODE = 'word';
const KEY_WORDS = new Set(['HALF', 'FRIDAY', 'RECORD', 'RECORDING', 'TAPE', 'EXTORTION', 'SIGNATURE', 'ALONE', 'NOBODY', 'CLOUD', 'BROKE', 'ORIGINAL', 'LOCK', 'BAIT', 'NAME', 'EVERYONE']);

const CHOICES = [['LOCK', 'Change the password. He knows you know.'], ['BAIT', 'Leave it open. Feed him a fake photo.']];

const SHOTS = {
  // 0–5 s: counter moves on frame one, premise in the first sentence, threat with a number
  hook: beats([['r1', .5, .42, 1.0], ['p8', .5, .45, 1.1], ['q16', .5, .45, 1.05]],
    { cuts: () => [at('hook', 'nobody'), at('hook', 'boss')],
      after: t => {
        infoBox(t, 0, at('hook', 'nobody'), 150, 'YOU JUST WON', t => usd(count(t, .05, .95, 0, 50e6, easeOut)), { size: 80 });
        stamp('NOBODY CAN KNOW', W / 2, 820, 92, C.red, pop(t, at('hook', 'nobody'), .3) * clamp((at('hook', 'boss') - t) / .15), -.06);
        nameTag(t, at('hook', 'boss') + .1, S('vote'), 70, 330, 'YOUR BOSS', 'MR. GRANT', 'WANTS HALF. DEADLINE: FRIDAY');
        pill('HALF = $6,930,000', 1240, t, at('hook', 'half') - .05, { bg: C.red, fg: C.white });
      } }),
  // the vote as a race, broken by the top comment
  vote: beats([['q1', .5, .45, 1.15], ['p10', .5, .45, 1.1], ['q12', .5, .42, 1.05]],
    { cuts: () => [at('vote', 'top'), at('vote', 'record')],
      after: t => {
        voteRace(t, S('vote'), [['RECORD', .5, '3 VOTES'], ['BOTH', .5, '3 VOTES']], 'TIED', at('vote', 'tied'), at('vote', 'top'));
        commentCard(t, at('vote', 'top') - .05, 'TOP COMMENT · PART 3', '"Record him"', 360, E('vote') + .1, 4);
        stamp('RECORD WINS', W / 2, 760, 96, C.gold, pop(t, at('vote', 'record'), .3), -.06);
      } }),
  pocket: beats([['q6', .5, .5, 1.05], ['q14', .5, .5, 1.0], ['q14', .55, .62, 1.5]],
    { cuts: () => [at('pocket', 'so'), at('pocket', 'recording')],
      after: t => {
        commentCard(t, S('pocket') + .05, 'YOUR IDEA · PART 3', '"jacket pocket"', 360, at('pocket', 'phone'));
        waveStrip(t, at('pocket', 'recording'), E('pocket') + .1, 1180);
      } }),
  door: beats([['r3', .5, .5, 1.0], ['r3', .42, .55, 1.5], ['r3', .64, .42, 2.0]],
    { push: .12, cuts: () => [at('door', 'knock'), at('door', 'doesnt')],
      after: t => infoBox(t, S('door') + .05, at('door', 'knock') + .3, 350, 'WEDNESDAY', [['9:02', C.gold], [' A.M.', C.white]], { type: true, w: 520 }) }),
  bossA: beats([['r4', .5, .45, 1.0], ['r4', .45, .3, 1.6]],
    { push: .16, cuts: () => [at('bossA', 'or')],
      after: t => waveStrip(t, S('bossA'), E('bossA'), 1180) }),
  tape: beats([['q12', .5, .45, 1.0], ['q12', .5, .38, 1.35]],
    { cuts: () => [at('tape', 'extortion')],
      after: t => {
        stamp('EXTORTION', W / 2, 760, 110, C.red, pop(t, at('tape', 'extortion'), .3), -.06);
        pill('✓ ON TAPE', 1240, t, at('tape', 'tape') - .1);
      } }),
  bossB: beats([['p8', .5, .45, 1.05], ['p8', .5, .4, 1.45]], { push: .2, cuts: () => [at('bossB', 'signature')] }),
  // the planted clue
  slip: beats([['q7', .5, .5, 1.0], ['q7', .55, .62, 1.6], ['r8', .5, .42, 1.1]],
    { push: .12, cuts: () => [at('slip', 'midnight'), at('slip', 'nobody')],
      after: t => contra(t, at('slip', 'nobody') - .05, E('slip') + .1, ['YOU SIGNED IT', 'ALONE'], ['HE SAW', 'THE SIGNATURE']) }),
  how: beats([['q8', .5, .5, 1.0], ['r6', .5, .45, 1.0], ['r6', .3, .42, 1.8], ['r7', .5, .45, 1.05], ['r7', .5, .32, 1.5]],
    { cuts: () => [at('how', 'both'), at('how', 'cloud'), at('how', 'same'), at('how', 'work')],
      after: t => {
        typedList(t, at('how', 'both') - .1, E('how') + .1, 350, 'HOW HE SAW IT', [
          [at('how', 'both'), [['1. You ', C.white], ['photographed', C.gold], [' the ticket', C.white]]],
          [at('how', 'cloud') - .2, [['2. It backed up to your ', C.white], ['CLOUD', C.gold]]],
          [at('how', 'same') + .1, [['3. ', C.white], ['OFFICE PC', C.red], [': still signed in', C.white]]]]);
      } }),
  rule: beats([['r6', .3, .42, 1.8], ['r7', .5, .45, 1.0], ['r7', .5, .32, 1.5]],
    { cuts: () => [at('rule', 'personal'), at('rule', 'you')],
      after: t => {
        overlayTag(t, S('rule') + .05, 'RULE 4', 'Nothing personal', 'on a work computer.');
        stamp('BROKEN', W / 2, 1180, 130, C.red, pop(t, at('rule', 'broke'), .3), -.08);
      } }),
  fact: beats([['r6', .62, .6, 1.4], ['p10', .5, .45, 1.1]],
    { cuts: () => [at('fact', 'see')],
      after: t => overlayTag(t, S('fact') + .05, 'REAL RULE', 'Company computer?', 'Company can see it.', 'U.S. employers can usually monitor their own devices.') }),
  calm: beats([['q7', .5, .55, 1.1], ['q8', .5, .5, 1.1], ['r1', .5, .5, 1.1]],
    { cuts: () => [at('calm', 'photo'), at('calm', 'lottery')],
      after: t => {
        pill('📷 PHOTO ≠ PRIZE', 1240, t, at('calm', 'photo') - .05, { t1: at('calm', 'lottery') });
        infoBox(t, at('calm', 'original') - .1, E('calm') + .1, 350, 'TO CLAIM', [['ORIGINAL', C.gold], [' TICKET ONLY', C.white]], { type: true });
      } }),
  hr: beats([['q15', .5, .5, 1.0], ['q15', .62, .5, 1.5]],
    { cuts: () => [at('hr', 'hold')],
      after: t => commentCard(t, S('hr') + .05, 'YOUR COMMENTS · PART 3', '"record and then report"', 360, E('hr') + .1) }),
  // the second threat
  upload: beats([['r8', .5, .62, 1.25], ['r8', .5, .55, 1.6], ['r8', .5, .42, 1.1]],
    { push: .15, cuts: () => [at('upload', 'recording'), at('upload', 'same')],
      after: t => {
        notif(t, at('upload', 'buzzed') - .1, E('upload') + .1, 330, 'CLOUD · NOW', 'Upload complete', 'Recording_0902.m4a', {});
        notif(t, at('upload', 'same') - .05, E('upload') + .1, 540, 'SECURITY ALERT', 'Also signed in', 'Office PC · Desk 14 · active now', { icon: C.red, glyph: '!', red: true });
        bigGauge(t, at('upload', 'see') - .05, E('upload') + .1, 'EXPOSED', 86, 93);
      } }),
  choice: beats([['r8', .5, .42, 1.2], ['r7', .5, .4, 1.3], ['r11', .5, .5, 1.05]],
    { cuts: () => [at('choice', 'out'), at('choice', 'leave')], after: t => choiceBoxes(t, S('choice'), CHOICES, 'COMMENT LOCK OR BAIT') }),
  cta: beats([['q16', .5, .45, 1.1], ['r4', .5, .4, 1.2]],
    { cuts: () => [at('cta', 'follow')],
      after: t => {
        choiceBoxes(t, S('choice'), CHOICES, 'COMMENT LOCK OR BAIT');
        const f = pop(t, at('cta', 'follow') - .1, .4);
        if (f > 0) withT(W / 2, 1190, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
          rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
        });
      } }),
  // open loop right after the vote
  third: beats([['q14', .55, .6, 1.45], ['r8', .5, .55, 1.3], ['r11', .5, .5, 1.0], ['r11', .32, .42, 1.9]],
    { vig: .7, push: .22, cuts: () => [at('third', 'play'), at('third', 'someone'), at('third', 'said')],
      after: t => {
        infoBox(t, at('third', 'play') - .1, at('third', 'someone') + .2, 330, '▶ PLAYING', 'Recording_0902.m4a', { w: 700, size: 52 });
        waveStrip(t, at('third', 'play'), E('third'), 1180, C.gold);
        pill('2ND VOICE DETECTED', 1240, t, at('third', 'someone'), { bg: C.red, fg: C.white });
      } }),
  black: { noPunch: true, draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } },
};

// recording badge stays on while the phone records; flashes and black cuts on the reveals
window.OVERLAY_EXTRA = (t, id) => {
  // deadline is always on screen once the day starts (Wed 9:02 -> Fri 17:00); turns red after the second threat
  if (!HUD_OFF.has(id) && t >= S('door')) deadlineChip(t, S('door') + .2, 2 * 86400 + 7 * 3600 + 58 * 60, 'FRIDAY 5PM', t > at('upload', 'same'));
  if (t > at('pocket', 'recording') && t < E('tape')) recBadge(t, at('pocket', 'recording'), W / 2, 1340);
  negFlash(t, at('bossB', 'signature'));
  negFlash(t, at('upload', 'same'));
  negFlash(t, at('third', 'name'), .2);
  blackCut(t, at('slip', 'nobody') - .32, .28);
};

// ---- HUD: EXPOSED only goes up ----
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'third', 'black']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = at('bossB', 'signature'), e2 = at('how', 'work'), e3 = at('upload', 'see');
  let exposed = 71;
  if (t >= e1) exposed = count(t, e1, .5, 71, 79);
  if (t >= e2) exposed = count(t, e2, .5, 79, 86);
  if (t >= e3) exposed = count(t, e3, .6, 86, 93);
  const expFlash = [e1, e2, e3].some(e => t > e && t < e + .9) ? Math.max(0, Math.sin((t - Math.max(...[e1, e2, e3].filter(e => e < t))) * Math.PI * 4)) : 0;
  const label = ['vote', 'pocket'].includes(id) ? 'PART 4 · ON TAPE' : 'DAY 4';
  return { cash: 13.86e6, spent: 0, exposed, label, cashFlash: 0, expFlash, expRed: expFlash > 0 };
}

// ---- sound: every on-screen element has its own sound; no whooshes ----
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  // hook: counter fills digitally, name tag types out
  add('fill', .05, .55, .95); add('cash_drop', 1.1, .45); add('stamp', at('hook', 'nobody'), .7);
  add('typewriter', at('hook', 'boss') + .1, .45, .9); add('thump', at('hook', 'half') - .05, .9);
  // vote race bars fill
  add('click', S('vote'), .5); add('fill', S('vote') + .2, .5, 1.1); add('thump', at('vote', 'tied'), .7);
  add('pin', at('vote', 'top'), .6); add('stamp', at('vote', 'record'), .9);
  // the phone starts recording
  add('pin', S('pocket') + .05, .5); add('cloth', at('pocket', 'phone'), .6); add('rec_beep', at('pocket', 'recording') - .05, .8);
  // knock on his door; the time types out
  add('step', S('door') + .1, .45); add('typewriter', S('door') + .15, .4, .45); add('knock3', at('door', 'knock') - .02, 1);
  add('keyboard', at('door', 'doesnt') - .2, .35, 1.2);
  add('drone', S('bossA'), .45); add('thump', at('bossA', 'half'), .6); add('thump', at('bossA', 'or'), .6);
  add('stamp', at('tape', 'extortion'), .9); add('rec_beep', at('tape', 'tape') - .1, .55);
  add('silence', at('bossB', 'signature') - .05, .9); add('boom', at('bossB', 'signature'), .9);
  // midnight kitchen flashback
  add('crickets', S('slip'), .5, Math.min(1.8, at('slip', 'midnight') - S('slip')));  // 1-2 s, stops before the cut add('scratch', S('slip') + .2, .5); add('hit', at('slip', 'nobody'), .7);
  // his screen, at night: crickets outside, his keyboard, boxes typing
  add('click', S('how') + .1, .5); add('typewriter', at('how', 'both'), .4, .8); add('beep', at('how', 'cloud'), .3);
  add('glitch', at('how', 'same'), .45); add('typewriter', at('how', 'same') + .1, .4, .8); add('typewriter', at('how', 'cloud') - .2, .4, .7); add('tick', S('door') + .2, .5);
  add('keyboard', at('how', 'work') - .1, .5, E('how') - at('how', 'work') + 1.6); add('fill', at('how', 'work'), .4, .5);
  add('knock', at('rule', 'rule'), .6); add('stamp', at('rule', 'broke'), 1);
  add('paper', S('fact') + .1, .5); add('click', at('fact', 'see'), .4);
  add('paper', at('calm', 'photo'), .5); add('typewriter', at('calm', 'original') - .1, .4, .8);
  add('pin', S('hr') + .05, .5); add('step', at('hr', 'hold'), .4);
  // the phone: vibration, ringtone, security alert, gauge fills
  add('buzz', at('upload', 'buzzed') - .25, .9); add('ring', at('upload', 'buzzed') + .15, .45, 1.0);
  add('beep', at('upload', 'same') - .05, .6); add('boom', at('upload', 'same'), .8); add('fill', at('upload', 'see') - .05, .55, .6);
  add('thump', S('choice'), .7); add('click', S('choice') + .25, .5); add('click', S('choice') + .55, .5); add('click', at('cta', 'follow') - .1, .8);
  add('static', at('third', 'play'), .4); add('drone', at('third', 'someone'), .55); add('silence', at('third', 'name') - .05, 1.6); add('hit', at('third', 'name'), .9);
  return ev.sort((a, b) => a.t - b.t);
}

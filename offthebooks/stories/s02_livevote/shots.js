// Story: Part 2 live vote (post ~8 h after Part 2).
/*COMMON*/
loadImages(['p6', 'p5']);
const SHOTS = {
  v1: still('p6', [.5, .45, 1.12], [.5, .5, 1.0], t => {
    header('PART 2 · LIVE VOTE', 'Pay him,', 'or deny it?', easeOut(prog(t, 0, .3)));
    const k1 = easeOut(prog(t, 1.4, .3)), k2 = easeOut(prog(t, 3.0, .3));
    text('PAY', 70, 1020, 64, C.gold, { align: 'left', alpha: k1 });
    text('He stays quiet. For now.', 70, 1090, 50, C.white, { align: 'left', alpha: k1, weight: 700 });
    text('DENY', 70, 1220, 64, C.gold, { align: 'left', alpha: k2 });
    text('He still has the tape.', 70, 1290, 50, C.white, { align: 'left', alpha: k2, weight: 700 });
  }),
  v2: still('p5', [.5, .4, 1.15], [.5, .4, 1.0], t => {
    lineIn('He wants half.', 1060, t, S('v2') + .2, C.white, 76, 900);
    const k = pop(t, S('v2') + .9, .35);
    if (k > 0) withT(70 + 440, 1180, k, -.03, () => text('$6,930,000', 0, 0, 104, C.gold));
  }),
  v3: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      withT(W / 2, 640, pop(lt, 0, .4), 0, () => text('STILL OPEN.', 0, 0, 120, C.white));
      text('You can flip it.', W / 2, 780, 70, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment PAY or DENY', W / 2, 960, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      text('on Part 2 👇', W / 2, 1040, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('v3') + 1.2, 'TAP TO WATCH PART 2 ↓');
    },
  },
};

// Story: Part 3 live vote (post ~8 h after Part 3).
/*COMMON*/
loadImages(['q16', 'q14', 'q15']);
const SHOTS = {
  v1: still('q16', [.5, .45, 1.12], [.5, .5, 1.0], t => {
    header('PART 3 · LIVE VOTE', 'Record him,', 'or report him?', easeOut(prog(t, 0, .3)));
    const k1 = easeOut(prog(t, 1.4, .3)), k2 = easeOut(prog(t, 3.0, .3));
    text('RECORD', 70, 1020, 64, C.gold, { align: 'left', alpha: k1 });
    text('Get him saying it out loud.', 70, 1090, 50, C.white, { align: 'left', alpha: k1, weight: 700 });
    text('REPORT', 70, 1220, 64, C.gold, { align: 'left', alpha: k2 });
    text('HR sees the note. Today.', 70, 1290, 50, C.white, { align: 'left', alpha: k2, weight: 700 });
  }),
  v2: still('q14', [.5, .5, 1.15], [.5, .55, 1.0], t => {
    lineIn('He gave you', 1060, t, S('v2') + .2, C.white, 76, 900);
    lineIn('until Friday.', 1150, t, S('v2') + .8, C.gold, 76, 900);
  }),
  v3: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      withT(W / 2, 640, pop(lt, 0, .4), 0, () => text('STILL OPEN.', 0, 0, 120, C.white));
      text('You decide Part 4.', W / 2, 780, 70, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment RECORD or REPORT', W / 2, 960, 56, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      text('on Part 3 👇', W / 2, 1040, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('v3') + 1.2, 'TAP TO WATCH PART 3 ↓');
    },
  },
};

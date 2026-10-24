// Story: Part 4 vote result + Part 5 countdown.
/*COMMON*/
loadImages(['r9', 't1', 't6']);
const SHOTS = {
  r1: still('r9', [.49, .4, 1.15], [.49, .42, 1.0], t => {
    header('PART 4 · VOTE CLOSED', 'You voted', 'LOCK.', easeOut(prog(t, 0, .3)));
    voteBar(t, .5, 1.1, 'LOCK', 'BAIT', .6, 1130, false);
    confetti(t, 1.6);
  }),
  r2: still('t1', [.5, .5, 1.0], [.45, .42, 1.15], t => {
    header('FRIDAY', '5:00 P.M.', '', 1);
    lineIn('His deadline.', 1060, t, S('r2') + .3);
    lineIn('Nothing', 1140, t, S('r2') + .9);
    lineIn('happens.', 1220, t, S('r2') + 1.3, C.gold);
  }),
  r3: still('t6', [.5, .45, 1.2], [.5, .45, 1.0], t => {
    lineIn('That\'s what', 1500, t, S('r3') + .2, C.white, 72);
    lineIn('scares you.', 1590, t, S('r3') + 1.0, C.gold, 72, 900);
  }),
  r4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      mono('NOBODY CAN KNOW', W / 2, 560, 30, C.grey, { spacing: 10, alpha: easeOut(prog(lt, 0, .3)) });
      text('PART 5', W / 2, 700, 150, C.white, { alpha: easeOut(prog(lt, .05, .3)) });
      withT(W / 2, 860, pop(lt, .3, .4), 0, () => text('TONIGHT', 0, 0, 150, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
      text('5:00 P.M.', W / 2, 1000, 56, C.white, { alpha: easeOut(prog(lt, .6, .3)), weight: 800 });
      stickerZone(t, S('r4') + .9, 'SET A REMINDER ↓');
    },
  },
};

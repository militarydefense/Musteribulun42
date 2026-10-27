// Story: Part 6 vote result (POLICE) + Part 7 is out.
/*COMMON*/
loadImages(['y4', 'y1', 'y6', 'y7']);
const SHOTS = {
  r1: still('y4', [.5, .8, 1.75], [.5, .78, 1.6], t => {
    header('PART 6 · VOTE CLOSED', 'You chose', 'POLICE.', easeOut(prog(t, 0, .3)));
    lineIn('They gave you a hidden mic.', 1290, t, 1.2, C.white, 56, 900);
    confetti(t, 1.2);
  }),
  r2: still('y1', [.5, .45, 1.15], [.5, .42, 1.0], t => {
    lineIn('$50 million is behind this door…', 1420, t, S('r2') + .2, C.white, 60, 900);
    lineIn('and so is a TRAP.', 1510, t, S('r2') + 1.0, C.red, 76, 900);
  }),
  r3: still('y6', [.5, .35, 1.2], [.5, .35, 1.0], t => {
    lineIn('He was ready for you.', 1600, t, S('r3') + .2, C.white, 76, 900);
  }),
  r4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      mono('NOBODY CAN KNOW', W / 2, 560, 30, C.grey, { spacing: 8, alpha: easeOut(prog(lt, 0, .3)) });
      withT(W / 2, 680, pop(lt, .05, .4), 0, () => text('PART 7 IS OUT', 0, 0, 110, C.white));
      text('Would you walk in?', W / 2, 820, 80, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment SHOW or WALK OUT 👇', W / 2, 980, 54, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('r4') + 1.2, 'TAP TO WATCH PART 7 ↓');
    },
  },
};

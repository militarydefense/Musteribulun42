// Story: Part 1 vote result + Part 2 countdown.
/*COMMON*/
loadImages(['s14', 's9', 'p3']);
const SHOTS = {
  r1: still('s14', [.5, .45, 1.12], [.5, .5, 1.0], t => {
    header('PART 1 · VOTE CLOSED', 'You voted', 'STAY.', easeOut(prog(t, 0, .3)));
    voteBar(t, .5, 1.1, 'QUIT', 'STAY', .4);
    confetti(t, 1.6);
  }),
  r2: still('s9', [.5, .45, 1.0], [.5, .4, 1.12], t => {
    header('DAY 2', 'Smart move.', '', 1);
    lineIn('You smiled.', 1060, t, S('r2') + .3);
    lineIn('You filed.', 1140, t, S('r2') + .9);
    lineIn('You stayed late.', 1220, t, S('r2') + 1.5, C.gold);
  }),
  r3: still('p3', [.5, .6, 1.2], [.5, .5, 1.0], t => {
    lineIn('But at 9 p.m.,', 1060, t, S('r3') + .2, C.white, 72);
    lineIn('someone was', 1150, t, S('r3') + 1.0, C.white, 72);
    lineIn('still here.', 1240, t, S('r3') + 1.4, C.gold, 72, 900);
  }),
  r4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      mono('NOBODY CAN KNOW', W / 2, 560, 30, C.grey, { spacing: 10, alpha: easeOut(prog(lt, 0, .3)) });
      text('PART 2', W / 2, 700, 150, C.white, { alpha: easeOut(prog(lt, .05, .3)) });
      withT(W / 2, 860, pop(lt, .3, .4), 0, () => text('TONIGHT', 0, 0, 150, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
      text('7PM ET', W / 2, 1000, 56, C.white, { alpha: easeOut(prog(lt, .6, .3)), weight: 800 });
      stickerZone(t, S('r4') + .9, 'SET A REMINDER ↓');
    },
  },
};

// Story: Part 3 vote result + Part 4 countdown.
/*COMMON*/
loadImages(['q14', 'r4', 'r1']);
const SHOTS = {
  r1: still('q14', [.5, .5, 1.12], [.5, .55, 1.0], t => {
    header('PART 3 · VOTE CLOSED', 'You voted', 'RECORD.', easeOut(prog(t, 0, .3)));
    voteBar(t, .5, 1.1, 'RECORD', 'BOTH', .5, 1130, false);
    confetti(t, 1.6);
  }),
  r2: still('r4', [.5, .45, 1.0], [.5, .38, 1.15], t => {
    header('DAY 4', 'The phone is', 'recording.', 1);
    lineIn('He leans in.', 1060, t, S('r2') + .3);
    lineIn('He says it', 1140, t, S('r2') + .9);
    lineIn('out loud.', 1220, t, S('r2') + 1.3, C.gold);
  }),
  r3: still('r1', [.5, .45, 1.2], [.5, .45, 1.0], t => {
    lineIn('Then he says', 1500, t, S('r3') + .2, C.white, 72);
    lineIn('one word too many.', 1590, t, S('r3') + 1.0, C.gold, 72, 900);
  }),
  r4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      mono('NOBODY CAN KNOW', W / 2, 560, 30, C.grey, { spacing: 10, alpha: easeOut(prog(lt, 0, .3)) });
      text('PART 4', W / 2, 700, 150, C.white, { alpha: easeOut(prog(lt, .05, .3)) });
      withT(W / 2, 860, pop(lt, .3, .4), 0, () => text('TONIGHT', 0, 0, 150, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
      text('ON TAPE', W / 2, 1000, 56, C.white, { alpha: easeOut(prog(lt, .6, .3)), weight: 800 });
      stickerZone(t, S('r4') + .9, 'SET A REMINDER ↓');
    },
  },
};

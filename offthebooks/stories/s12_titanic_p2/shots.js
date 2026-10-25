// Story: Titanic Part 1 vote result (RUN 5–0) + Part 2 is out.
/*COMMON*/
loadImages(['ti18', 'v5', 'w3', 'v6']);
const SHOTS = {
  r1: still('ti18', [.5, .45, 1.15], [.5, .45, 1.0], t => {
    header('PART 1 · VOTE CLOSED', 'You voted', 'RUN.', easeOut(prog(t, 0, .3)));
    voteBar(t, .5, 1.1, 'RUN', 'STAY', 1.0, 1130, false);
    lineIn('5 votes. 0 for stay.', 1290, t, 1.6, C.white, 56, 900);
    confetti(t, 1.6);
  }),
  r2: still('v5', [.5, .4, 1.15], [.5, .35, 1.0], t => {
    lineIn('She gave you the diamonds…', 1060, t, S('r2') + .2, C.white, 62, 900);
    lineIn('then called you a THIEF.', 1150, t, S('r2') + 1.0, C.red, 70, 900);
  }),
  r3: still('w3', [.5, .45, 1.2], [.5, .45, 1.0], t => {
    lineIn('She set you up.', 1500, t, S('r3') + .2, C.white, 76, 900);
  }),
  r4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      mono('LAST NIGHT ON THE TITANIC', W / 2, 560, 30, C.grey, { spacing: 8, alpha: easeOut(prog(lt, 0, .3)) });
      withT(W / 2, 680, pop(lt, .05, .4), 0, () => text('PART 2 IS OUT', 0, 0, 110, C.white));
      text('JUMP or TALK?', W / 2, 820, 90, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment on Part 2 👇', W / 2, 980, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('r4') + 1.2, 'TAP TO WATCH PART 2 ↓');
    },
  },
};

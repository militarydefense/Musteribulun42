// Story: new series launch, posted together with Titanic Part 1.
/*COMMON*/
loadImages(['ti21', 'ti10', 'ti27']);
const SHOTS = {
  n1: still('ti21', [.5, .45, 1.15], [.5, .5, 1.0], t => {
    header('NEW SERIES', 'Last night on', 'the Titanic.', easeOut(prog(t, 0, .3)));
    lineIn('11:40 PM · April 14, 1912', 1150, t, .9, C.white, 54, 900);
  }),
  n2: still('ti10', [.5, .4, 1.2], [.5, .4, 1.0], t => {
    lineIn('A stranger gave you', 1060, t, S('n2') + .2, C.white, 70, 900);
    lineIn('her diamonds.', 1150, t, S('n2') + .7, C.gold, 76, 900);
  }),
  n3: still('ti27', [.5, .45, 1.0], [.5, .4, 1.15], t => {
    lineIn('2h 40m to get off.', 1060, t, S('n3') + .2, C.white, 76, 900);
    lineIn('You decide how.', 1150, t, S('n3') + .8, C.gold, 76, 900);
  }),
  n4: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      withT(W / 2, 640, pop(lt, 0, .4), 0, () => text('PART 1 IS OUT', 0, 0, 110, C.white));
      text('STAY or RUN?', W / 2, 790, 90, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment on Part 1 👇', W / 2, 960, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('n4') + 1.2, 'TAP TO WATCH PART 1 ↓');
    },
  },
};

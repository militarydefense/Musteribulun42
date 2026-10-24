// Story: Part 5 live vote (post ~8 h after Part 5).
/*COMMON*/
loadImages(['t3', 't5']);
const SHOTS = {
  v1: still('t3', [.5, .45, 1.12], [.5, .5, 1.0], t => {
    header('PART 5 · LIVE VOTE', 'Call your carrier,', 'or find him?', easeOut(prog(t, 0, .3)));
    const k1 = easeOut(prog(t, 1.4, .3)), k2 = easeOut(prog(t, 3.0, .3));
    text('CALL', 70, 1020, 64, C.gold, { align: 'left', alpha: k1 });
    text('Lock your number. He\'ll know.', 70, 1090, 50, C.white, { align: 'left', alpha: k1, weight: 700 });
    text('FIND', 70, 1220, 64, C.gold, { align: 'left', alpha: k2 });
    text('Riverside. Ten minutes away.', 70, 1290, 50, C.white, { align: 'left', alpha: k2, weight: 700 });
  }),
  v2: still('t5', [.5, .45, 1.15], [.5, .4, 1.0], t => {
    lineIn('He sold you', 1060, t, S('v2') + .2, C.white, 76, 900);
    lineIn('the ticket.', 1150, t, S('v2') + .8, C.gold, 76, 900);
  }),
  v3: {
    noPunch: true,
    draw(t, lt) {
      navyBg(820);
      withT(W / 2, 640, pop(lt, 0, .4), 0, () => text('STILL OPEN.', 0, 0, 120, C.white));
      text('You decide Part 6.', W / 2, 780, 70, C.gold, { alpha: easeOut(prog(lt, .4, .3)) });
      text('Comment CALL or FIND', W / 2, 960, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      text('on Part 5 👇', W / 2, 1040, 60, C.white, { alpha: easeOut(prog(lt, .8, .3)), weight: 800 });
      stickerZone(t, S('v3') + 1.2, 'TAP TO WATCH PART 5 ↓');
    },
  },
};

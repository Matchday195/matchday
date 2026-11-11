/* Matchday 195 — skill animations.
   One small engine draws every skill with a stick figure, from the side or from above.
   Each skill is a few keyframes per body part; the engine eases between them, loops,
   and stops on its own when the picture leaves the screen. No images, no downloads. */
window.MDAnim = (function () {
  'use strict';
  const G = '#E8F5EC', L = '#B6F23A', P = '#FF8FB1', DIM = 'rgba(232,245,236,.35)';
  const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const mix = (a, b, t) => (Array.isArray(a) ? a.map((v, i) => mix(v, b[i], t)) : typeof a === 'number' ? a + (b - a) * t : (t < 1 ? a : b));
  const LEG = 27, GROUND = 160;

  // Leg angles (thigh, shin) that put the ankle at (x, y), knee bending forward.
  function ik(hip, x, y) {
    const dx = x - hip[0], dy = y - hip[1]; const d = Math.min(Math.hypot(dx, dy), 2 * LEG - 0.01);
    const base = deg(Math.atan2(dx, dy)), c = deg(Math.acos(d / (2 * LEG)));
    return [base + c, base - c];
  }

  /* ---- tracks: each body part has its own keyframes {t, v, arc, lin} ---- */
  function tracks(keys) {
    const tr = {};
    keys.forEach((k) => Object.keys(k).forEach((p) => {
      if (p === 't' || p === 'arc' || p === 'lin') return;
      (tr[p] = tr[p] || []).push({ t: k.t, v: k[p], arc: p === 'ball' ? k.arc || 0 : 0, lin: p === 'ball' ? !!k.lin : false });
    }));
    return tr;
  }
  function val(track, p) {
    if (!track) return undefined;
    if (p <= track[0].t) return track[0].v;
    for (let i = 0; i < track.length - 1; i++) {
      const A = track[i], B = track[i + 1];
      if (p >= A.t && p <= B.t) {
        const u = B.t === A.t ? 1 : (p - A.t) / (B.t - A.t);
        const v = mix(A.v, B.v, A.lin ? u : ease(u));
        if (A.arc) v[1] -= 4 * A.arc * u * (1 - u);
        return v;
      }
    }
    return track[track.length - 1].v;
  }

  /* ---- side view ---- */
  function sidePts(q) {
    const [hx, hy] = q.hip, s = q.flip ? -1 : 1, ln = rad(q.lean || 0);
    const neck = [hx + s * 46 * Math.sin(ln), hy - 46 * Math.cos(ln)];
    const head = [hx + s * 57 * Math.sin(ln), hy - 57 * Math.cos(ln)];
    const sh = [hx + s * 38 * Math.sin(ln), hy - 38 * Math.cos(ln)];
    const leg = (a) => {
      const t = rad(a[0]), sn = rad(a[1]);
      const k = [hx + s * LEG * Math.sin(t), hy + LEG * Math.cos(t)];
      const an = [k[0] + s * LEG * Math.sin(sn), k[1] + LEG * Math.cos(sn)];
      const fa = rad(-a[1] + (a[2] || 0));
      const to = [an[0] + s * 12 * Math.cos(fa), an[1] + 12 * Math.sin(fa)];
      return `${hx},${hy} ${k[0]},${k[1]} ${an[0]},${an[1]} ${to[0]},${to[1]}`;
    };
    const arm = (a) => [sh[0] + s * 28 * Math.sin(rad(a)), sh[1] + 28 * Math.cos(rad(a))];
    return { neck, head, sh, back: leg(q.b), front: leg(q.f), a1: arm(q.arms[0]), a2: arm(q.arms[1]) };
  }
  const BASE = { hip: [98, 106], lean: 0, b: [-6, -2, 0], f: [6, 2, 0], arms: [-30, 30] };
  function figSvg(cls, col, leg) {
    return `<g class="${cls}"><circle r="9" fill="${col}"/><line stroke="${col}" stroke-width="7" stroke-linecap="round"/>
      <line class="a1" stroke="${col}" stroke-width="5" stroke-linecap="round"/><line class="a2" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
      <polyline class="lb" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline class="lf" fill="none" stroke="${leg}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  function drawFig(g, q) {
    const p = sidePts(q); const [head, torso, a1, a2] = g.children; const lb = g.querySelector('.lb'), lf = g.querySelector('.lf');
    head.setAttribute('cx', p.head[0]); head.setAttribute('cy', p.head[1]);
    set(torso, q.hip, p.neck); set(a1, p.sh, p.a1); set(a2, p.sh, p.a2);
    lb.setAttribute('points', p.back); lf.setAttribute('points', p.front);
  }
  function set(line, a, b) { line.setAttribute('x1', a[0]); line.setAttribute('y1', a[1]); line.setAttribute('x2', b[0]); line.setAttribute('y2', b[1]); }

  /* ---- top view ---- */
  function feetFrom(body) {
    const [x, y, r] = body, c = Math.cos(rad(r)), s = Math.sin(rad(r));
    return { l: [x + 9 * s + 4 * c, y - 9 * c + 4 * s, r], r: [x - 9 * s + 4 * c, y + 9 * c + 4 * s, r] };
  }
  function topTracks(keys) {
    // Feet not given at a frame that moves the body follow the body.
    keys.forEach((k) => { if (k.body) { const f = feetFrom(k.body); if (!k.l) k.l = f.l; if (!k.r) k.r = f.r; } });
    return tracks(keys);
  }

  /* ---- scenery ---- */
  const goal = `<path d="M252 160 V92 H292" fill="none" stroke="${G}" stroke-width="3"/><path d="M256 104 H288 M256 120 H288 M256 136 H288 M256 152 H288" stroke="${G}" stroke-opacity=".25"/>`;
  const ballSvg = '<g class="ball"><circle r="7" fill="#fff"/><path d="M-3 -3 l3 -2 l3 2 l-1 3 h-4z" fill="#173F26"/></g>';
  const topBall = '<g class="ball"><circle r="7" fill="#fff"/><circle r="2.6" fill="#173F26"/></g>';
  const topMan = (cls, col, foot) => `<g class="${cls}"><g class="bd"><ellipse rx="7" ry="16" fill="${col}" fill-opacity=".85"/><circle cx="1" r="7.5" fill="#173F26" stroke="${col}" stroke-width="2.5"/></g>
      <rect class="fl" x="-4" y="-4" width="17" height="8" rx="4" fill="${col}" stroke="#173F26" stroke-width="1.5"/><rect class="fr" x="-4" y="-4" width="17" height="8" rx="4" fill="${foot}" stroke="#173F26" stroke-width="1.5"/></g>`;

  /* ---- skill definitions ---- */
  const side = (o) => Object.assign({ view: 'side', dur: 3200 }, o);
  const top = (o) => Object.assign({ view: 'top', dur: 3200 }, o);

  // A shot or pass from the side: run up, plant, strike, follow through.
  function kick(o) {
    const bx = 120, tg = o.to, toe = o.toe == null ? 40 : o.toe;
    const walk = { hip: [bx - 72, 106], lean: 0, b: [-20, -12, 0], f: [20, 6, 0], arms: [-30, 30] };
    const b0 = o.ball0 || [bx, 153, 1];
    return side({
      props: o.props, cap: o.cap, dur: o.dur || 3000,
      keys: [
        Object.assign({ t: 0, ball: b0, lin: true }, walk),
        { t: 0.14, hip: [bx - 50, 106], b: [18, 6, 0], f: [-20, -35, 10], ball: o.ball1 || b0, lin: true },
        { t: 0.28, hip: [bx - 26, 106], b: [6, 2, 0], f: o.wind || [-38, -95, toe], arms: [-50, 40], ball: o.ball2 || b0, lin: true },
        { t: 0.38, hip: o.cHip || [bx - 22, 106], f: o.cF || [22, 14, toe], ball: o.cBall || [bx, 153, 1], arc: o.arc || 0, lin: true },
        { t: 0.62, hip: [bx - 16, 105], lean: o.lean == null ? 6 : o.lean, f: o.fol || [75, 60, toe], arms: [-40, 50], ball: [tg[0], tg[1], 1] },
        { t: 0.86, ball: [tg[0], tg[1], 1] }, { t: 0.93, ball: [tg[0], tg[1], 0] },
        Object.assign({ t: 1, ball: [tg[0], tg[1], 0] }, walk)
      ]
    });
  }
  const atwHip = [98, 106];
  const A = (x, y, p) => { const a = ik(atwHip, x, y); return [a[0], a[1], p || 0]; };

  const SKILLS = {
    finesse: kick({ to: [270, 116], arc: 34, toe: 10, cF: [22, 14, 10], fol: [62, 80, 10], lean: 4, props: ['goal'], cap: 'Plant beside · Inside of the foot · Wrap and finish across' }),
    knuckle: kick({ to: [270, 112], arc: 100, cF: [22, 14, 40], fol: [34, 18, 40], lean: 10, props: ['goal', 'wall'], cap: 'Straight run-up · Hit the centre · Short, punchy finish' }),
    chip: kick({ to: [270, 135], arc: 145, toe: 10, cF: [18, 10, 10], fol: [30, 16, 10], lean: 0, props: ['goal', 'keeper'], cap: 'Plant close · Stab under the ball · Just clear the keeper' }),
    volley: kick({ ball0: [250, 22, 1], ball1: [214, 58, 1], ball2: [168, 104, 1], cBall: [140, 134, 1], cHip: [92, 106], cF: [62, 38, 45], to: [270, 124], arc: 6, lean: 10, props: ['goal'], cap: 'Watch it drop · Knee over the ball · Short, firm swing' }),
    pass: kick({ to: [276, 153], arc: 0, toe: 0, cF: [22, 14, 0], fol: [42, 36, 0], lean: 2, props: ['wallblock'], cap: 'Point your plant foot · Inside of the foot · Follow through' }),
    longball: kick({ to: [300, 120], arc: 80, fol: [88, 78, 30], lean: -6, props: [], cap: 'Strike below centre · Lean back a little · Follow through high' }),
    outside: kick({ to: [290, 132], arc: 22, toe: 60, cF: [22, 14, 60], fol: [42, 30, 60], lean: 4, props: [], cap: 'Toes in and down · Outside of the foot · Flick across' }),

    sole: side({ props: [], cap: 'Toes up · Press on top of the ball · Roll it where you want', keys: [
      Object.assign({ t: 0, ball: [304, 153, 1], lin: true }, BASE),
      { t: 0.25, f: [42, 8, -40] },
      { t: 0.45, ball: [127, 153, 1] },
      { t: 0.52, f: [40, 12, -15] },
      { t: 0.68, f: [18, 10, -5], ball: [112, 153, 1] },
      { t: 0.84, f: [6, 2, 0], ball: [112, 153, 1] }, { t: 0.92, ball: [112, 153, 0] }, { t: 1, ball: [112, 153, 0] }] }),
    thigh: side({ props: [], cap: 'Thigh flat · Drop it as the ball lands · Ball to your feet', keys: [
      Object.assign({ t: 0, ball: [304, 8, 1], arc: 26, lin: true }, BASE),
      { t: 0.3, f: [88, -2, 0], arms: [-50, 50] },
      { t: 0.45, f: [88, -2, 0], ball: [117, 97, 1] },
      { t: 0.53, f: [58, 0, 0], ball: [121, 110, 1] },
      { t: 0.66, f: [6, 2, 0], arms: [-30, 30], ball: [124, 153, 1] },
      { t: 0.76, f: [26, 14, 20] }, { t: 0.82, f: [6, 2, 0], ball: [150, 153, 1] },
      { t: 0.92, ball: [150, 153, 0] }, { t: 1, ball: [150, 153, 0] }] }),
    chest: side({ props: [], cap: 'Lean back, arms out · Sink as it hits · Ball to your feet', keys: [
      Object.assign({ t: 0, ball: [304, 18, 1], arc: 18, lin: true }, BASE),
      { t: 0.3, hip: [98, 109], lean: -14, b: [24, -24, 0], f: [30, -18, 0], arms: [-70, 70] },
      { t: 0.42, ball: [100, 74, 1] },
      { t: 0.5, hip: [98, 113], lean: -6, b: [34, -34, 0], f: [38, -28, 0], ball: [104, 104, 1] },
      { t: 0.64, hip: [98, 106], lean: 0, b: [-6, -2, 0], f: [6, 2, 0], arms: [-30, 30], ball: [116, 153, 1] },
      { t: 0.74, f: [26, 14, 20] }, { t: 0.8, f: [6, 2, 0], ball: [146, 153, 1] },
      { t: 0.92, ball: [146, 153, 0] }, { t: 1, ball: [146, 153, 0] }] }),
    lacekill: side({ props: [], cap: 'Meet it high · Drop your foot with the ball · Dead at your feet', keys: [
      Object.assign({ t: 0, ball: [270, -8, 1], lin: true }, BASE),
      { t: 0.28, lean: -4, f: [70, 45, -20], arms: [-50, 50] },
      { t: 0.42, f: [70, 45, -20], ball: [143, 124, 1], lin: true },
      { t: 0.52, lean: 0, f: [10, 4, 0], arms: [-30, 30], ball: [120, 153, 1] },
      { t: 0.86, ball: [120, 153, 1] }, { t: 0.93, ball: [120, 153, 0] }, { t: 1, ball: [120, 153, 0] }] }),
    headtouch: side({ props: [], cap: 'Bend your knees · Forehead to the ball · Sink to soften it', keys: [
      Object.assign({ t: 0, ball: [300, -6, 1], lin: true }, BASE),
      { t: 0.3, hip: [98, 109], lean: -14, b: [22, -20, 0], f: [28, -16, 0], arms: [-70, 60] },
      { t: 0.45, hip: [98, 109], ball: [86, 37, 1] },
      { t: 0.53, hip: [98, 116], lean: -8, b: [38, -34, 0], f: [44, -30, 0], ball: [90, 46, 1] },
      { t: 0.66, hip: [98, 106], lean: 0, b: [-6, -2, 0], f: [6, 2, 0], arms: [-30, 30], ball: [114, 153, 1] },
      { t: 0.76, f: [26, 14, 20] }, { t: 0.82, f: [6, 2, 0], ball: [142, 153, 1] },
      { t: 0.92, ball: [142, 153, 0] }, { t: 1, ball: [142, 153, 0] }] }),
    atw: side({ props: [], dur: 2600, cap: 'Pop it up · Circle your foot around it · Catch it on your foot', keys: [
      Object.assign({}, BASE, { t: 0, f: A(128, 146, 5), ball: [136, 137, 1] }),
      { t: 0.1, f: A(130, 140, 20), ball: [136, 118, 1] },
      { t: 0.2, f: A(116, 118), ball: [136, 98, 1] },
      { t: 0.3, f: A(132, 86), ball: [136, 92, 1] },
      { t: 0.4, f: A(150, 104) },
      { t: 0.5, f: A(132, 142, 5), ball: [136, 108, 1] },
      { t: 0.6, f: A(128, 146, 5), ball: [136, 137, 1] },
      { t: 1, f: A(128, 146, 5), ball: [136, 137, 1] }] }),

    stepover: top({ props: ['def'], cap: 'Swing over the ball · Lean that way · Push it the other way', keys: [
      { t: 0, body: [50, 95, 0], ball: [72, 95, 1], d: [190, 95] },
      { t: 0.25, body: [116, 95, 0], ball: [138, 95, 1] },
      { t: 0.33, body: [118, 96, 8], r: [138, 92, 0] },
      { t: 0.41, body: [122, 102, 18], r: [140, 112, 10], d: [190, 95] },
      { t: 0.48, d: [192, 106] },
      { t: 0.52, body: [124, 98, -10], l: [136, 100, -20], ball: [142, 93, 1] },
      { t: 0.62, ball: [176, 72, 1] },
      { t: 0.8, body: [205, 70, -15], ball: [232, 66, 1], d: [192, 106] },
      { t: 0.9, ball: [232, 66, 0] },
      { t: 1, body: [50, 95, 0], ball: [232, 66, 0], d: [190, 95] }] }),
    cruyff: top({ props: ['def'], cap: 'Fake the pass · Drag it behind your standing leg · Turn and go', keys: [
      { t: 0, body: [50, 95, 0], ball: [72, 95, 1], d: [200, 95] },
      { t: 0.25, body: [112, 95, 0], ball: [134, 97, 1] },
      { t: 0.33, body: [118, 93, 0], l: [132, 86, 0] },
      { t: 0.4, r: [110, 106, 0] },
      { t: 0.47, r: [138, 104, 20], ball: [134, 97, 1] },
      { t: 0.55, body: [118, 93, 0], r: [124, 94, 20], ball: [112, 92, 1] },
      { t: 0.65, body: [116, 92, 180], ball: [100, 92, 1] },
      { t: 0.85, body: [56, 92, 180], ball: [34, 92, 1] },
      { t: 0.92, ball: [34, 92, 0] },
      { t: 1, body: [50, 95, 0], ball: [34, 92, 0] }] }),
    croqueta: top({ props: ['def'], cap: 'Ball in the middle · Across with one foot · Forward with the other', keys: [
      { t: 0, body: [50, 95, 0], ball: [72, 95, 1], d: [176, 92] },
      { t: 0.28, body: [118, 95, 0], ball: [138, 100, 1] },
      { t: 0.36, body: [120, 95, 0], r: [134, 104, 0] },
      { t: 0.44, r: [140, 96, 0], ball: [140, 82, 1] },
      { t: 0.5, l: [140, 88, 0], d: [176, 102] },
      { t: 0.58, body: [128, 90, 0], l: [146, 84, 0], ball: [162, 80, 1] },
      { t: 0.82, body: [214, 82, 0], ball: [236, 80, 1] },
      { t: 0.92, ball: [236, 80, 0] },
      { t: 1, body: [50, 95, 0], ball: [236, 80, 0], d: [176, 92] }] }),
    elastico: top({ props: ['def'], cap: 'Push out with the outside · Snap it back with the inside · Go', keys: [
      { t: 0, body: [50, 95, 0], ball: [74, 102, 1], d: [178, 95] },
      { t: 0.26, body: [114, 95, 0], ball: [136, 102, 1] },
      { t: 0.36, body: [116, 99, 12], r: [130, 106, 10], ball: [140, 114, 1] },
      { t: 0.42, d: [178, 108] },
      { t: 0.47, body: [118, 94, -12], r: [142, 110, -30], ball: [142, 84, 1] },
      { t: 0.56, ball: [166, 74, 1] },
      { t: 0.8, body: [214, 74, -10], ball: [236, 72, 1] },
      { t: 0.9, ball: [236, 72, 0] },
      { t: 1, body: [50, 95, 0], ball: [236, 72, 0], d: [178, 95] }] }),
    roulette: top({ props: ['def'], cap: 'Stop it with your sole · Spin your back to them · Drag and burst away', keys: [
      { t: 0, body: [50, 95, 0], ball: [72, 97, 1], d: [176, 95] },
      { t: 0.25, body: [118, 95, 0], ball: [138, 100, 1] },
      { t: 0.32, r: [138, 100, 0] },
      { t: 0.38, body: [124, 98, 0], r: [132, 104, 0] },
      { t: 0.48, body: [128, 100, -120], ball: [134, 104, 1], d: [162, 98] },
      { t: 0.56, body: [134, 104, -200], l: [140, 112, -200], ball: [142, 112, 1] },
      { t: 0.64, body: [140, 108, -330], ball: [156, 114, 1] },
      { t: 0.84, body: [214, 118, -360], ball: [236, 118, 1] },
      { t: 0.92, ball: [236, 118, 0] },
      { t: 1, body: [50, 95, -360], ball: [236, 118, 0], d: [176, 95] }] }),
    rabona: top({ props: [], cap: 'Plant past the ball · Swing behind your standing leg · Strike', keys: [
      { t: 0, body: [50, 100, 0], ball: [80, 82, 1] },
      { t: 0.25, body: [110, 100, 0], ball: [142, 82, 1] },
      { t: 0.35, body: [124, 96, -10], l: [146, 94, 0], r: [116, 106, 0] },
      { t: 0.45, r: [136, 100, -30] },
      { t: 0.52, r: [134, 84, -40], ball: [142, 82, 1] },
      { t: 0.7, body: [128, 96, -10], r: [150, 80, -40], ball: [300, 62, 1] },
      { t: 0.86, body: [130, 96, -10], ball: [300, 62, 0] },
      { t: 1, body: [50, 100, 0], ball: [300, 62, 0] }] }),
    cushion: top({ props: [], cap: 'Get in line · Foot out to meet it · Give, then touch into space', keys: [
      { t: 0, body: [108, 95, 0], ball: [304, 100, 1], lin: true },
      { t: 0.3, r: [128, 104, 80] },
      { t: 0.48, ball: [135, 102, 1] },
      { t: 0.56, r: [118, 104, 80], ball: [126, 102, 1] },
      { t: 0.68, r: [118, 104, 0] },
      { t: 0.76, r: [126, 106, 30], ball: [152, 122, 1] },
      { t: 0.86, body: [108, 95, 0], ball: [152, 122, 1] }, { t: 0.93, ball: [152, 122, 0] }, { t: 1, ball: [152, 122, 0] }] }),
    halfturn: top({ props: ['def', 'mate'], cap: 'Check your shoulder · Side-on · Back foot, then go forward', keys: [
      { t: 0, body: [120, 95, 60], ball: [30, 95, 1], d: [170, 40], lin: true },
      { t: 0.14, body: [120, 95, 100] },
      { t: 0.24, body: [120, 95, 60] },
      { t: 0.45, ball: [128, 96, 1] },
      { t: 0.52, body: [122, 96, 30], l: [136, 100, 0], ball: [142, 98, 1] },
      { t: 0.6, body: [134, 98, 0], ball: [162, 98, 1] },
      { t: 0.84, body: [220, 98, 0], ball: [244, 98, 1], d: [184, 64] },
      { t: 0.92, ball: [244, 98, 0] },
      { t: 1, body: [120, 95, 60], ball: [244, 98, 0], d: [170, 40] }] }),
    outtouch: top({ props: ['def', 'mate2'], cap: 'Toes in · Outside of the foot · Touch it away from them', keys: [
      { t: 0, body: [118, 110, 0], ball: [36, 36, 1], d: [150, 62], lin: true },
      { t: 0.3, r: [124, 120, -25] },
      { t: 0.4, ball: [126, 113, 1] },
      { t: 0.47, body: [120, 112, 0], r: [130, 122, -25], ball: [152, 134, 1] },
      { t: 0.76, body: [205, 138, 20], ball: [228, 142, 1], d: [172, 96] },
      { t: 0.9, ball: [228, 142, 0] },
      { t: 1, body: [118, 110, 0], ball: [228, 142, 0], d: [150, 62] }] })
  };

  function has(id) { return !!SKILLS[id]; }

  function svg(id) {
    const s = SKILLS[id]; if (!s) return '';
    const pr = s.props || [];
    let scene = '', actors = '';
    if (s.view === 'side') {
      scene = `<line x1="10" y1="${GROUND}" x2="290" y2="${GROUND}" stroke="${G}" stroke-opacity=".5" stroke-width="2"/>`;
      if (pr.includes('goal')) scene += goal;
      if (pr.includes('wallblock')) scene += `<rect x="284" y="110" width="10" height="50" fill="${DIM}"/>`;
      if (pr.includes('wall')) actors += figSvg('wall', P, P);
      if (pr.includes('keeper')) actors += figSvg('keeper', P, P);
      actors += figSvg('me', G, L) + ballSvg;
    } else {
      scene = `<text x="150" y="36" text-anchor="middle" fill="${G}" fill-opacity=".55" font-size="10" font-weight="600">Seen from above</text>`;
      if (pr.includes('mate')) scene += `<g transform="translate(18 95)"><ellipse rx="8" ry="15" fill="${DIM}"/><circle cx="2" r="6.5" fill="${DIM}"/></g>`;
      if (pr.includes('mate2')) scene += `<g transform="translate(26 30) rotate(40)"><ellipse rx="8" ry="15" fill="${DIM}"/><circle cx="2" r="6.5" fill="${DIM}"/></g>`;
      if (pr.includes('def')) actors += `<g class="def"><ellipse rx="8" ry="17" fill="${P}"/><circle cx="-1" r="7.5" fill="#173F26" stroke="${P}" stroke-width="2.5"/></g>`;
      actors += topBall + topMan('me', G, L);
    }
    const label = s.cap.split(' · ').join(', ');
    const vb = s.view === 'top' ? '25 22 250 158' : '0 0 300 190', cy = s.view === 'top' ? 176 : 184;
    return `<svg class="anim2" data-anim="${id}" width="100%" height="190" viewBox="${vb}" role="img" aria-label="Animation: ${label}">
      ${scene}${actors}<text x="150" y="${cy}" text-anchor="middle" fill="${L}" font-size="${Math.min(10.5, 540 / s.cap.length).toFixed(1)}" font-weight="700">${s.cap}</text></svg>`;
  }

  function start(el) {
    const s = SKILLS[el && el.dataset.anim]; if (!s) return;
    const tr = s.view === 'top' ? topTracks(s.keys.map((k) => Object.assign({}, k))) : tracks(s.keys);
    const me = el.querySelector('.me'), ball = el.querySelector('.ball'), def = el.querySelector('.def');
    const wall = el.querySelector('.wall'), keeper = el.querySelector('.keeper');
    if (wall) drawFig(wall, Object.assign({}, BASE, { hip: [190, 106], flip: true, arms: [-10, 10] }));
    if (keeper) drawFig(keeper, Object.assign({}, BASE, { hip: [222, 106], flip: true, b: [-12, -4, 0], f: [12, 4, 0], arms: [150, 160] }));
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = (p) => {
      const b = val(tr.ball, p);
      if (b) { ball.setAttribute('transform', `translate(${b[0]} ${b[1]})`); ball.setAttribute('opacity', Math.max(0, Math.min(1, b[2]))); }
      if (s.view === 'side') {
        const q = {}; ['hip', 'lean', 'b', 'f', 'arms', 'flip'].forEach((k) => { const v = val(tr[k], p); q[k] = v === undefined ? BASE[k] : v; });
        drawFig(me, q);
      } else {
        const body = val(tr.body, p), l = val(tr.l, p), r = val(tr.r, p);
        me.querySelector('.bd').setAttribute('transform', `translate(${body[0]} ${body[1]}) rotate(${body[2]})`);
        me.querySelector('.fl').setAttribute('transform', `translate(${l[0]} ${l[1]}) rotate(${l[2]})`);
        me.querySelector('.fr').setAttribute('transform', `translate(${r[0]} ${r[1]}) rotate(${r[2]})`);
        if (def) { const d = val(tr.d, p); def.setAttribute('transform', `translate(${d[0]} ${d[1]})`); }
      }
    };
    if (el.dataset.at) { draw(Number(el.dataset.at)); return; } // freeze one moment (used for checking frames)
    if (reduce) { draw(0.45); return; }
    let t0 = null;
    const frame = (ts) => {
      if (!el.isConnected) return; // stops when the picture leaves the screen
      if (t0 === null) t0 = ts;
      draw(((ts - t0) % s.dur) / s.dur);
      requestAnimationFrame(frame);
    };
    draw(0); requestAnimationFrame(frame);
  }

  return { has, svg, start, SKILLS };
})();

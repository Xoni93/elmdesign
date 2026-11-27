/* Glide Belt — bande de cartes qui défile (section Réalisations) */
// ── Shared helpers — src/lib/motion-templates/core.ts (minified names)

function We(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function xe(t, e, n) {
  return n <= e ? (t >= n ? 1 : 0) : We((t - e) / (n - e));
}

function Mt(t, e) {
  const n = We(t) * e;
  let a = Math.floor(n);
  return (a >= e && (a = e - 1), { index: a, local: n - a });
}

const _5 = (t) => t;

const Va = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const D6 = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const Hm = (t) => 1 + 3.2 * Math.pow(t - 1, 3) + 2.2 * Math.pow(t - 1, 2);

const P6 = (t) => {
  const n = 2.5949095;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((n + 1) * 2 * t - n)) / 2
    : (Math.pow(2 * t - 2, 2) * ((n + 1) * (t * 2 - 2) + n) + 2) / 2;
};

const L6 = (t) =>
  t < 1 / 2.75
    ? 7.5625 * t * t
    : t < 2 / 2.75
      ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      : t < 2.5 / 2.75
        ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;

const U6 = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const e = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * e) + 1;
};

function Ci(t, e, n, a) {
  const r = 3 * t,
    o = 3 * (n - t) - r,
    c = 1 - r - o,
    d = 3 * e,
    h = 3 * (a - e) - d,
    f = 1 - d - h,
    p = (y) => ((c * y + o) * y + r) * y,
    m = (y) => ((f * y + h) * y + d) * y,
    b = (y) => (3 * c * y + 2 * o) * y + r;
  return (y) => {
    if (y <= 0) return 0;
    if (y >= 1) return 1;
    let _ = y;
    for (let E = 0; E < 6; E++) {
      const T = p(_) - y;
      if (Math.abs(T) < 1e-5) return m(_);
      const k = b(_);
      if (Math.abs(k) < 1e-6) break;
      _ -= T / k;
    }
    let x = 0,
      w = 1;
    for (_ = y; w - x > 1e-5;) (p(_) < y ? (x = _) : (w = _), (_ = (x + w) / 2));
    return m(_);
  };
}

function I6(t) {
  const e = t.split(",").map(Number);
  return e.length !== 4 || e.some(Number.isNaN)
    ? null
    : [Math.min(1, Math.max(0, e[0])), e[1], Math.min(1, Math.max(0, e[2])), e[3]];
}

const H6 = {
  linear: _5,
  smooth: Va,
  natural: Ci(0.4, 0, 0.2, 1),
  slowdown: Ci(0, 0, 0.35, 1),
  snappy: D6,
  accelerate: Ci(0.55, 0, 0.85, 0.3),
  overshoot: Hm,
  bounce: L6,
  elastic: U6,
  impulse: Ci(0.5, -0.6, 0.3, 1),
  swing: P6,
};

function w5(t, e = 60, n = "") {
  if (t === "custom") {
    const a = I6(n);
    if (a) return Ci(...a);
    const r = Math.max(-100, Math.min(100, e)) / 100;
    if (r === 0) return _5;
    const o = 1 + Math.abs(r) * 4;
    return r > 0 ? (c) => 1 - Math.pow(1 - c, o) : (c) => Math.pow(c, o);
  }
  return H6[t] ?? Va;
}

function H(t, e, n) {
  const a = t[e];
  return typeof a == "number" ? a : n;
}

function he(t, e, n) {
  const a = t[e];
  return typeof a == "string" ? a : n;
}

function Bm(t, e, n) {
  const a = t[e];
  return typeof a == "boolean" ? a : n;
}

function k5(t, e) {
  return Math.min(t, e) / 100;
}

function G6(t, e, n) {
  const a = k5(t, e) * n;
  return { x: a, y: a, w: t - a * 2, h: e - a * 2 };
}

function Fm(t) {
  return "videoWidth" in t ? { w: t.videoWidth, h: t.videoHeight } : { w: t.width, h: t.height };
}

function Xa(t, e, n, a, r, o) {
  const c = Math.max(0, Math.min(o, a / 2, r / 2));
  if ((t.beginPath(), typeof t.roundRect == "function")) {
    t.roundRect(e, n, a, r, c);
    return;
  }
  (t.moveTo(e + c, n),
    t.arcTo(e + a, n, e + a, n + r, c),
    t.arcTo(e + a, n + r, e, n + r, c),
    t.arcTo(e, n + r, e, n, c),
    t.arcTo(e, n, e + a, n, c),
    t.closePath());
}

function Y6(t, e, n, a, r = 1, o = 0, c = 0) {
  const d = Math.max(n / t, a / e) * Math.max(r, 1e-4),
    h = n / d,
    f = a / d,
    p = (t - h) / 2,
    m = (e - f) / 2;
  return {
    sx: p * (1 + Math.max(-1, Math.min(1, o))),
    sy: m * (1 + Math.max(-1, Math.min(1, c))),
    sw: h,
    sh: f,
  };
}

let jc = null;

function W6(t) {
  jc = t;
}

let T5 = !1;

function V6(t) {
  T5 = t;
}

function M5(t, e, n, a, r) {
  const o = r.unit > 0 ? a / r.unit : 1;
  (t.save(), (t.shadowColor = r.color), (t.shadowBlur = r.blur * o));
  let c = 0,
    d = 0,
    h = !1;
  const f = 1e5;
  try {
    const m = t.getTransform(),
      b = m.a * m.d - m.b * m.c;
    b && ((c = (-f * m.d) / b), (d = (f * m.b) / b), (h = !0));
  } catch {}
  ((t.shadowOffsetX = (h ? f : 0) + r.offX), (t.shadowOffsetY = r.offY));
  const p = h ? r.spread : Math.min(r.spread, -1);
  (Xa(t, e.x + c - p, e.y + d - p, Math.max(0, e.w + p * 2), Math.max(0, e.h + p * 2), Math.max(0, n + p)),
    (t.fillStyle = "#000"),
    t.fill(),
    t.restore());
}

function qm(t, e, n, a) {
  (t.save(), Xa(t, e.x, e.y, e.w, e.h, n), t.clip());
  const r = 30 + ((a * 11) % 30);
  ((t.fillStyle = 'hsl(230, 6%, ' + r + '%)'), t.fillRect(e.x, e.y, e.w, e.h), t.restore());
}

function Ds(t, e, n, a, r = {}) {
  if (n.w <= 0 || n.h <= 0) return;
  const o = r.alpha ?? 1;
  if (o <= 0) return;
  const c = e ? Fm(e) : null;
  if (!e || !c || c.w <= 0 || c.h <= 0) {
    (t.save(), (t.globalAlpha *= o), qm(t, n, a, 0), t.restore());
    return;
  }
  const d = Y6(c.w, c.h, n.w, n.h, r.zoom, r.panX, r.panY);
  (t.save(),
    (t.globalAlpha *= o),
    Xa(t, n.x, n.y, n.w, n.h, a),
    t.clip(),
    t.drawImage(e, d.sx, d.sy, d.sw, d.sh, n.x, n.y, n.w, n.h),
    t.restore());
}

function Re(t, e, n, a, r, o = {}) {
  if (a.w <= 0 || a.h <= 0) return;
  const c = o.alpha ?? 1;
  if (c <= 0) return;
  const d = e ? Fm(e) : null,
    h = e && d && d.w > 0 && d.h > 0;
  if (T5 && h) {
    const f = d.w / d.h;
    let p = a.w,
      m = a.h;
    (p / m > f ? (p = m * f) : (m = p / f),
      (a = { x: a.x + (a.w - p) / 2, y: a.y + (a.h - m) / 2, w: p, h: m }));
  }
  (t.save(),
    (t.globalAlpha *= c),
    o.shadow && o.shadow > 0 && jc && M5(t, a, r, o.shadow, jc),
    h ? Ds(t, e, a, r, { zoom: o.zoom, panX: o.panX, panY: o.panY }) : qm(t, a, r, n),
    t.restore());
}

const om = [
  {
    id: "dusk",
    label: "Dusk",
    angle: 135,
    stops: [
      { at: 0, color: "#2b1055" },
      { at: 1, color: "#7597de" },
    ],
  },
  {
    id: "ember",
    label: "Ember",
    angle: 135,
    stops: [
      { at: 0, color: "#f12711" },
      { at: 1, color: "#f5af19" },
    ],
  },
  {
    id: "mint",
    label: "Mint",
    angle: 135,
    stops: [
      { at: 0, color: "#0f2027" },
      { at: 0.5, color: "#203a43" },
      { at: 1, color: "#2c5364" },
    ],
  },
  {
    id: "grape",
    label: "Grape",
    angle: 135,
    stops: [
      { at: 0, color: "#41295a" },
      { at: 1, color: "#2f0743" },
    ],
  },
  {
    id: "peach",
    label: "Peach",
    angle: 135,
    stops: [
      { at: 0, color: "#ee9ca7" },
      { at: 1, color: "#ffdde1" },
    ],
  },
  {
    id: "slate",
    label: "Slate",
    angle: 135,
    stops: [
      { at: 0, color: "#232526" },
      { at: 1, color: "#414345" },
    ],
  },
  {
    id: "halo",
    label: "Halo",
    angle: 0,
    radial: !0,
    stops: [
      { at: 0, color: "#3a3a5a" },
      { at: 1, color: "#0d0d14" },
    ],
  },
];

function X6(t) {
  return om.find((e) => e.id === t);
}

function J6(t) {
  try {
    const e = JSON.parse(t);
    if (!e || !Array.isArray(e.stops) || e.stops.length < 2) return null;
    const n = e.stops
      .filter((a) => a && typeof a.color == "string")
      .map((a) => ({ at: Math.min(1, Math.max(0, Number(a.at) || 0)), color: a.color }));
    return n.length < 2
      ? null
      : { id: "custom", label: "Custom", angle: Number(e.angle) || 0, radial: !!e.radial, stops: n };
  } catch {
    return null;
  }
}

function Z6(t, e, n, a) {
  let r;
  if (a.radial) {
    const o = Math.hypot(e, n) / 2;
    r = t.createRadialGradient(e / 2, n / 2, 0, e / 2, n / 2, o);
  } else {
    const o = (a.angle * Math.PI) / 180,
      c = e / 2,
      d = n / 2,
      h = (Math.abs(Math.cos(o)) * e + Math.abs(Math.sin(o)) * n) / 2,
      f = Math.cos(o) * h,
      p = Math.sin(o) * h;
    r = t.createLinearGradient(c - f, d - p, c + f, d + p);
  }
  for (const o of a.stops) r.addColorStop(o.at, o.color);
  ((t.fillStyle = r), t.fillRect(0, 0, e, n));
}

const Q6 = [
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "4:5", label: "4:5" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
];

const it = [{ value: "auto", label: "Auto" }, ...Q6];

const ez = 0.25;

const tz = 4;

function nz(t) {
  if (!t) return 1;
  for (const e of t.images) {
    if (!e) continue;
    const { w: n, h: a } = Fm(e);
    if (n > 0 && a > 0) return Math.min(Math.max(n / a, ez), tz);
  }
  return 1;
}

function et(t, e) {
  if (t === "auto") return nz(e);
  switch (t) {
    case "4:3":
      return 4 / 3;
    case "3:4":
      return 3 / 4;
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    case "4:5":
      return 4 / 5;
    case "5:4":
      return 5 / 4;
    case "1:1":
    default:
      return 1;
  }
}

const Bc = [{ value: "frame", label: "Frame" }, ...it];

function sz(t, e) {
  const n = /^#?([0-9a-f]{6})$/i.exec(t.trim());
  if (!n) return 'rgba(0,0,0,' + e + ')';
  const a = parseInt(n[1], 16);
  return 'rgba(' + ((a >> 16) & 255) + ',' + ((a >> 8) & 255) + ',' + (a & 255) + ',' + e + ')';
}

function He(t) {
  const { ctx: e, width: n, height: a, params: r } = t;
  try {
    ((e.imageSmoothingEnabled = !0), (e.imageSmoothingQuality = "high"));
  } catch {}
  (e.setTransform(1, 0, 0, 1, 0, 0),
    e.clearRect(0, 0, n, a),
    (e.fillStyle = he(r, "background", "#101014")),
    e.fillRect(0, 0, n, a));
  const o = he(r, "backgroundType", "color");
  if (o === "gradient") {
    const p = he(r, "backgroundGradient", ""),
      m = p === "custom" ? J6(he(r, "backgroundGradientCustom", "")) : X6(p);
    m && Z6(e, n, a, m);
  } else
    (o === "image" || o === "preset") && t.background && Ds(e, t.background, { x: 0, y: 0, w: n, h: a }, 0);
  const c = k5(n, a),
    d = Bm(r, "shadowEnabled", !1);
  (W6(
    d
      ? {
          offX: c * H(r, "shadowX", 0),
          offY: c * H(r, "shadowY", 1),
          blur: c * H(r, "shadowBlur", 1.5),
          spread: c * H(r, "shadowSpread", -0.25),
          color: sz(he(r, "shadowColor", "#000000"), H(r, "shadowOpacity", 40) / 100),
          unit: c,
        }
      : null,
  ),
    V6(he(r, "cardAspect", "") === "auto"));
  const h = c * H(r, "offsetX", 0),
    f = c * H(r, "offsetY", 0);
  return (
    (h || f) && e.translate(h, f),
    {
      u: c,
      content: G6(n, a, H(r, "padding", 6)),
      radius: c * H(r, "cornerRadius", 3),
      easeName: he(r, "easing", "smooth"),
      ease: w5(he(r, "easing", "smooth"), H(r, "easeAmount", 60), he(r, "easeBezier", "")),
      shadow: d ? c : 0,
    }
  );
}

function je(t, e) {
  return t.images[e % t.images.length] ?? null;
}

// ── The template — src/lib/motion-templates/presets/05-carousel-and-flow/carousel-flow.ts

const oz = 5;

const lz = {
  id: "carousel-flow",
  name: "Glide Belt",
  description: "A smooth belt of cards glides past, the centre card drawing focus.",
  slotCount: oz,
  slotRange: { min: 3, max: 10 },
  defaultDuration: 10,
  params: [
    {
      type: "select",
      id: "direction",
      label: "Direction",
      default: "horizontal",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
    },
    {
      type: "number",
      id: "sideScale",
      label: "Side card scale",
      default: 0.82,
      min: 0.6,
      max: 1,
      step: 0.01,
    },
    { type: "number", id: "gap", label: "Gap", default: 5, min: 1, max: 15, step: 0.5, unit: "%" },
    { type: "select", id: "cardAspect", label: "Card ratio", default: "1:1", options: Bc },
  ],
  render(t) {
    const { ctx: e, t: n, width: a, height: r, params: o } = t,
      c = He(t),
      d = c.ease,
      h = H(o, "sideScale", 0.82),
      f = c.u * H(o, "gap", 5),
      p = Math.max(3, t.images.length),
      { index: m, local: b } = Mt(n, p),
      y = m + d(xe(b, 0, 0.45)),
      _ = he(o, "direction", "horizontal") === "vertical" ? "y" : "x",
      x = he(o, "cardAspect", "1:1"),
      w = _ === "x" ? c.content.w : c.content.h,
      E = _ === "x" ? c.content.h : c.content.w;
    let T, k;
    if (x === "frame") ((T = _ === "x" ? w * 0.62 : E), (k = _ === "x" ? E : w * 0.62));
    else {
      const O = et(x, t);
      let $ = E,
        L = _ === "x" ? $ * O : $ / O;
      (L > w && ((L = w * 0.82), ($ = _ === "x" ? L / O : L * O)),
        (T = _ === "x" ? L : $),
        (k = _ === "x" ? $ : L));
    }
    const A = (_ === "x" ? T : k) + f,
      C = A * p,
      I = a / 2,
      z = r / 2,
      B = [];
    for (let O = 0; O < p; O++) {
      let $ = (O - y) * A;
      (($ = ((($ % C) + C * 1.5) % C) - C / 2), B.push({ slot: O, offset: $, dist: Math.abs($) }));
    }
    B.sort((O, $) => $.dist - O.dist);
    for (const O of B) {
      const $ = Math.max(0, 1 - O.dist / A),
        L = h + (1 - h) * $,
        X = 0.55 + 0.45 * $,
        Y = T * L,
        F = k * L,
        Q = _ === "x" ? I + O.offset - Y / 2 : I - Y / 2,
        P = _ === "y" ? z + O.offset - F / 2 : z - F / 2;
      Re(e, je(t, O.slot), O.slot, { x: Q, y: P, w: Y, h: F }, c.radius * L, {
        alpha: X,
        shadow: c.shadow * 2 * $,
      });
    }
  },
};


/* ===== Hôte — boucle requestAnimationFrame (portée du prompt) =====
   Changements : pas de fond sombre peint derrière les cartes (on garde le fond
   clair du site), pause hors écran, et interaction :
   - survol d'une carte : le défilement s'arrête et la carte zoome légèrement ;
   - clic : ouverture du projet dans un nouvel onglet. */
const TEMPLATE = lz;
const DPR_CAP = 2;
const LOOP_SECONDS = 20.0;
const PARAMS = {"cornerRadius":3,"padding":6,"shadowEnabled":false,"direction":"horizontal","sideScale":1,"gap":15,"cardAspect":"auto","backgroundType":"color","background":"rgba(0,0,0,0)"};
const ZOOM = 0.07;        // +7 % au survol
const ZOOM_MS = 220;      // durée du zoom

/* Même géométrie que render() : rectangle, échelle et opacité de chaque carte,
   de la plus proche du centre à la plus éloignée. */
function cardRects(t, a, r, params, images) {
  const u = k5(a, r),
    content = G6(a, r, H(params, "padding", 6)),
    radius = u * H(params, "cornerRadius", 3),
    d = w5(he(params, "easing", "smooth"), H(params, "easeAmount", 60), he(params, "easeBezier", "")),
    h = H(params, "sideScale", 0.82),
    f = u * H(params, "gap", 5),
    p = Math.max(3, images.length),
    { index: m, local: b } = Mt(t, p),
    y = m + d(xe(b, 0, 0.45)),
    _ = he(params, "direction", "horizontal") === "vertical" ? "y" : "x",
    x = he(params, "cardAspect", "1:1"),
    w = _ === "x" ? content.w : content.h,
    E = _ === "x" ? content.h : content.w;
  let T, k;
  if (x === "frame") ((T = _ === "x" ? w * 0.62 : E), (k = _ === "x" ? E : w * 0.62));
  else {
    const O = et(x, { images });
    let $ = E,
      L = _ === "x" ? $ * O : $ / O;
    (L > w && ((L = w * 0.82), ($ = _ === "x" ? L / O : L * O)), (T = _ === "x" ? L : $), (k = _ === "x" ? $ : L));
  }
  const A = (_ === "x" ? T : k) + f, C = A * p, I = a / 2, z = r / 2, out = [];
  for (let O = 0; O < p; O++) {
    let $ = (O - y) * A;
    $ = ((($ % C) + C * 1.5) % C) - C / 2;
    const dist = Math.abs($), s = Math.max(0, 1 - dist / A), L = h + (1 - h) * s, Y = T * L, F = k * L;
    out.push({
      slot: O, dist, alpha: 0.55 + 0.45 * s, radius: radius * L,
      rect: { x: _ === "x" ? I + $ - Y / 2 : I - Y / 2, y: _ === "y" ? z + $ - F / 2 : z - F / 2, w: Y, h: F },
    });
  }
  return out.sort((o1, o2) => o1.dist - o2.dist);
}

function mount(container, canvas, images, links) {
  const ctx = canvas.getContext("2d");
  // Une version transparente de chaque image : le moteur « dessine » la carte zoomée
  // à vide, et on la redessine nous-mêmes par-dessus, agrandie (pas de double opacité).
  const blanks = images.map((im) => {
    if (!im) return im;
    const c = document.createElement("canvas");
    c.width = im.width; c.height = im.height;
    return c;
  });
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(container.clientWidth * dpr);
    canvas.height = Math.round(container.clientHeight * dpr);
  };
  resize();
  let t = 0.12;
  let last = performance.now();
  let hovered = -1;   // carte sous le curseur
  let zoomSlot = -1;  // carte en cours de zoom (reste le temps du dézoom)
  let zk = 0;         // progression du zoom 0 → 1
  const easeOut = (v) => 1 - Math.pow(1 - v, 3);
  const draw = () => {
    const imgs = zoomSlot >= 0 && zk > 0 ? images.map((im, i) => (i === zoomSlot ? blanks[i] : im)) : images;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    TEMPLATE.render({ ctx, t, width: canvas.width, height: canvas.height, params: PARAMS, images: imgs, background: null });
    if (zoomSlot >= 0 && zk > 0) {
      const c = cardRects(t, canvas.width, canvas.height, PARAMS, images).find((o) => o.slot === zoomSlot);
      if (c) {
        const k = easeOut(zk), s = 1 + ZOOM * k, R = c.rect;
        const rect = { x: R.x + R.w / 2 - (R.w * s) / 2, y: R.y + R.h / 2 - (R.h * s) / 2, w: R.w * s, h: R.h * s };
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        Re(ctx, images[zoomSlot], zoomSlot, rect, c.radius * s, { alpha: c.alpha + (1 - c.alpha) * k });
      }
    }
  };
  new ResizeObserver(() => { resize(); draw(); }).observe(container);

  const hit = (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    for (const c of cardRects(t, canvas.width, canvas.height, PARAMS, images)) {
      const R = c.rect;
      if (x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h) return c.slot;
    }
    return -1;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  canvas.addEventListener("pointermove", (ev) => {
    const i = hit(ev);
    canvas.style.cursor = i >= 0 ? "pointer" : "";
    hovered = ev.pointerType === "mouse" ? i : -1;
    if (hovered >= 0) zoomSlot = hovered;
    if (reduce) { zk = hovered >= 0 ? 1 : 0; draw(); }
  });
  canvas.addEventListener("pointerleave", () => { hovered = -1; canvas.style.cursor = ""; if (reduce) { zk = 0; draw(); } });
  canvas.addEventListener("click", (ev) => {
    const i = hit(ev);
    const url = i >= 0 ? links[i] : null;
    if (url) window.open(url, "_blank", "noopener");
  });

  if (reduce) { draw(); return; }
  let visible = true, running = false;
  const tick = (now) => {
    if (!visible) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (hovered < 0) t = (t + dt / LOOP_SECONDS) % 1;
    // zoom vers 1 sur la carte survolée, retour à 0 sinon
    const target = hovered >= 0 && hovered === zoomSlot ? 1 : 0;
    zk += Math.sign(target - zk) * Math.min(Math.abs(target - zk), (dt * 1000) / ZOOM_MS);
    if (zk === 0 && hovered < 0) zoomSlot = -1;
    draw();
    requestAnimationFrame(tick);
  };
  const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(tick); };
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }).observe(container);
  draw();
  start();
}

/* 5 emplacements : les captures des réalisations, en alternance */
const stage = document.querySelector(".belt");
if (stage) {
  const canvas = stage.querySelector("canvas");
  const srcs = (stage.dataset.images || "").split(",").map((s) => s.trim()).filter(Boolean);
  const links = (stage.dataset.links || "").split(",").map((s) => s.trim()).filter(Boolean);
  Promise.all(srcs.map((s) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(undefined); im.src = s; })))
    .then((loaded) => mount(stage, canvas,
      Array.from({ length: 5 }, (_, i) => loaded[i % loaded.length]),
      Array.from({ length: 5 }, (_, i) => links[i % links.length])));
}

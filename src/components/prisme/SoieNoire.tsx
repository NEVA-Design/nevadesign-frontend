"use client";

/*
 * SOIE NOIRE — le fond satin temps réel, porté depuis Neva Agency
 * (src/ui/Soie.js, module C20) et recalibré pour la DA noire de
 * Neva Design : un drapé de velours qui ondule très lentement,
 * crêtes d'argent minoritaires, JAMAIS de translation « photo qui
 * bouge » — la matière se recompose sur place (simplex 3D, la 3e
 * dimension est le temps).
 *
 * Différences avec l'original :
 *   - palette UNIQUE noire NEUTRE (écart R/G/B ≤ 2, loi DA 20/08) :
 *     velours [7,7,8], crêtes [40,40,42], éclat [55,55,57] ;
 *   - canvas FIXE plein viewport derrière tout le site (z -1) —
 *     les fonds de section sont des voiles translucides au-dessus ;
 *   - mobile tactile : UNE frame statique (même règle que la scène
 *     3D du hero — zéro rAF, zéro batterie) ; reduced-motion idem ;
 *   - WebGL absent / contexte perdu : le canvas disparaît, le
 *     body #060606 reste — jamais un site mort.
 *
 * Rendu interne à résolution réduite (0,5× desktop / 0,42× mobile,
 * plafond 1,2 Mpx) : le satin est basse fréquence, l'upscale
 * navigateur est invisible. Pause sur onglet caché.
 */

import { useEffect, useRef } from "react";

/* Réglages artistiques — le pupitre calibré de l'agence (preset B,
   itéré sur captures). Ne pas retoucher « de tête ». */
const ART = {
  angle: -0.52,
  aniso: 2.5,
  scale: 0.34,
  warp: 1.15,
  foldPow: 2.1,
  foldSpeed: 0.012,
  warpSpeed: 0.0055,
  driftX: 0.0036,
  driftY: -0.0022,
  lightSway: 0.078,
  relief: 20.0,
  specPow: 26.0,
  specAmp: 0.14,
  sheenAmp: 0.14,
  scrollDrift: 0.85,
  foldGain: 0.33,
  eps: 3.2,
  calmScale: 0.13,
  calmFloor: 0.55,
  calmLo: 0.35,
  calmHi: 0.8,
};

/* Palette noire NEUTRE — mapping tonal du velours de l'agence
   (ambient bas + crêtes vives minoritaires), teintes neutralisées. */
const PALETTE = {
  base: [7, 7, 8],
  high: [40, 40, 42],
  spec: [55, 55, 57],
  specGain: 0.6,
  rest: [7, 7, 8],
  presence: 0.9,
  ambient: 0.14,
  diffuse: 0.5,
};

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/* Simplex 3D — Ashima Arts / Stefan Gustavson (MIT, webgl-noise),
   recopié tel quel. */
const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec3 uBase;
uniform vec3 uHigh;
uniform vec3 uSpec;
uniform float uSpecGain;
uniform vec3 uRest;
uniform float uPresence;
uniform float uAmbient;
uniform float uDiffuse;
${NOISE_GLSL}

float fbm2(vec3 p) {
  return 0.5 + 0.5 * (snoise(p) * 0.667 + snoise(p * 2.0) * 0.333);
}
float fbmFold(vec3 p) {
  float s = snoise(p) * 0.5;
  float a = 0.5 * FOLD_GAIN;
  float n = 0.5;
  for (int i = 1; i < FOLD_OCT; i++) {
    p *= 2.0;
    s += a * snoise(p);
    n += a;
    a *= FOLD_GAIN;
  }
  return 0.5 + 0.5 * (s / n);
}

float fold(vec2 r, vec2 w, float t) {
  float h = fbmFold(vec3(
    r.x * SCALE + WARP * w.x,
    r.y * SCALE * ANISO + WARP * w.y + uScroll * SCROLL_DRIFT,
    t
  ));
  return pow(1.0 - abs(2.0 * h - 1.0), FOLD_POW);
}

float calmMask(vec2 r, float t) {
  float c = fbm2(vec3(r.x * CALM_SCALE, r.y * CALM_SCALE * 1.6, t));
  return CALM_FLOOR + (1.0 - CALM_FLOOR) * smoothstep(CALM_LO, CALM_HI, c);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float t = uTime;
  uv += t * vec2(DRIFT_X, DRIFT_Y);

  float ca = cos(ANGLE), sa = sin(ANGLE);
  vec2 r = vec2(uv.x * ca - uv.y * sa, uv.x * sa + uv.y * ca);

  float ws = SCALE * 0.5;
  float tw = t * WARP_SPEED;
  vec2 w = vec2(
    fbm2(vec3(r.x * ws, r.y * ws * ANISO, tw)),
    fbm2(vec3(r.x * ws + 5.2, r.y * ws * ANISO + 1.3, tw + 7.7))
  );

  float tf = t * FOLD_SPEED;
  float e = EPS / uRes.y;
  float calm = calmMask(r, tw * 0.6);
  float h0 = fold(r, w, tf) * calm;
  float hx = fold(r + vec2(e, 0.0), w, tf) * calm;
  float hy = fold(r + vec2(0.0, e), w, tf) * calm;
  vec3 nrm = normalize(vec3(-RELIEF * (hx - h0), -RELIEF * (hy - h0), 1.0));

  float sway = 0.5 + 0.5 * sin(t * LIGHT_SWAY);
  vec3 L = normalize(mix(vec3(-0.62, 0.52, 0.56), vec3(-0.38, 0.66, 0.55), sway));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

  float ndl = max(0.0, dot(nrm, L));
  float ndh = max(0.0, dot(nrm, H));

  float spec = SPEC_AMP * pow(ndh, SPEC_POW);
  float sheen = SHEEN_AMP * pow(ndh, 3.0);

  float g = clamp(uAmbient + uDiffuse * (ndl - 0.62) + sheen, 0.0, 1.0);
  vec3 col = mix(uBase, uHigh, g) + uSpec * (spec * uSpecGain);
  col = min(col, uSpec);
  col = mix(uRest, col, uPresence);

  float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dn - 0.5) * (1.6 / 255.0);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

type Engine = {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  U: Record<string, WebGLUniformLocation | null>;
};

function createEngine(canvas: HTMLCanvasElement, foldOct: number): Engine | null {
  const opts = { alpha: false, antialias: false, depth: false, stencil: false };
  const gl = (canvas.getContext("webgl2", opts) ||
    canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;
  if (!gl) return null;

  const defines =
    `#define FOLD_OCT ${foldOct}\n` +
    `#define ANGLE ${ART.angle.toFixed(4)}\n` +
    `#define ANISO ${ART.aniso.toFixed(4)}\n` +
    `#define SCALE ${ART.scale.toFixed(4)}\n` +
    `#define WARP ${ART.warp.toFixed(4)}\n` +
    `#define FOLD_POW ${ART.foldPow.toFixed(4)}\n` +
    `#define FOLD_SPEED ${ART.foldSpeed.toFixed(5)}\n` +
    `#define WARP_SPEED ${ART.warpSpeed.toFixed(5)}\n` +
    `#define DRIFT_X ${ART.driftX.toFixed(5)}\n` +
    `#define DRIFT_Y ${ART.driftY.toFixed(5)}\n` +
    `#define LIGHT_SWAY ${ART.lightSway.toFixed(5)}\n` +
    `#define RELIEF ${ART.relief.toFixed(2)}\n` +
    `#define SPEC_POW ${ART.specPow.toFixed(2)}\n` +
    `#define SPEC_AMP ${ART.specAmp.toFixed(4)}\n` +
    `#define SHEEN_AMP ${ART.sheenAmp.toFixed(4)}\n` +
    `#define SCROLL_DRIFT ${ART.scrollDrift.toFixed(4)}\n` +
    `#define FOLD_GAIN ${ART.foldGain.toFixed(4)}\n` +
    `#define EPS ${ART.eps.toFixed(3)}\n` +
    `#define CALM_SCALE ${ART.calmScale.toFixed(4)}\n` +
    `#define CALM_FLOOR ${ART.calmFloor.toFixed(4)}\n` +
    `#define CALM_LO ${ART.calmLo.toFixed(4)}\n` +
    `#define CALM_HI ${ART.calmHi.toFixed(4)}\n`;

  function compile(type: number, src: string) {
    const sh = gl!.createShader(type);
    if (!sh) return null;
    gl!.shaderSource(sh, src);
    gl!.compileShader(sh);
    if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
      console.warn("[soie]", gl!.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, defines + FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "uRes"),
    time: gl.getUniformLocation(prog, "uTime"),
    scroll: gl.getUniformLocation(prog, "uScroll"),
    base: gl.getUniformLocation(prog, "uBase"),
    high: gl.getUniformLocation(prog, "uHigh"),
    spec: gl.getUniformLocation(prog, "uSpec"),
    specGain: gl.getUniformLocation(prog, "uSpecGain"),
    rest: gl.getUniformLocation(prog, "uRest"),
    presence: gl.getUniformLocation(prog, "uPresence"),
    ambient: gl.getUniformLocation(prog, "uAmbient"),
    diffuse: gl.getUniformLocation(prog, "uDiffuse"),
  };
  return { gl, U };
}

export default function SoieNoire() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMobile = false;
    let reduced = false;
    try {
      isMobile =
        window.matchMedia("(pointer: coarse) and (hover: none)").matches &&
        window.innerWidth < 1024;
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* matchMedia indisponible */
    }
    const statique = isMobile || reduced;

    const engine = createEngine(canvas, isMobile ? 3 : 4);
    if (!engine) {
      /* pas de WebGL : le body #060606 reste, aucun fallback à gérer */
      canvas.style.display = "none";
      return;
    }
    const { gl, U } = engine;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderScale = isMobile ? 0.42 : 0.5;
    const cv = canvas;
    function resize() {
      let w = Math.max(1, Math.round(window.innerWidth * dpr * renderScale));
      let h = Math.max(1, Math.round(window.innerHeight * dpr * renderScale));
      const over = Math.sqrt((w * h) / 1200000);
      if (over > 1) {
        w = Math.round(w / over);
        h = Math.round(h / over);
      }
      if (w === cv.width && h === cv.height) return;
      cv.width = w;
      cv.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, w, h);
    }
    resize();

    gl.uniform3f(U.base, PALETTE.base[0] / 255, PALETTE.base[1] / 255, PALETTE.base[2] / 255);
    gl.uniform3f(U.high, PALETTE.high[0] / 255, PALETTE.high[1] / 255, PALETTE.high[2] / 255);
    gl.uniform3f(U.spec, PALETTE.spec[0] / 255, PALETTE.spec[1] / 255, PALETTE.spec[2] / 255);
    gl.uniform3f(U.rest, PALETTE.rest[0] / 255, PALETTE.rest[1] / 255, PALETTE.rest[2] / 255);
    gl.uniform1f(U.specGain, PALETTE.specGain);
    gl.uniform1f(U.presence, PALETTE.presence);
    gl.uniform1f(U.ambient, PALETTE.ambient);
    gl.uniform1f(U.diffuse, PALETTE.diffuse);

    /* départ dans un beau moment du champ, pas au zéro dégénéré */
    let time = 120;
    let scrollCur = 0;
    let playing = false;
    let rafId = 0;
    let tPrev = 0;
    let alive = true;

    const scrollTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };

    function draw() {
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.scroll, scrollCur);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function renderOnce() {
      scrollCur = scrollTarget();
      draw();
    }
    function frame(now: number) {
      if (!playing || !alive) return;
      const dt = Math.min(now - tPrev, 100) * 0.001;
      tPrev = now;
      time += dt;
      const k = 1 - Math.exp(-dt / 0.35);
      scrollCur += (scrollTarget() - scrollCur) * k;
      draw();
      rafId = requestAnimationFrame(frame);
    }
    function play() {
      if (playing || statique) {
        if (!playing) renderOnce();
        return;
      }
      playing = true;
      tPrev = performance.now();
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      playing = false;
      cancelAnimationFrame(rafId);
    }

    play();

    const onVisibility = () => {
      if (document.hidden) stop();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        resize();
        if (!playing) renderOnce();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      canvas.style.display = "none";
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.clearTimeout(resizeT);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}

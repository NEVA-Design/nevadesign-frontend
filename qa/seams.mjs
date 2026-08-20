// Détection de marches horizontales de FOND (G2) sur les frames scroll.
// v2 (QA 20/08) : mesure sur les MARGES latérales nues (le contenu vit
// dans le conteneur central) et ne retient que les ÉCHELONS — la
// luminance change et RESTE changée (une couture de fond). Les filets
// de design (impulsions 1-2 px qui redescendent) sont ignorés, de même
// que la barre de nav sticky (y < 80).
// Usage : node qa/seams.mjs [--iter=2] [--seuil=2.2] [--persist=1.8]
import { createRequire } from "module";
import { readdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../package.json"));
const sharp = require("sharp");

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith("--")).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const ITER = String(args.iter || "2");
const SEUIL = Number(args.seuil || 2.2); // saut min (niveaux 0-255) entre lignes
const PERSIST = Number(args.persist || 1.8); // écart min soutenu ±10 px = échelon
const DIR = resolve(__dirname, `../../captures/qa/iter-${ITER}`);

const files = readdirSync(DIR).filter(f => /^scroll-.*\.png$/.test(f));
let total = 0;
for (const f of files) {
  const { data, info } = await sharp(join(DIR, f)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  // bandes de marge : 8..130 et w-130..w-8 (fond nu aux deux bords)
  const cols = [];
  for (let x = 8; x <= 130; x += 4) cols.push(x);
  for (let x = w - 130; x <= w - 8; x += 4) cols.push(x);
  const lumRow = (y) => {
    let a = 0;
    for (const x of cols) a += data[y * w + x];
    return a / cols.length;
  };
  const findings = [];
  for (let y = 92; y < h - 14; y++) {
    const jump = Math.abs(lumRow(y + 1) - lumRow(y));
    if (jump < SEUIL) continue;
    // échelon ? moyenne 4-12 px au-dessus vs 4-12 px en dessous
    let above = 0, below = 0;
    for (let d = 4; d <= 12; d++) { above += lumRow(y - d); below += lumRow(y + 1 + d); }
    const step = Math.abs(below - above) / 9;
    if (step >= PERSIST) findings.push({ y, step: +step.toFixed(1) });
  }
  const merged = [];
  for (const s of findings) {
    const last = merged[merged.length - 1];
    if (last && s.y - last.yEnd <= 3) { last.yEnd = s.y; last.step = Math.max(last.step, s.step); }
    else merged.push({ y: s.y, yEnd: s.y, step: s.step });
  }
  if (merged.length) {
    total += merged.length;
    console.log(`${f}: ${merged.length} échelon(s) → ${merged.map(m => `y=${m.y}${m.yEnd > m.y ? "-" + m.yEnd : ""} (Δ${m.step})`).join(", ")}`);
  }
}
console.log(total === 0 ? "G2: PASS (aucun échelon de fond)" : `G2: ${total} échelon(s) de fond à examiner`);

// Détection de marches horizontales de fond (G2) sur les frames scroll.
// Une « marche » = saut de luminance entre deux lignes adjacentes, soutenu
// sur une large part de la largeur (un bord de contenu local ne l'est pas).
// Usage : node qa/seams.mjs [--iter=1] [--seuil=2.2] [--part=0.62]
import { createRequire } from "module";
import { readdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../package.json"));
const sharp = require("sharp");

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith("--")).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const ITER = String(args.iter || "1");
const SEUIL = Number(args.seuil || 2.2); // niveaux (0-255) de saut min entre lignes
const PART = Number(args.part || 0.62); // fraction de la largeur qui doit sauter ensemble
const DIR = resolve(__dirname, `../../captures/qa/iter-${ITER}`);

const files = readdirSync(DIR).filter(f => /^scroll-.*\.png$/.test(f));
let total = 0;
for (const f of files) {
  const img = sharp(join(DIR, f)).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const rows = [];
  // lignes suspectes : |lum(x,y+1) − lum(x,y)| > SEUIL sur ≥ PART de la largeur
  const findings = [];
  for (let y = 8; y < h - 9; y++) {
    let jump = 0;
    for (let x = 0; x < w; x += 2) {
      const a = data[y * w + x];
      const b = data[(y + 1) * w + x];
      if (Math.abs(a - b) >= SEUIL) jump++;
    }
    const frac = jump / (w / 2);
    if (frac >= PART) findings.push({ y, frac: +frac.toFixed(2) });
  }
  // fusion des lignes contiguës (une vraie marche = 1-3 lignes)
  const merged = [];
  for (const s of findings) {
    const last = merged[merged.length - 1];
    if (last && s.y - last.yEnd <= 2) { last.yEnd = s.y; last.frac = Math.max(last.frac, s.frac); }
    else merged.push({ y: s.y, yEnd: s.y, frac: s.frac });
  }
  if (merged.length) {
    total += merged.length;
    console.log(`${f}: ${merged.length} marche(s) → ${merged.map(m => `y=${m.y}${m.yEnd > m.y ? "-" + m.yEnd : ""} (${Math.round(m.frac * 100)}%)`).join(", ")}`);
  }
}
console.log(total === 0 ? "G2: PASS (aucune marche détectée)" : `G2: ${total} marche(s) à examiner`);

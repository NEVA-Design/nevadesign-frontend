// Découpe une capture pleine page en tuiles lisibles (refonte 50k).
// Usage : node qa/crop.mjs <image> [--h=1600] [--out=dossier] [--top=0] [--max=99]
// Sorties : <out>/<nom>-t<N>.png (tuiles pleine largeur, hauteur h, chevauchement 80px)
import sharp from "sharp";
import { mkdirSync } from "fs";
import { basename, dirname, join, resolve } from "path";

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith("--")).map(a => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const src = process.argv[2];
if (!src || src.startsWith("--")) {
  console.error("usage: node qa/crop.mjs <image> [--h=1600] [--out=dossier] [--top=0] [--max=99]");
  process.exit(1);
}
const H = Number(args.h || 1600);
const OVERLAP = 80;
const TOP = Number(args.top || 0);
const MAX = Number(args.max || 99);
const outDir = resolve(args.out || join(dirname(resolve(src)), "crops"));
mkdirSync(outDir, { recursive: true });

const img = sharp(resolve(src));
const meta = await img.metadata();
const name = basename(src).replace(/\.(png|jpe?g|webp)$/i, "");
let n = 0;
for (let y = TOP; y < meta.height && n < MAX; y += H - OVERLAP) {
  const h = Math.min(H, meta.height - y);
  if (h < 120) break;
  const out = join(outDir, `${name}-t${String(n).padStart(2, "0")}-y${y}.png`);
  await sharp(resolve(src)).extract({ left: 0, top: y, width: meta.width, height: h }).png().toFile(out);
  n++;
}
console.log(`${n} tuiles → ${outDir} (source ${meta.width}×${meta.height})`);

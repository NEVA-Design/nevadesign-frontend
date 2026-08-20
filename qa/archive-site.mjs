// Archive le jeu standard ../captures/site/ depuis une itération QA
// (protocole CLAUDE.md : un fichier par écran et par largeur, noms stables).
// Usage : node qa/archive-site.mjs --iter=3
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith("--")).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const SRC = resolve(__dirname, `../../captures/qa/iter-${args.iter || "2"}`);
const DST = resolve(__dirname, "../../captures/site");
mkdirSync(DST, { recursive: true });

// full-<name>-<vp>.png → <écran>-<vp>.png (conventions du jeu standard)
const MAP = {
  home: "home", "home-en": "home-en", vitrine: "vitrine", login: "login", signup: "signup", forgot: "forgot-password",
  "dash-projets": "projets-vue", "dash-projet": "projet-page", "dash-editeur": "editeur",
  "dash-settings": "settings", "dash-billing": "billing", "dash-downloads": "downloads",
  "admin-overview": "admin-overview",
};
let n = 0;
for (const [src, dst] of Object.entries(MAP)) {
  for (const vp of ["390", "768", "1440", "2560"]) {
    const f = join(SRC, `full-${src}-${vp}.png`);
    if (existsSync(f)) { copyFileSync(f, join(DST, `${dst}-${vp}.png`)); n++; }
  }
}
console.log(`${n} captures archivées → ${DST}`);

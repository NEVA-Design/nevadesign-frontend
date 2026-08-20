// Harnais QA Neva Design — capture + audits automatiques.
// Usage : node qa/capture.mjs [--only=fullpage,scroll,hover,load,media,fps] [--iter=1] [--base=http://localhost:3001]
// Sorties : ../captures/qa/iter-<N>/  (hors repo git) + qa/report-iter-<N>.json
import { createRequire } from "module";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../outillage/package.json"));
const { chromium } = require("playwright");

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith("--")).map(a => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const BASE = args.base || "http://localhost:3001";
const ITER = String(args.iter || "1");
const ONLY = args.only ? String(args.only).split(",") : ["fullpage", "scroll", "hover", "load", "media", "fps"];
const OUT = resolve(__dirname, `../../captures/qa/iter-${ITER}`);
mkdirSync(OUT, { recursive: true });

const report = { iter: ITER, base: BASE, startedAt: new Date().toISOString(), media: {}, fps: null, rotation: null, load: null, errors: [] };

// ---------- Pages ----------
const PROJECT_ID = "30abe9c7-847e-4e3c-9b75-67856e59dbec"; // Les Santos Nights (dev-store)
const ASSET_ID = "5a396f65-d063-4e2d-b9b9-3ef3687b7dac"; // logo du projet

const PUBLIC_PAGES = [
  { name: "home", url: "/" },
  { name: "home-en", url: "/", locale: "en" },
  { name: "vitrine", url: "/neva-design" },
  { name: "login", url: "/login" },
  { name: "signup", url: "/signup" },
  { name: "forgot", url: "/forgot-password" },
];
const AUTH_PAGES = [
  { name: "dash-projets", url: "/dashboard" },
  { name: "dash-projet", url: `/dashboard/projects/${PROJECT_ID}` },
  { name: "dash-editeur", url: `/dashboard/projects/${PROJECT_ID}/assets/${ASSET_ID}` },
  { name: "dash-settings", url: "/dashboard/settings" },
  { name: "dash-billing", url: "/dashboard/billing" },
  { name: "dash-downloads", url: "/dashboard/downloads" },
  { name: "admin-overview", url: "/admin/overview" },
];
const VIEWPORTS = [
  { w: 390, h: 844, tag: "390", touch: true },
  { w: 768, h: 1024, tag: "768", touch: true },
  { w: 1440, h: 900, tag: "1440", touch: false },
  { w: 2560, h: 1440, tag: "2560", touch: false },
];

// Cibles de hover : { name, url, selector, auth }
const HOVER_TARGETS = [
  { name: "nav-lien", url: "/", selector: "header nav a", auth: false },
  { name: "btn-primaire", url: "/", selector: "[data-qa='cta-primaire'], a[href='/signup']", auth: false },
  { name: "btn-secondaire", url: "/", selector: "[data-qa='cta-secondaire']", auth: false },
  { name: "tuile-marquee", url: "/", selector: "[data-qa='marquee-tuile'], .pv-marquee a, .pv-marquee figure", auth: false },
  { name: "ligne-avis", url: "/", selector: "[data-qa='avis-ligne']", auth: false },
  { name: "carte-modele", url: "/", selector: "[data-qa='modele-carte']", auth: false },
  { name: "carte-projet", url: "/dashboard", selector: "[data-qa='projet-carte'], a[href*='/dashboard/projects/']", auth: true },
];

// ---------- Helpers ----------
const log = (...a) => console.log(`[qa]`, ...a);

async function hideDevOverlay(page) {
  await page.evaluate(() => {
    const p = document.querySelector("nextjs-portal");
    if (p) p.style.display = "none";
  }).catch(() => {});
}

async function switchLocale(page, code) {
  const btn = page.locator(`[aria-label='Langue'] button`, { hasText: code }).first();
  if (await btn.count()) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(800);
  }
}

async function settleAndScroll(page) {
  // attendre les timelines d'entrée puis déclencher tous les reveals once:true + lazy imgs
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    const max = () => document.documentElement.scrollHeight - window.innerHeight;
    for (let y = 0; y <= max(); y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 350));
    }
    window.scrollTo(0, max());
    await new Promise(r => setTimeout(r, 500));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

function collectBrokenRequests(page, bucket) {
  page.on("response", resp => {
    const s = resp.status();
    if (s >= 400) {
      const u = resp.url();
      if (u.startsWith(BASE) || /\.(png|jpe?g|webp|avif|svg|gif|mp4|webm|glb|gltf|ktx2|basis|hdr|exr|woff2?)(\?|$)/i.test(u)) {
        bucket.push({ status: s, url: u });
      }
    }
  });
  // note : les requestfailed ERR_ABORTED sont des annulations (scroll/navigation),
  // pas des fichiers manquants — on les confirme par un HEAD avant de les compter.
  page.on("requestfailed", req => {
    const u = req.url();
    if (u.startsWith(BASE)) bucket.push({ status: "FAILED " + (req.failure()?.errorText || ""), url: u, unconfirmed: true });
  });
}

async function confirmBroken(bucket) {
  const out = [];
  const seen = new Set();
  for (const b of bucket) {
    if (seen.has(b.url)) continue;
    seen.add(b.url);
    if (!b.unconfirmed) { out.push(b); continue; }
    try {
      const r = await fetch(b.url, { method: "HEAD" });
      if (!r.ok) out.push({ ...b, confirmedStatus: r.status });
    } catch { out.push({ ...b, confirmedStatus: "UNREACHABLE" }); }
  }
  return out;
}

async function auditMediaInPage(page) {
  // <img>, <video>, background-image → liste des cassés
  return page.evaluate(async () => {
    const broken = [];
    for (const img of Array.from(document.querySelectorAll("img"))) {
      if (img.loading === "lazy") img.loading = "eager";
      if (!img.complete) await new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 4000); });
      if (img.naturalWidth === 0) broken.push({ kind: "img", src: img.currentSrc || img.src, alt: img.alt || "" });
    }
    for (const v of Array.from(document.querySelectorAll("video"))) {
      if (v.readyState === 0 && v.networkState === 3) broken.push({ kind: "video", src: v.currentSrc || v.src });
    }
    const seen = new Set();
    const urls = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        for (const m of bg.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
          const u = m[2];
          if (u && !u.startsWith("data:") && !seen.has(u)) { seen.add(u); urls.push(u); }
        }
      }
    }
    for (const u of urls) {
      try {
        const r = await fetch(u, { method: "HEAD" });
        if (!r.ok) broken.push({ kind: "background", src: u, status: r.status });
      } catch { broken.push({ kind: "background", src: u, status: "FETCH_FAIL" }); }
    }
    return broken;
  });
}

async function loginStorageState(browser) {
  const statePath = join(OUT, "auth-state.json");
  if (existsSync(statePath)) return statePath;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.fill("input[type='email']", "qa@neva.dev");
  await page.fill("input[type='password']", "qa-password-1");
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard**", { timeout: 20000 }).catch(async () => {
    // certains flows repassent par /login?redirect= — retenter une navigation directe
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  });
  await page.waitForTimeout(2000);
  await ctx.storageState({ path: statePath });
  await ctx.close();
  log("session dev enregistrée →", statePath);
  return statePath;
}

// ---------- 1. Full-page ----------
// Les pages publiques se capturent SANS session (connecté, /login redirige
// vers /dashboard) ; les pages produit avec le storageState.
const PAGE_FILTER = args.pages ? String(args.pages).split(",") : null;

async function runFullpage(browser, statePath) {
  for (const vp of VIEWPORTS) {
    const broken = [];
    for (const [pages, state] of [[PUBLIC_PAGES, undefined], [AUTH_PAGES, statePath]]) {
      const wanted = PAGE_FILTER ? pages.filter(p => PAGE_FILTER.includes(p.name)) : pages;
      if (!wanted.length) continue;
      const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
        hasTouch: vp.touch,
        deviceScaleFactor: 1,
        ...(state ? { storageState: state } : {}),
      });
      const page = await ctx.newPage();
      collectBrokenRequests(page, broken);
      for (const p of wanted) {
        try {
          await page.goto(BASE + p.url, { waitUntil: "load", timeout: 60000 });
          if (p.locale) await switchLocale(page, p.locale);
          await settleAndScroll(page);
          await hideDevOverlay(page);
          await page.screenshot({ path: join(OUT, `full-${p.name}-${vp.tag}.png`), fullPage: true, animations: "disabled" });
          log(`full ${p.name} @${vp.tag} ok`);
        } catch (e) {
          report.errors.push(`fullpage ${p.name}@${vp.tag}: ${e.message}`);
          log(`ERREUR full ${p.name}@${vp.tag}:`, e.message.split("\n")[0]);
        }
      }
      await ctx.close();
    }
    report.media[`requests-${vp.tag}`] = await confirmBroken(broken);
  }
}

// ---------- 2. Scroll-through home ----------
async function runScrollThrough(browser, statePath) {
  const targets = [
    { name: "home", url: "/", auth: false },
    { name: "dash-projets", url: "/dashboard", auth: true },
    { name: "dash-projet", url: `/dashboard/projects/${PROJECT_ID}`, auth: true },
    { name: "admin-overview", url: "/admin/overview", auth: true },
  ];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, storageState: statePath });
  const page = await ctx.newPage();
  for (const t of targets) {
    try {
      await page.goto(BASE + t.url, { waitUntil: "load", timeout: 60000 });
      await settleAndScroll(page);
      await hideDevOverlay(page);
      const steps = await page.evaluate(() => Math.ceil((document.documentElement.scrollHeight - window.innerHeight) / window.innerHeight));
      for (let i = 0; i <= steps; i++) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), i * 900);
        await page.waitForTimeout(650);
        await page.screenshot({ path: join(OUT, `scroll-${t.name}-${String(i).padStart(2, "0")}.png`) });
      }
      log(`scroll ${t.name}: ${steps + 1} pas`);
    } catch (e) {
      report.errors.push(`scroll ${t.name}: ${e.message}`);
    }
  }
  await ctx.close();
}

// ---------- 3. Hovers ----------
async function runHovers(browser, statePath) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, storageState: statePath });
  const page = await ctx.newPage();
  let currentUrl = null;
  for (const t of HOVER_TARGETS) {
    try {
      if (currentUrl !== t.url) {
        await page.goto(BASE + t.url, { waitUntil: "load", timeout: 60000 });
        await settleAndScroll(page);
        await hideDevOverlay(page);
        currentUrl = t.url;
      }
      const el = page.locator(t.selector).first();
      if ((await el.count()) === 0) { report.errors.push(`hover ${t.name}: sélecteur introuvable (${t.selector})`); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.hover({ force: true });
      await page.waitForTimeout(450); // transitions 180-220ms + marge
      await page.screenshot({ path: join(OUT, `hover-${t.name}.png`) });
      log(`hover ${t.name} ok`);
    } catch (e) {
      report.errors.push(`hover ${t.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}

// ---------- 4. Séquence de chargement (Fast 3G, frames 250 ms) ----------
async function runLoadSequence(browser) {
  const dir = join(OUT, "load-frames");
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    recordVideo: { dir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
  const frames = [];
  const t0 = Date.now();
  const nav = page.goto(BASE + "/", { waitUntil: "load", timeout: 90000 }).catch(e => log("load nav:", e.message.split("\n")[0]));
  // 1 frame / 250 ms pendant 12 s depuis navigation start
  for (let i = 0; i < 48; i++) {
    const target = t0 + i * 250;
    const wait = target - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    const ms = Date.now() - t0;
    try {
      await page.screenshot({ path: join(dir, `f-${String(i).padStart(2, "0")}-${ms}ms.jpg`), quality: 70, type: "jpeg", timeout: 240 });
      frames.push(ms);
    } catch { /* frame sautée si screenshot > 240ms */ }
  }
  await nav;
  report.load = { framesCaptured: frames.length, dir: "load-frames/" };
  log(`load: ${frames.length}/48 frames capturées`);
  await ctx.close();
}

// ---------- 5. FPS + rotation ----------
async function runFps(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  // scene-tier=high forcé : le détecteur classerait le headless (SwiftShader)
  // en low et démonterait le canvas — fps headless à lire comme un plancher,
  // la mesure G9 de référence se fait en --headed.
  await page.goto(BASE + "/?scene-tier=high", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000); // laisser le loader finir + reveal
  const fps = await page.evaluate(() => new Promise(resolve => {
    const deltas = [];
    let last = performance.now();
    let n = 0;
    function tick(t) {
      deltas.push(t - last); last = t;
      if (++n < 600 && t - deltas[0] < 10000) requestAnimationFrame(tick);
      else {
        const d = deltas.slice(5);
        const avg = d.reduce((a, b) => a + b, 0) / d.length;
        resolve({ avgMs: +avg.toFixed(2), fps: +(1000 / avg).toFixed(1), frames: d.length });
      }
    }
    requestAnimationFrame(tick);
  }));
  report.fps = fps;
  log("fps hero:", JSON.stringify(fps));
  // rotation : hook exposé par la scène (window.__nevaQA.rotationY()) — instrumenté côté code
  const rot = await page.evaluate(async () => {
    const qa = window.__nevaQA;
    if (!qa || !qa.rotationY) return { error: "hook __nevaQA absent" };
    const a = qa.rotationY();
    await new Promise(r => setTimeout(r, 1000));
    const b = qa.rotationY();
    return { degPerSec: +(Math.abs(b - a) * 180 / Math.PI).toFixed(2) };
  });
  report.rotation = rot;
  log("rotation:", JSON.stringify(rot));
  await ctx.close();
}

// ---------- 6. Audit médias dans le DOM (toutes pages) ----------
async function runMediaAudit(browser, statePath) {
  const netBroken = [];
  const domBroken = {};
  for (const [pages, state] of [[PUBLIC_PAGES, undefined], [AUTH_PAGES, statePath]]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...(state ? { storageState: state } : {}) });
    const page = await ctx.newPage();
    collectBrokenRequests(page, netBroken);
    for (const p of pages) {
      try {
        await page.goto(BASE + p.url, { waitUntil: "load", timeout: 60000 });
        if (p.locale) await switchLocale(page, p.locale);
        await settleAndScroll(page);
        const b = await auditMediaInPage(page);
        if (b.length) domBroken[p.name] = b;
      } catch (e) {
        report.errors.push(`media ${p.name}: ${e.message.split("\n")[0]}`);
      }
    }
    await ctx.close();
  }
  report.media.dom = domBroken;
  report.media.network = await confirmBroken(netBroken);
  const total = Object.values(domBroken).flat().length + report.media.network.length;
  report.media.verdict = total === 0 ? "PASS" : `FAIL (${total} cassés)`;
  log("médias:", report.media.verdict);
}

// ---------- main ----------
const browser = await chromium.launch({ headless: !args.headed });
try {
  const needAuth = ONLY.some(k => ["fullpage", "scroll", "hover", "media"].includes(k));
  const statePath = needAuth ? await loginStorageState(browser) : undefined;
  if (ONLY.includes("fullpage")) await runFullpage(browser, statePath);
  if (ONLY.includes("scroll")) await runScrollThrough(browser, statePath);
  if (ONLY.includes("hover")) await runHovers(browser, statePath);
  if (ONLY.includes("load")) await runLoadSequence(browser);
  if (ONLY.includes("fps")) await runFps(browser);
  if (ONLY.includes("media")) await runMediaAudit(browser, statePath);
} finally {
  await browser.close();
}
report.finishedAt = new Date().toISOString();
writeFileSync(join(__dirname, `report-iter-${ITER}.json`), JSON.stringify(report, null, 2));
log("rapport →", `qa/report-iter-${ITER}.json`, "captures →", OUT);
if (report.media.verdict && report.media.verdict.startsWith("FAIL")) process.exitCode = 1;

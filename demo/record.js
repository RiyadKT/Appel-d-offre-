/**
 * Capture une démo vidéo du produit via Playwright + ffmpeg.
 * Usage : node demo/record.js
 * Output : demo/output/demo.mp4
 */

const { chromium } = require("playwright");
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3002";
const OUT_DIR = path.join(__dirname, "output");
const FRAMES_DIR = path.join(OUT_DIR, "frames");
const FPS = 10;

fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameIndex = 0;

async function shot(page, label = "") {
  const file = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, "0")}.png`);
  await page.screenshot({ path: file, fullPage: false });
  frameIndex++;
  if (label) console.log(`  📸 ${label}`);
}

// Capture N frames identiques = N/FPS secondes de pause
async function pause(page, seconds) {
  const count = Math.round(seconds * FPS);
  for (let i = 0; i < count; i++) await shot(page);
}

async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
}

(async () => {
  console.log("🎬 Démarrage de la capture démo…\n");

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // ─── 1. Landing page ───────────────────────────────────────────────────────
  console.log("▶ Landing page");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await pause(page, 2);

  // Scroll doux vers les features
  for (let y = 0; y <= 600; y += 40) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 1.5);

  // Scroll vers stats
  for (let y = 600; y <= 1100; y += 40) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 1.5);

  // Scroll retour haut
  for (let y = 1100; y >= 0; y -= 60) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 0.5);

  // ─── 2. Dashboard ──────────────────────────────────────────────────────────
  console.log("▶ Dashboard");
  await page.click('a[href="/dashboard"]');
  await page.waitForLoadState("networkidle");
  await pause(page, 2);

  // Scroll vers les stats cards
  for (let y = 0; y <= 300; y += 20) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 1.5);

  // Scroll vers le kanban
  for (let y = 300; y <= 700; y += 20) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 2);

  // Interagir : changer le filtre score
  console.log("  🎚️  Interaction filtre score");
  const slider = page.locator('input[type="range"]');
  await slider.fill("50");
  await pause(page, 1);
  await slider.fill("70");
  await pause(page, 1);
  await slider.fill("0");
  await pause(page, 0.5);

  // Scroll vers bas du kanban
  for (let y = 700; y <= 1400; y += 30) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 1.5);

  // Interagir : changer le statut d'un AO
  console.log("  🖱️  Changement statut AO");
  await scrollTo(page, 800);
  await shot(page);
  const selects = page.locator("select");
  const count = await selects.count();
  if (count > 0) {
    await selects.nth(0).selectOption("shortlisted");
    await pause(page, 0.8);
  }
  await pause(page, 1);

  // ─── 3. Profil ─────────────────────────────────────────────────────────────
  console.log("▶ Profil entreprise");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle" });
  await scrollTo(page, 0);
  await pause(page, 1.5);

  // Scroll section par section
  const stops = [0, 300, 600, 900, 1200, 1500, 1800, 2100];
  for (const stop of stops) {
    for (let y = (stops[stops.indexOf(stop) - 1] || 0); y <= stop; y += 25) {
      await scrollTo(page, y);
      await shot(page);
    }
    await pause(page, 1.2);
  }

  // Interagir : toggle un lot
  console.log("  🔘 Toggle lot");
  await scrollTo(page, 400);
  const lotBtns = page.locator("button").filter({ hasText: "Électricité" });
  if (await lotBtns.count() > 0) {
    await lotBtns.first().click();
    await pause(page, 0.6);
    await lotBtns.first().click();
    await pause(page, 0.4);
  }

  // Interagir : ajouter un mot-clé
  console.log("  ⌨️  Saisie mot-clé");
  await scrollTo(page, 2200);
  await pause(page, 0.5);
  const kwInput = page.locator('input[placeholder*="mot-clé"]');
  if (await kwInput.count() > 0) {
    await kwInput.click();
    await kwInput.type("réhabilitation", { delay: 60 });
    await page.keyboard.press("Enter");
    await pause(page, 1);
  }

  // Scroll jusqu'au bouton save + clic
  await scrollTo(page, 99999);
  await pause(page, 1);
  const saveBtn = page.locator("button", { hasText: "Sauvegarder" });
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await pause(page, 1.5);
  }

  // ─── 4. Pricing ────────────────────────────────────────────────────────────
  console.log("▶ Page Tarifs");
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
  await scrollTo(page, 0);
  await pause(page, 1.5);

  for (let y = 0; y <= 1600; y += 35) {
    await scrollTo(page, y);
    await shot(page);
  }
  await pause(page, 2);

  // ─── 5. Retour dashboard ───────────────────────────────────────────────────
  console.log("▶ Retour Dashboard — plan final");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await scrollTo(page, 0);
  await pause(page, 2.5);

  await browser.close();

  const totalFrames = frameIndex;
  const duration = (totalFrames / FPS).toFixed(1);
  console.log(`\n✅ ${totalFrames} frames capturées (${duration}s @ ${FPS}fps)`);

  // ─── Assemblage ffmpeg ─────────────────────────────────────────────────────
  console.log("\n🎞️  Assemblage de la vidéo avec ffmpeg…");
  const outputPath = path.join(OUT_DIR, "demo.mp4");

  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" \
      -vf "scale=1440:900,format=yuv420p" \
      -c:v libx264 -preset slow -crf 18 \
      "${outputPath}"`,
    { stdio: "inherit" }
  );

  console.log(`\n🎬 Vidéo générée : ${outputPath}`);
  console.log(`   Durée : ${duration}s | Résolution : 1440×900`);

  // Nettoyage frames
  fs.rmSync(FRAMES_DIR, { recursive: true });
  console.log("🧹 Frames temporaires supprimées");
})();

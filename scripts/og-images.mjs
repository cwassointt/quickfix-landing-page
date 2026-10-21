// Genera las imágenes de vista previa (WhatsApp, Facebook, X) de cada página: fondo naranja de marca
// y texto negro en Space Grotesk, como el "QuickFix" del footer. Salen en public/og/<nombre>.jpg (1200×630).
// No corre en `npm run build`: necesita Chrome instalado. Vuelve a correrlo si cambias un título:
//   node scripts/og-images.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("No encontré Chrome. Instálalo o agrega su ruta en scripts/og-images.mjs.");

// Nombre del archivo → texto. Debe coincidir con ogImage() en src/lib/seo.ts (una prueba lo verifica).
const images = {
  inicio: null, // solo la marca, grande
  "mantenimiento-asus-rog": "Mantenimiento ASUS ROG",
  "mantenimiento-laptop-gamer": "Mantenimiento de laptop gamer",
  "mantenimiento-pc-gamer": "Mantenimiento de PC gamer",
  "mantenimiento-tarjeta-grafica": "Mantenimiento de tarjeta gráfica",
  "mantenimiento-macbook": "Mantenimiento de MacBook",
  "mantenimiento-ps5-ps4": "Mantenimiento de PS5 y PS4",
  "reparacion-placa-laptop": "Reparación de placa de laptop y GPU",
  componentes: "Componentes y upgrades",
  garantia: "Garantía",
  terminos: "Términos y condiciones",
};

// Texto grande abajo a la izquierda, como el "QuickFix" del footer. El tamaño del título se ajusta al largo
// para que entre en dos líneas como máximo.
const titleSize = (t) => (t.length <= 12 ? 168 : t.length <= 24 ? 128 : 104);
const page = (title) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; background: #FF6600; color: #000; font-family: "Space Grotesk", sans-serif; overflow: hidden; }
  body { display: flex; flex-direction: column; justify-content: space-between; padding: 64px 72px 60px; }
  .top { display: flex; justify-content: space-between; align-items: baseline; font-weight: 500; font-size: 30px; letter-spacing: -0.01em; }
  .brand { font-weight: 700; letter-spacing: -0.055em; }
  .top .brand { font-size: 52px; line-height: 1; }
  .hero { font-size: 290px; line-height: 0.78; margin-left: -10px; padding-bottom: 34px; }
  .title { font-weight: 700; letter-spacing: -0.045em; line-height: 0.92; max-width: 1050px; }
  .site { font-weight: 500; font-size: 30px; letter-spacing: -0.01em; margin-top: 26px; }
</style></head><body>
${title
  ? `<div class="top"><span class="brand">QuickFix</span><span>quickfix.pe</span></div>
     <div><p class="title" style="font-size:${titleSize(title)}px">${title}</p><p class="site">San Miguel, Lima · Atención 24/7</p></div>`
  : `<div class="top"><span>Especialista en ASUS ROG y laptops gamer</span><span>quickfix.pe</span></div>
     <div><p class="brand hero">QuickFix</p><p class="site">San Miguel, Lima · Atención 24/7</p></div>`}
</body></html>`;

const outDir = path.resolve("public/og");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
fs.mkdirSync(outDir, { recursive: true });

for (const [name, title] of Object.entries(images)) {
  const html = path.join(tmp, `${name}.html`);
  const png = path.join(tmp, `${name}.png`);
  fs.writeFileSync(html, page(title));
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--virtual-time-budget=6000", // espera a que cargue la fuente
    `--screenshot=${png}`,
    pathToFileURL(html).href,
  ]);
  const out = await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(outDir, `${name}.jpg`));
  console.log(`og/${name}.jpg ${Math.round(out.size / 1024)} KB`);
}
fs.rmSync(tmp, { recursive: true, force: true });

// Genera el HTML de cada página (portada + servicios) para que Google y WhatsApp lean el contenido sin ejecutar JavaScript.
// Corre después de `vite build` (cliente en dist/) y `vite build --ssr` (dist-ssr/). Uso: node scripts/prerender.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "https://quickfix.pe";
const dist = path.resolve("dist");
const ssrDir = path.resolve("dist-ssr");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const { render, heads } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
// Reemplazos con función: el texto puede traer "$" y no debe interpretarse como patrón.
const setAttr = (html, selector, value) => html.replace(new RegExp(`(${selector}[^>]*?content=")[^"]*`), (_, a) => a + esc(value));

function page(head, appHtml, { noindex = false } = {}) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(head.title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*/, (_, a) => a + SITE + head.path);
  html = setAttr(html, '<meta name="description"', head.description);
  html = setAttr(html, '<meta property="og:url"', SITE + head.path);
  html = setAttr(html, '<meta property="og:title"', head.title);
  html = setAttr(html, '<meta property="og:description"', head.description);
  if (noindex) html = setAttr(html, '<meta name="robots"', "noindex, follow");
  const jsonLd = head.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  return html.replace("<!--json-ld-->", () => jsonLd).replace("<!--app-->", () => appHtml);
}

for (const head of heads) {
  const file = path.join(dist, head.path, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(head, render(head.path)));
  console.log(`prerender ${head.path}`);
}

// 404 para Apache (ErrorDocument 404 /404.html): fuera del índice de Google.
fs.writeFileSync(
  path.join(dist, "404.html"),
  page({ path: "/404.html", title: "Página no encontrada | QuickFix", description: "Esta página no existe.", jsonLd: [] }, render("/404"), { noindex: true }),
);

// Sitemap con todas las páginas, siempre al día con la compilación.
const today = new Date().toISOString().slice(0, 10);
const urls = heads.map((h) => `  <url>\n    <loc>${SITE}${h.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${h.path === "/" ? "1.0" : "0.8"}</priority>\n  </url>`);
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender listo: ${heads.length} páginas + 404 + sitemap.xml`);

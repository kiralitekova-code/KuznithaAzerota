#!/usr/bin/env node
"use strict";
// build-gallery.js — assemble a self-contained HTML gallery from a JSON spec.
// Cross-platform Node, no deps. Windows-safe (Node is bundled).
//   node scripts/build-gallery.js --input gallery.json --out gallery.html
// JSON: { "title":"...", "images":[ {"url":"https://...","caption":"..."} ] }
const fs = require("fs");
function args(argv) {
  const a = { input: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--input" || argv[i] === "-i") a.input = argv[++i];
    else if (argv[i] === "--out" || argv[i] === "-o") a.out = argv[++i];
  }
  return a;
}
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function readIn(p) { return p ? fs.readFileSync(p, "utf-8") : fs.readFileSync(0, "utf-8"); }
const A = args(process.argv);
let spec;
try { spec = JSON.parse(readIn(A.input)); }
catch (e) { process.stderr.write("JSON error: " + e.message + "\n"); process.exit(1); }
const imgs = Array.isArray(spec.images) ? spec.images : [];
const cards = imgs.map((i) => `<figure class="card"><img src="${esc(i.url)}" alt="${esc(i.caption || "")}">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ""}</figure>`).join("\n");
const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(spec.title || "Галерея")}</title>
<style>*{box-sizing:border-box}body{margin:0;background:#0f1115;color:#f4f6fb;font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif}h1{padding:24px;text-align:center}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:24px}.card{margin:0;background:#16181d;border:1px solid #222633;border-radius:12px;overflow:hidden}.card img{width:100%;display:block}.card figcaption{padding:10px 14px;font-size:14px;color:#aab2c5}</style></head>
<body><h1>${esc(spec.title || "Галерея")}</h1><div class="grid">${cards}</div></body></html>`;
if (A.out) { fs.writeFileSync(A.out, html, "utf-8"); console.error("Готово: " + A.out); }
else { process.stdout.write(html); }

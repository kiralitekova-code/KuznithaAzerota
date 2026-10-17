#!/usr/bin/env node
"use strict";
// build-deck.js — assemble a self-contained HTML slide deck from a JSON spec.
// Cross-platform Node, NO external dependencies. Windows-safe (Node is bundled).
//
// Usage:
//   node scripts/build-deck.js --input slides.json --out presentation.html
//   cat slides.json | node scripts/build-deck.js > presentation.html
//
// JSON spec:
// {
//   "title": "Название презентации",
//   "author": "Автор",                 // optional
//   "theme": "light" | "dark",         // optional, default light
//   "ratio": "16:9" | "4:3",           // optional, default 16:9
//   "slides": [
//     { "title": "Заголовок слайда",
//       "bullets": ["тезис 1", "тезис 2"],
//       "image": "https://...",         // optional
//       "notes": "заметки спикера" }    // optional
//   ]
// }

const fs = require("fs");

function parseArgs(argv) {
  const args = { input: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input" || a === "-i") args.input = argv[++i];
    else if (a === "--out" || a === "-o") args.out = argv[++i];
    else if (a === "-h" || a === "--help") args.help = true;
  }
  return args;
}

function readStdinSync() {
  // fd 0 = stdin. readFileSync(0) works on Windows and POSIX.
  return fs.readFileSync(0, "utf-8");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dimFor(ratio) {
  if (ratio === "4:3") return { w: 1024, h: 768 };
  return { w: 1280, h: 720 }; // 16:9 default
}

function render(spec) {
  const title = spec.title || "Презентация";
  const author = spec.author || "";
  const dark = spec.theme === "dark";
  const { w, h } = dimFor(spec.ratio);
  const slides = Array.isArray(spec.slides) ? spec.slides : [];

  const bg = dark ? "#0f1115" : "#ffffff";
  const fg = dark ? "#f4f6fb" : "#16181d";
  const muted = dark ? "#aab2c5" : "#5b6473";
  const accent = "#3b82f6";
  const border = dark ? "#222633" : "#e6e8ee";
  const dash = dark ? "#2a2f3d" : "#e0e3ea";

  const slidesHtml = slides.map((s, i) => {
    const img = s.image ? `<img class="slide-img" src="${esc(s.image)}" alt="">` : "";
    const bullets = Array.isArray(s.bullets) && s.bullets.length
      ? `<ul class="bullets">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
      : "";
    const notes = s.notes
      ? `<aside class="notes"><strong>Заметки:</strong> ${esc(s.notes)}</aside>`
      : "";
    return `<section class="slide">
  <div class="slide-body">
    <h2 class="slide-title">${esc(s.title || "")}</h2>
    ${bullets}
    ${img}
  </div>
  <div class="slide-foot">${i + 1} / ${slides.length}</div>
  ${notes}
</section>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; background:${bg}; color:${fg};
    font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .deck { display:flex; flex-direction:column; align-items:center; gap:24px; padding:24px; }
  .meta { text-align:center; color:${muted}; padding:8px 0 24px; }
  .meta h1 { color:${fg}; font-size:34px; margin:0 0 6px; }
  .slide { position:relative; width:${w}px; height:${h}px; padding:56px 64px;
    background:${bg}; color:${fg}; border:1px solid ${border}; border-radius:12px;
    box-shadow:0 6px 24px rgba(0,0,0,0.08); overflow:hidden;
    display:flex; flex-direction:column; }
  .slide-body { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .slide-title { font-size:36px; line-height:1.2; margin:0 0 20px; color:${fg}; }
  .bullets { font-size:24px; line-height:1.5; margin:0; padding-left:28px; }
  .bullets li { margin:8px 0; }
  .bullets li::marker { color:${accent}; }
  .slide-img { max-width:100%; max-height:420px; object-fit:contain; margin-top:16px; border-radius:8px; }
  .slide-foot { position:absolute; bottom:20px; right:28px; color:${muted}; font-size:14px; }
  .notes { color:${muted}; font-size:15px; border-top:1px dashed ${dash}; padding-top:10px; margin-top:10px; }
  @media print {
    body { background:#fff; }
    .deck { gap:0; padding:0; }
    .meta { padding:0 0 12px; }
    .slide { page-break-after:always; break-after:page; border:0; border-radius:0;
      box-shadow:none; width:${w}px; height:${h}px; }
  }
</style>
</head>
<body>
<div class="deck">
  <header class="meta">
    <h1>${esc(title)}</h1>
    ${author ? `<div>${esc(author)}</div>` : ""}
    <div style="font-size:13px;margin-top:6px">Собрано в AgentHere · ${slides.length} слайд(ов)</div>
  </header>
${slidesHtml}
</div>
</body>
</html>`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    process.stderr.write('Usage: node build-deck.js --input slides.json --out presentation.html\n');
    process.exit(0);
  }
  let raw;
  try {
    raw = args.input ? fs.readFileSync(args.input, "utf-8") : readStdinSync();
  } catch (e) {
    process.stderr.write("Ошибка чтения входа: " + e.message + "\n");
    process.exit(1);
  }
  let spec;
  try {
    spec = JSON.parse(raw);
  } catch (e) {
    process.stderr.write("JSON некорректен: " + e.message + "\n");
    process.exit(2);
  }
  const html = render(spec);
  if (args.out) {
    fs.writeFileSync(args.out, html, "utf-8");
    console.error("Готово: " + args.out);
  } else {
    process.stdout.write(html);
  }
}

main();

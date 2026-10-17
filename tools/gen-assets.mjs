/**
 * Генератор ассетов «Кузницы Азерота».
 * Рисует пиксель-арт PNG без внешних зависимостей (собственный PNG-энкодер на zlib)
 * и синтезирует звуки в WAV. Всё CC0 — сгенерировано нами, лицензионно чисто.
 *
 * Запуск: npm run assets
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(process.cwd(), 'public', 'assets');

/* ------------------------------------------------------------------ PNG --- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, px) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(px.buffer, px.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------------------------------------------------------- canvas --- */
const hex = (h) => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 4);
  }
  blend(x, y, [r, g, b], a = 1) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const d = this.px;
    if (a >= 1) {
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
      return;
    }
    const sr = d[i] / 255;
    const sg = d[i + 1] / 255;
    const sb = d[i + 2] / 255;
    const sa = d[i + 3] / 255;
    const oa = a + sa * (1 - a);
    d[i] = Math.round(((r / 255) * a + sr * sa * (1 - a)) / oa * 255);
    d[i + 1] = Math.round(((g / 255) * a + sg * sa * (1 - a)) / oa * 255);
    d[i + 2] = Math.round(((b / 255) * a + sb * sa * (1 - a)) / oa * 255);
    d[i + 3] = Math.round(oa * 255);
  }
  rect(x, y, w, h, color, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.blend(xx, yy, c, a);
    return this;
  }
  roundRect(x, y, w, h, r, color, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const dx = Math.min(xx, w - 1 - xx);
        const dy = Math.min(yy, h - 1 - yy);
        if (dx < r && dy < r) {
          const dd = (r - dx) ** 2 + (r - dy) ** 2;
          if (dd > r * r) continue;
        }
        this.blend(x + xx, y + yy, c, a);
      }
    }
    return this;
  }
  circle(cx, cy, r, color, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    for (let y = Math.floor(cy - r); y <= cy + r; y++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.blend(x, y, c, a);
    return this;
  }
  ellipse(cx, cy, rx, ry, color, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if ((x - cx) ** 2 / (rx * rx) + (y - cy) ** 2 / (ry * ry) <= 1) this.blend(x, y, c, a);
    return this;
  }
  line(x0, y0, x1, y1, color, thick = 1, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      this.rect(x0 - Math.floor(thick / 2), y0 - Math.floor(thick / 2), thick, thick, c, a);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    return this;
  }
  poly(points, color, a = 1) {
    const c = typeof color === 'string' ? hex(color) : color;
    const ys = points.map((p) => p[1]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2)
        for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) this.blend(x, y, c, a);
    }
    return this;
  }
  out(file) {
    const full = path.resolve(ROOT, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, encodePNG(this.w, this.h, this.px));
    count++;
  }
}

let count = 0;
const S = 32; // px на клетку

/* ------------------------------------------------------------- primitives --- */
const shade = (h, f) => {
  const [r, g, b] = hex(h);
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${[cl(r), cl(g), cl(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

function stonePlate(c, x, y, w, h, rnd, base = '#3a3330') {
  c.roundRect(x, y, w, h, 4, base);
  c.roundRect(x + 1, y + 1, w - 2, h - 2, 3, shade(base, 1.18));
  for (let i = 0; i < w * h * 0.06; i++) {
    const px = x + 2 + Math.floor(rnd() * (w - 4));
    const py = y + 2 + Math.floor(rnd() * (h - 4));
    c.rect(px, py, 1, 1, rnd() > 0.5 ? shade(base, 0.8) : shade(base, 1.3), 0.6);
  }
}

function glow(c, cx, cy, r, color) {
  const [rr, gg, bb] = hex(color);
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y) / r;
      if (d <= 1) c.blend(cx + x, cy + y, [rr, gg, bb], (1 - d) ** 2 * 0.55);
    }
}

function flame(c, cx, cy, s, frame) {
  const wob = frame ? 1 : -1;
  c.poly(
    [
      [cx, cy - s * 1.6],
      [cx + s * 0.55, cy - s * 0.25],
      [cx + s * 0.42, cy + s * 0.3],
      [cx - s * 0.42, cy + s * 0.3],
      [cx - s * 0.55, cy - s * 0.25 + wob],
    ],
    '#ff8a1e',
    0.95,
  );
  c.poly(
    [
      [cx, cy - s * 1.05],
      [cx + s * 0.34, cy],
      [cx, cy + s * 0.22],
      [cx - s * 0.34, cy],
    ],
    '#ffd66b',
  );
}

/* -------------------------------------------------------------- buildings --- */
function buildingSprite(id, cells, frame) {
  const size = cells * S;
  const c = new Canvas(size, size);
  const rnd = mulberry32(id.length * 977 + cells * 31 + 7);
  const m = Math.round(size * 0.1); // отступ
  const W = size - m * 2;
  const X = m;

  // тень
  c.ellipse(size / 2, size - m * 0.55, W * 0.46, W * 0.12, '#000000', 0.28);

  switch (id) {
    case 'mine_iron':
    case 'mine_copper':
    case 'mine_coal':
    case 'mine_mithril': {
      const oreColor = id === 'mine_copper' ? '#c97a3a' : id === 'mine_coal' ? '#2b2724' : id === 'mine_mithril' ? '#7fd8e8' : '#8a8f99';
      stonePlate(c, X, m + W * 0.28, W, W * 0.68, rnd, '#39322e');
      // гора
      c.poly(
        [
          [X + W * 0.08, m + W * 0.72],
          [X + W * 0.44, m + W * 0.02],
          [X + W * 0.86, m + W * 0.72],
        ],
        '#4b4340',
      );
      c.poly(
        [
          [X + W * 0.44, m + W * 0.02],
          [X + W * 0.86, m + W * 0.72],
          [X + W * 0.6, m + W * 0.72],
        ],
        '#3a3330',
      );
      c.poly(
        [
          [X + W * 0.3, m + W * 0.3],
          [X + W * 0.44, m + W * 0.02],
          [X + W * 0.55, m + W * 0.26],
        ],
        '#6b625c',
      );
      // вход
      c.roundRect(X + W * 0.38, m + W * 0.44, W * 0.24, W * 0.26, 3, '#141110');
      c.rect(X + W * 0.39, m + W * 0.68, W * 0.22, 2, '#241d19');
      // крепь
      c.rect(X + W * 0.35, m + W * 0.42, 2, W * 0.28, '#6d5233');
      c.rect(X + W * 0.63, m + W * 0.42, 2, W * 0.28, '#6d5233');
      // руда
      for (let i = 0; i < 6; i++) {
        const px = X + W * (0.12 + rnd() * 0.7);
        const py = m + W * (0.62 + rnd() * 0.16);
        c.rect(px, py, 2 + (rnd() > 0.5 ? 1 : 0), 2, oreColor);
      }
      // вагонетка
      c.rect(X + W * 0.7, m + W * 0.62, W * 0.18, W * 0.1, '#5b4a37');
      c.rect(X + W * 0.7, m + W * 0.62, W * 0.18, 2, '#8a6f52');
      c.circle(X + W * 0.74, m + W * 0.74, 1.5, '#1a1614');
      c.circle(X + W * 0.84, m + W * 0.74, 1.5, '#1a1614');
      if (frame) {
        glow(c, X + W * 0.5, m + W * 0.58, W * 0.16, '#ffb347');
        c.rect(X + W * 0.49, m + W * 0.5, 2, 3, '#ffd66b');
      }
      break;
    }
    case 'lumberjack': {
      stonePlate(c, X, m + W * 0.5, W, W * 0.46, rnd, '#3c332c');
      c.rect(X + W * 0.16, m + W * 0.28, W * 0.5, W * 0.32, '#6b4a2f');
      c.rect(X + W * 0.16, m + W * 0.28, W * 0.5, 3, '#8a6440');
      c.poly(
        [
          [X + W * 0.08, m + W * 0.3],
          [X + W * 0.41, m + W * 0.06],
          [X + W * 0.74, m + W * 0.3],
        ],
        '#3f6b3a',
      );
      c.rect(X + W * 0.26, m + W * 0.4, W * 0.12, W * 0.2, '#2b1f17');
      // бревно и пила
      c.rect(X + W * 0.66, m + W * 0.54, W * 0.28, W * 0.1, '#7a5636');
      c.circle(X + W * 0.94, m + W * 0.59, W * 0.05, '#c9a06a');
      c.circle(X + W * 0.94, m + W * 0.59, W * 0.025, '#8a6440');
      if (frame) {
        c.rect(X + W * 0.72, m + W * 0.42, 2, W * 0.14, '#cfd6dd');
        c.rect(X + W * 0.72, m + W * 0.42, W * 0.1, 2, '#cfd6dd');
      }
      break;
    }
    case 'smelter_iron':
    case 'smelter_copper':
    case 'smelter_mithril': {
      const glowColor = id === 'smelter_copper' ? '#ff9a3d' : id === 'smelter_mithril' ? '#7fd8e8' : '#ff6a1a';
      stonePlate(c, X, m + W * 0.22, W, W * 0.72, rnd, '#332b28');
      // корпус печи
      c.roundRect(X + W * 0.16, m + W * 0.3, W * 0.54, W * 0.5, 4, '#4a3a33');
      c.roundRect(X + W * 0.19, m + W * 0.33, W * 0.48, W * 0.44, 3, '#5c4740');
      // труба
      c.rect(X + W * 0.5, m + W * 0.06, W * 0.16, W * 0.28, '#3c302b');
      c.rect(X + W * 0.48, m + W * 0.04, W * 0.2, W * 0.05, '#2e2522');
      // горн
      c.roundRect(X + W * 0.28, m + W * 0.52, W * 0.3, W * 0.22, 2, '#170f0c');
      flame(c, X + W * 0.43, m + W * 0.62, W * 0.09, frame);
      // наковальня/слиток
      c.rect(X + W * 0.72, m + W * 0.6, W * 0.18, W * 0.1, '#6d6a66');
      c.rect(X + W * 0.74, m + W * 0.58, W * 0.14, 2, '#95928d');
      if (frame) {
        glow(c, X + W * 0.43, m + W * 0.6, W * 0.2, glowColor);
        for (let i = 0; i < 3; i++) {
          const t = ((Date.now() / 400 + i) % 3) / 3;
          c.circle(X + W * 0.58 + i * 3, m + W * (0.02 - t * 0.3), 1.6, '#ffffff', 0.5 * (1 - t));
        }
      }
      break;
    }
    case 'forge_small':
    case 'forge_large': {
      const big = id === 'forge_large';
      stonePlate(c, X, m + W * 0.34, W, W * 0.62, rnd, '#3a302a');
      // верстак
      c.rect(X + W * 0.14, m + W * 0.44, W * 0.66, W * 0.14, '#7a5636');
      c.rect(X + W * 0.14, m + W * 0.44, W * 0.66, 3, '#a1784e');
      c.rect(X + W * 0.17, m + W * 0.58, 4, W * 0.24, '#5b3f28');
      c.rect(X + W * 0.7, m + W * 0.58, 4, W * 0.24, '#5b3f28');
      // наковальня
      c.rect(X + W * 0.3, m + W * 0.35, W * 0.26, W * 0.09, '#6c6a67');
      c.rect(X + W * 0.26, m + W * 0.4, W * 0.36, 3, '#8b8783');
      c.rect(X + W * 0.38, m + W * 0.44, W * 0.08, 3, '#55524f');
      // молот
      if (big) {
        c.rect(X + W * 0.62, m + W * 0.2, W * 0.05, W * 0.2, '#8a6440');
        c.rect(X + W * 0.58, m + W * 0.18, W * 0.14, W * 0.07, '#9aa1a8');
        // второй станок
        c.rect(X + W * 0.06, m + W * 0.62, W * 0.2, W * 0.1, '#6c6a67');
      }
      if (frame) {
        glow(c, X + W * 0.43, m + W * 0.34, W * 0.16, '#ff9a3d');
        c.rect(X + W * 0.43, m + W * 0.3, 3, 2, '#ffe9a8');
        c.rect(X + W * 0.3, m + W * 0.3, 2, 2, '#ffcf7a', 0.8);
      }
      break;
    }
    case 'gear_bench': {
      stonePlate(c, X, m + W * 0.36, W, W * 0.6, rnd, '#34302e');
      c.rect(X + W * 0.1, m + W * 0.46, W * 0.72, W * 0.12, '#4f4a46');
      c.rect(X + W * 0.1, m + W * 0.46, W * 0.72, 3, '#6f6963');
      const rot = frame ? 0.25 : 0;
      // шестерни
      for (const [gx, gy, gr] of [
        [0.32, 0.36, 0.15],
        [0.58, 0.32, 0.11],
      ]) {
        const cx = X + W * gx;
        const cy = m + W * gy;
        const r = W * gr;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + rot;
          c.circle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.24, '#b08d57');
        }
        c.circle(cx, cy, r * 0.82, '#8a6f4a');
        c.circle(cx, cy, r * 0.88, '#c8a469', 0.35);
        c.circle(cx, cy, r * 0.3, '#3a302a');
      }
      if (frame) glow(c, X + W * 0.45, m + W * 0.36, W * 0.22, '#4aa3ff');
      break;
    }
    case 'assembler': {
      stonePlate(c, X, m + W * 0.3, W, W * 0.66, rnd, '#332e2b');
      // каркас
      c.rect(X + W * 0.12, m + W * 0.22, 4, W * 0.5, '#6b5236');
      c.rect(X + W * 0.78, m + W * 0.22, 4, W * 0.5, '#6b5236');
      c.rect(X + W * 0.12, m + W * 0.2, W * 0.7, 4, '#8a6a44');
      // стол
      c.rect(X + W * 0.14, m + W * 0.52, W * 0.66, W * 0.1, '#6d5a45');
      // подвешенный клинок
      const sway = frame ? 1 : -1;
      c.rect(X + W * 0.46 + sway, m + W * 0.26, 2, W * 0.18, '#cfd6dd');
      c.rect(X + W * 0.43 + sway, m + W * 0.43, 8, 3, '#a9b0b7');
      // мана-жила
      c.circle(X + W * 0.3, m + W * 0.44, W * 0.05, '#4aa3ff');
      c.circle(X + W * 0.69, m + W * 0.44, W * 0.04, '#7fd8e8');
      c.rect(X + W * 0.3, m + W * 0.44, W * 0.4, 1, '#4aa3ff', 0.6);
      if (frame) {
        glow(c, X + W * 0.48, m + W * 0.4, W * 0.24, '#4aa3ff');
        glow(c, X + W * 0.3, m + W * 0.44, W * 0.1, '#7fd8e8');
      }
      break;
    }
    case 'generator_coal':
    case 'generator_magic': {
      const magic = id === 'generator_magic';
      stonePlate(c, X, m + W * 0.26, W, W * 0.68, rnd, '#2f2a28');
      c.roundRect(X + W * 0.2, m + W * 0.34, W * 0.5, W * 0.46, 5, magic ? '#2b3a55' : '#453b35');
      c.roundRect(X + W * 0.23, m + W * 0.37, W * 0.44, W * 0.4, 4, magic ? '#39527a' : '#57493f');
      // бак/котёл
      c.circle(X + W * 0.45, m + W * 0.56, W * 0.14, magic ? '#16233a' : '#1d1714');
      if (magic) {
        c.circle(X + W * 0.45, m + W * 0.56, W * 0.1, '#4aa3ff', frame ? 0.95 : 0.6);
        c.circle(X + W * 0.45, m + W * 0.56, W * 0.05, '#c8f0ff');
      } else {
        flame(c, X + W * 0.45, m + W * 0.6, W * 0.08, frame);
      }
      // трубы
      c.rect(X + W * 0.7, m + W * 0.4, W * 0.16, 3, '#8b8078');
      c.rect(X + W * 0.82, m + W * 0.4, 3, W * 0.16, '#8b8078');
      if (frame) glow(c, X + W * 0.45, m + W * 0.56, W * 0.24, magic ? '#4aa3ff' : '#ff8a1e');
      break;
    }
    case 'enchanter': {
      stonePlate(c, X, m + W * 0.36, W, W * 0.58, rnd, '#2e2a33');
      // пьедестал
      c.rect(X + W * 0.3, m + W * 0.5, W * 0.32, W * 0.22, '#4a4152');
      c.rect(X + W * 0.26, m + W * 0.7, W * 0.4, 4, '#3a3341');
      // клинок над пьедесталом
      c.rect(X + W * 0.46, m + W * 0.2, 3, W * 0.24, '#dfe7ee');
      c.rect(X + W * 0.42, m + W * 0.44, W * 0.14, 3, '#a98b4f');
      // руны
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + (frame ? 0.5 : 0);
        c.circle(X + W * 0.46 + Math.cos(a) * W * 0.2, m + W * 0.36 + Math.sin(a) * W * 0.1, 1.8, '#a06bff');
      }
      if (frame) {
        glow(c, X + W * 0.46, m + W * 0.36, W * 0.28, '#a06bff');
        glow(c, X + W * 0.46, m + W * 0.3, W * 0.1, '#e0c8ff');
      }
      break;
    }
    case 'warehouse': {
      stonePlate(c, X, m + W * 0.3, W, W * 0.64, rnd, '#39322c');
      // стены
      c.rect(X + W * 0.14, m + W * 0.36, W * 0.6, W * 0.44, '#6d5237');
      for (let i = 0; i < 4; i++) c.rect(X + W * 0.14, m + W * (0.4 + i * 0.1), W * 0.6, 2, '#8a6a45', 0.7);
      // крыша
      c.poly(
        [
          [X + W * 0.08, m + W * 0.38],
          [X + W * 0.44, m + W * 0.1],
          [X + W * 0.8, m + W * 0.38],
        ],
        '#7a4b32',
      );
      c.poly(
        [
          [X + W * 0.44, m + W * 0.1],
          [X + W * 0.8, m + W * 0.38],
          [X + W * 0.6, m + W * 0.38],
        ],
        '#5d3826',
      );
      // ящики
      c.rect(X + W * 0.68, m + W * 0.6, W * 0.16, W * 0.16, '#8b6a42');
      c.rect(X + W * 0.68, m + W * 0.67, W * 0.16, 2, '#5d4526');
      c.rect(X + W * 0.72, m + W * 0.6, 2, W * 0.16, '#5d4526');
      if (frame) {
        c.circle(X + W * 0.3, m + W * 0.24, 2, '#ffcf7a', 0.9);
        glow(c, X + W * 0.3, m + W * 0.24, W * 0.08, '#ffcf7a');
      }
      break;
    }
    default: {
      stonePlate(c, X, m, W, W, rnd);
    }
  }
  return c;
}

/* ------------------------------------------------------------- belt tile --- */
function beltSprite(frame) {
  const c = new Canvas(S, S);
  c.rect(0, 0, S, S, '#241d1a');
  c.rect(1, 1, S - 2, S - 2, '#332a25');
  // ролики
  for (let i = 0; i < 4; i++) {
    const y = 4 + i * 7;
    c.rect(3, y, S - 6, 5, '#4a403a');
    const off = frame ? 3 : 0;
    c.rect(3 + off, y + 1, 2, 3, '#6b5c52');
    c.rect(3 + ((off + 6) % 14), y + 1, 2, 3, '#6b5c52');
  }
  // рама
  c.rect(0, 0, 2, S, '#6e5a44');
  c.rect(S - 2, 0, 2, S, '#6e5a44');
  // стрелка направления
  c.rect(S / 2 - 1, 6, 2, 8, '#f0b429', 0.55);
  c.poly(
    [
      [S / 2, 4],
      [S / 2 + 4, 10],
      [S / 2 - 4, 10],
    ],
    '#f0b429',
    0.75,
  );
  return c;
}

/* ------------------------------------------------------------------ tiles --- */
function tileSprite(kind, variant) {
  const c = new Canvas(S, S);
  const rnd = mulberry32(variant * 7919 + kind.length * 131);
  if (kind === 'water') {
    c.rect(0, 0, S, S, '#1d3f57');
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(rnd() * S);
      const y = Math.floor(rnd() * S);
      c.rect(x, y, 3 + Math.floor(rnd() * 4), 1, '#2e6b8f', 0.7);
    }
    c.rect(0, 0, S, 1, '#3b7d9f', 0.5);
    return c;
  }
  if (kind === 'stone') {
    c.rect(0, 0, S, S, '#4a4440');
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(rnd() * S);
      const y = Math.floor(rnd() * S);
      c.rect(x, y, 1 + Math.floor(rnd() * 3), 1 + Math.floor(rnd() * 2), rnd() > 0.5 ? '#554e49' : '#403a36', 0.8);
    }
    c.rect(0, 0, S, 1, '#5b5450', 0.4);
    return c;
  }
  // grass
  const base = ['#2f4a2c', '#31502e', '#2b4526'][variant % 3];
  c.rect(0, 0, S, S, base);
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rnd() * S);
    const y = Math.floor(rnd() * S);
    c.rect(x, y, 1, 1 + Math.floor(rnd() * 2), rnd() > 0.55 ? '#3d6136' : '#26401f', 0.75);
  }
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(rnd() * S);
    const y = Math.floor(rnd() * S);
    c.rect(x, y, 1, 2, '#4f7a3f', 0.7);
  }
  return c;
}

/* ------------------------------------------------------------------ items --- */
const ITEM_DRAW = {
  ore_iron: (c, s) => {
    c.poly([[s * 0.2, s * 0.7], [s * 0.32, s * 0.36], [s * 0.55, s * 0.28], [s * 0.8, s * 0.5], [s * 0.72, s * 0.76]], '#8a8f99');
    c.poly([[s * 0.32, s * 0.36], [s * 0.55, s * 0.28], [s * 0.6, s * 0.52], [s * 0.42, s * 0.6]], '#b9bec7');
    c.poly([[s * 0.6, s * 0.52], [s * 0.8, s * 0.5], [s * 0.72, s * 0.76]], '#6b7078');
    c.rect(s * 0.38, s * 0.66, 5, 3, '#c8ccd3', 0.7);
  },
  ore_copper: (c, s) => {
    c.poly([[s * 0.18, s * 0.72], [s * 0.3, s * 0.34], [s * 0.58, s * 0.26], [s * 0.82, s * 0.52], [s * 0.7, s * 0.78]], '#a8652f');
    c.poly([[s * 0.3, s * 0.34], [s * 0.58, s * 0.26], [s * 0.62, s * 0.5], [s * 0.4, s * 0.58]], '#d68a45');
    c.poly([[s * 0.62, s * 0.5], [s * 0.82, s * 0.52], [s * 0.7, s * 0.78]], '#7d4720');
  },
  ore_mithril: (c, s) => {
    c.poly([[s * 0.18, s * 0.72], [s * 0.32, s * 0.3], [s * 0.6, s * 0.24], [s * 0.84, s * 0.5], [s * 0.7, s * 0.8]], '#4f8fa0');
    c.poly([[s * 0.32, s * 0.3], [s * 0.6, s * 0.24], [s * 0.64, s * 0.5], [s * 0.42, s * 0.56]], '#9fe6f2');
    c.poly([[s * 0.64, s * 0.5], [s * 0.84, s * 0.5], [s * 0.7, s * 0.8]], '#376c78');
    c.circle(s * 0.5, s * 0.44, 2.5, '#ffffff', 0.8);
  },
  ore_darkiron: (c, s) => {
    c.poly([[s * 0.18, s * 0.72], [s * 0.3, s * 0.3], [s * 0.58, s * 0.24], [s * 0.84, s * 0.52], [s * 0.68, s * 0.8]], '#3a3340');
    c.poly([[s * 0.3, s * 0.3], [s * 0.58, s * 0.24], [s * 0.6, s * 0.48], [s * 0.4, s * 0.54]], '#6a5a7a');
    c.rect(s * 0.44, s * 0.4, 3, 6, '#b47aff', 0.8);
    c.rect(s * 0.52, s * 0.5, 4, 2, '#b47aff', 0.6);
  },
  coal: (c, s) => {
    c.poly([[s * 0.22, s * 0.68], [s * 0.3, s * 0.4], [s * 0.52, s * 0.3], [s * 0.76, s * 0.46], [s * 0.7, s * 0.72]], '#2b2724');
    c.poly([[s * 0.3, s * 0.4], [s * 0.52, s * 0.3], [s * 0.54, s * 0.5], [s * 0.38, s * 0.56]], '#413b36');
    c.rect(s * 0.58, s * 0.56, 3, 2, '#5b544d', 0.6);
  },
  wood: (c, s) => {
    c.roundRect(s * 0.16, s * 0.34, s * 0.68, s * 0.2, 3, '#7a5636');
    c.circle(s * 0.84, s * 0.44, s * 0.1, '#c9a06a');
    c.circle(s * 0.84, s * 0.44, s * 0.05, '#8a6440');
    c.roundRect(s * 0.2, s * 0.56, s * 0.62, s * 0.16, 3, '#5f4329');
  },
  leather: (c, s) => {
    c.poly([[s * 0.22, s * 0.3], [s * 0.74, s * 0.24], [s * 0.82, s * 0.5], [s * 0.7, s * 0.76], [s * 0.24, s * 0.7]], '#9a6a3f');
    c.poly([[s * 0.32, s * 0.38], [s * 0.66, s * 0.34], [s * 0.7, s * 0.58], [s * 0.34, s * 0.62]], '#b5824f');
  },
  ingot_iron: (c, s) => {
    c.poly([[s * 0.16, s * 0.62], [s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.86, s * 0.62], [s * 0.74, s * 0.72], [s * 0.26, s * 0.72]], '#8e939b');
    c.poly([[s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.7, s * 0.54], [s * 0.32, s * 0.54]], '#c3c8cf');
    c.rect(s * 0.34, s * 0.6, 10, 2, '#6d727a', 0.6);
  },
  ingot_copper: (c, s) => {
    c.poly([[s * 0.16, s * 0.62], [s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.86, s * 0.62], [s * 0.74, s * 0.72], [s * 0.26, s * 0.72]], '#b26a34');
    c.poly([[s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.7, s * 0.54], [s * 0.32, s * 0.54]], '#e39a55');
  },
  ingot_mithril: (c, s) => {
    c.poly([[s * 0.16, s * 0.62], [s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.86, s * 0.62], [s * 0.74, s * 0.72], [s * 0.26, s * 0.72]], '#4f9fb0');
    c.poly([[s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.7, s * 0.54], [s * 0.32, s * 0.54]], '#a8ecf7');
  },
  ingot_darkiron: (c, s) => {
    c.poly([[s * 0.16, s * 0.62], [s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.86, s * 0.62], [s * 0.74, s * 0.72], [s * 0.26, s * 0.72]], '#3f3648');
    c.poly([[s * 0.26, s * 0.42], [s * 0.76, s * 0.42], [s * 0.7, s * 0.54], [s * 0.32, s * 0.54]], '#7a6a8f');
  },
  plank: (c, s) => {
    c.rect(s * 0.14, s * 0.34, s * 0.72, s * 0.12, '#a1784e');
    c.rect(s * 0.14, s * 0.52, s * 0.72, s * 0.12, '#8a6440');
    c.rect(s * 0.14, s * 0.34, s * 0.72, 1, '#c9a06a');
    c.circle(s * 0.2, s * 0.4, 1.4, '#5f4329');
    c.circle(s * 0.8, s * 0.58, 1.4, '#5f4329');
  },
  leather_strap: (c, s) => {
    c.roundRect(s * 0.24, s * 0.24, s * 0.14, s * 0.54, 4, '#8a5c34');
    c.roundRect(s * 0.58, s * 0.24, s * 0.14, s * 0.54, 4, '#8a5c34');
    c.rect(s * 0.24, s * 0.3, s * 0.14, 2, '#c08b52');
    c.rect(s * 0.58, s * 0.66, s * 0.14, 2, '#c08b52');
  },
  rope: (c, s) => {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      c.circle(s * 0.5 + Math.cos(a) * s * 0.22, s * 0.5 + Math.sin(a) * s * 0.22, s * 0.055, '#b08d57');
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      c.rect(s * 0.5 + Math.cos(a) * s * 0.22 - 1, s * 0.5 + Math.sin(a) * s * 0.22 - 1, 2, 2, '#8a6f4a');
    }
  },
  gear_small: (c, s) => {
    const cx = s * 0.5;
    const cy = s * 0.5;
    const r = s * 0.24;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      c.rect(cx + Math.cos(a) * r - 3, cy + Math.sin(a) * r - 3, 6, 6, '#b08d57');
    }
    c.circle(cx, cy, r, '#c8a469');
    c.circle(cx, cy, r * 0.82, '#8a6f4a');
    c.circle(cx, cy, r * 0.3, '#332a25');
  },
  gear_large: (c, s) => {
    const cx = s * 0.5;
    const cy = s * 0.5;
    const r = s * 0.3;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      c.rect(cx + Math.cos(a) * r - 3, cy + Math.sin(a) * r - 3, 6, 6, '#9aa1a8');
    }
    c.circle(cx, cy, r, '#b9bec7');
    c.circle(cx, cy, r * 0.8, '#7d838b');
    c.circle(cx, cy, r * 0.28, '#332e2b');
  },
  spring: (c, s) => {
    for (let i = 0; i < 6; i++) {
      const y = s * 0.26 + i * s * 0.09;
      c.ellipse(s * 0.5, y, s * 0.22, s * 0.05, i % 2 ? '#b9bec7' : '#8e939b');
    }
    c.rect(s * 0.28, s * 0.22, 3, s * 0.55, '#6d727a');
    c.rect(s * 0.69, s * 0.22, 3, s * 0.55, '#6d727a');
  },
  blade_rough: (c, s) => {
    c.poly([[s * 0.3, s * 0.74], [s * 0.36, s * 0.28], [s * 0.5, s * 0.18], [s * 0.56, s * 0.3], [s * 0.46, s * 0.74]], '#9aa1a8');
    c.poly([[s * 0.5, s * 0.18], [s * 0.56, s * 0.3], [s * 0.46, s * 0.74], [s * 0.44, s * 0.6]], '#6d727a');
    c.rect(s * 0.28, s * 0.74, s * 0.24, 4, '#5b4a37');
    c.rect(s * 0.36, s * 0.3, 2, s * 0.4, '#c9ccd1', 0.5);
  },
  blade_refined: (c, s) => {
    c.poly([[s * 0.28, s * 0.76], [s * 0.34, s * 0.26], [s * 0.5, s * 0.12], [s * 0.58, s * 0.28], [s * 0.46, s * 0.76]], '#dbe3ea');
    c.poly([[s * 0.5, s * 0.12], [s * 0.58, s * 0.28], [s * 0.46, s * 0.76], [s * 0.44, s * 0.58]], '#8e939b');
    c.rect(s * 0.24, s * 0.74, s * 0.3, 4, '#c8a469');
    c.rect(s * 0.34, s * 0.28, 2, s * 0.42, '#ffffff', 0.55);
  },
  hilt: (c, s) => {
    c.rect(s * 0.24, s * 0.6, s * 0.16, s * 0.2, '#c8a469');
    c.rect(s * 0.26, s * 0.62, s * 0.12, s * 0.16, '#8a6f4a');
    c.rect(s * 0.2, s * 0.56, s * 0.34, 4, '#b08d57');
  },
  pommel: (c, s) => {
    c.circle(s * 0.5, s * 0.5, s * 0.2, '#c8a469');
    c.circle(s * 0.5, s * 0.5, s * 0.13, '#8a6f4a');
    c.circle(s * 0.44, s * 0.44, s * 0.05, '#ffe9a8', 0.8);
  },
  gem_socket: (c, s) => {
    c.circle(s * 0.5, s * 0.5, s * 0.28, '#6d727a');
    c.circle(s * 0.5, s * 0.5, s * 0.2, '#1d1714');
    c.poly([[s * 0.5, s * 0.34], [s * 0.64, s * 0.5], [s * 0.5, s * 0.66], [s * 0.36, s * 0.5]], '#5ee0a0');
    c.poly([[s * 0.5, s * 0.34], [s * 0.56, s * 0.5], [s * 0.5, s * 0.5]], '#b6ffd8');
  },
  rune_shard: (c, s) => {
    c.poly([[s * 0.5, s * 0.18], [s * 0.72, s * 0.44], [s * 0.6, s * 0.8], [s * 0.34, s * 0.7], [s * 0.28, s * 0.4]], '#8a5cff');
    c.poly([[s * 0.5, s * 0.18], [s * 0.72, s * 0.44], [s * 0.5, s * 0.5], [s * 0.28, s * 0.4]], '#c0a0ff');
    c.line(s * 0.5, s * 0.3, s * 0.46, s * 0.62, '#ffe9ff', 2, 0.9);
    c.line(s * 0.46, s * 0.62, s * 0.56, s * 0.55, '#ffe9ff', 2, 0.8);
  },
  mana_core: (c, s) => {
    glow(c, s * 0.5, s * 0.5, s * 0.36, '#4aa3ff');
    c.circle(s * 0.5, s * 0.5, s * 0.26, '#1b3352');
    c.circle(s * 0.5, s * 0.5, s * 0.2, '#4aa3ff');
    c.circle(s * 0.5, s * 0.5, s * 0.11, '#d6f0ff');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      c.rect(s * 0.5 + Math.cos(a) * s * 0.3, s * 0.5 + Math.sin(a) * s * 0.3, 3, 3, '#a06bff');
    }
  },
  mana_energy: (c, s) => {
    glow(c, s * 0.5, s * 0.5, s * 0.4, '#4aa3ff');
    c.poly([[s * 0.56, s * 0.18], [s * 0.34, s * 0.54], [s * 0.5, s * 0.54], [s * 0.42, s * 0.84], [s * 0.68, s * 0.42], [s * 0.52, s * 0.42]], '#8fd6ff');
  },
  ancient_sword_t1: (c, s) => {
    c.poly([[s * 0.32, s * 0.78], [s * 0.4, s * 0.3], [s * 0.5, s * 0.14], [s * 0.58, s * 0.32], [s * 0.46, s * 0.78]], '#dfe7ee');
    c.poly([[s * 0.5, s * 0.14], [s * 0.58, s * 0.32], [s * 0.46, s * 0.78], [s * 0.44, s * 0.6]], '#9aa1a8');
    c.rect(s * 0.24, s * 0.7, s * 0.34, 5, '#f0b429');
    c.rect(s * 0.32, s * 0.78, s * 0.14, s * 0.12, '#8a6f4a');
    c.circle(s * 0.39, s * 0.93, 2.4, '#f0b429');
    glow(c, s * 0.46, s * 0.45, s * 0.28, '#ffcf7a');
  },
  ancient_axe_t2: (c, s) => {
    c.rect(s * 0.46, s * 0.18, 5, s * 0.6, '#8a6f4a');
    c.poly([[s * 0.52, s * 0.22], [s * 0.82, s * 0.14], [s * 0.86, s * 0.4], [s * 0.54, s * 0.42]], '#dfe7ee');
    c.poly([[s * 0.52, s * 0.42], [s * 0.86, s * 0.4], [s * 0.82, s * 0.52], [s * 0.54, s * 0.46]], '#9aa1a8');
    c.rect(s * 0.42, s * 0.78, 12, 4, '#f0b429');
    glow(c, s * 0.66, s * 0.32, s * 0.26, '#ffcf7a');
  },
  ancient_hammer_t3: (c, s) => {
    c.rect(s * 0.46, s * 0.3, 5, s * 0.5, '#8a6f4a');
    c.roundRect(s * 0.24, s * 0.16, s * 0.5, s * 0.2, 3, '#b9bec7');
    c.rect(s * 0.24, s * 0.16, s * 0.5, 3, '#e6ecf1');
    c.rect(s * 0.24, s * 0.3, s * 0.5, 2, '#7d838b');
    glow(c, s * 0.5, s * 0.26, s * 0.26, '#ffcf7a');
  },
  ancient_spear_t4: (c, s) => {
    c.line(s * 0.32, s * 0.82, s * 0.56, s * 0.24, '#8a6f4a', 4);
    c.poly([[s * 0.56, s * 0.26], [s * 0.72, s * 0.1], [s * 0.66, s * 0.34], [s * 0.5, s * 0.36]], '#dfe7ee');
    c.poly([[s * 0.66, s * 0.34], [s * 0.5, s * 0.36], [s * 0.56, s * 0.26]], '#9aa1a8');
    c.rect(s * 0.3, s * 0.78, 14, 3, '#c48bff');
    glow(c, s * 0.62, s * 0.24, s * 0.24, '#c48bff');
  },
  ancient_artifact_t5: (c, s) => {
    glow(c, s * 0.5, s * 0.5, s * 0.42, '#ffd66b');
    c.poly([[s * 0.5, s * 0.12], [s * 0.74, s * 0.34], [s * 0.68, s * 0.68], [s * 0.5, s * 0.88], [s * 0.32, s * 0.68], [s * 0.26, s * 0.34]], '#f0b429');
    c.poly([[s * 0.5, s * 0.2], [s * 0.66, s * 0.36], [s * 0.6, s * 0.64], [s * 0.5, s * 0.78], [s * 0.4, s * 0.64], [s * 0.34, s * 0.36]], '#ffe9a8');
    c.circle(s * 0.5, s * 0.5, s * 0.1, '#a3231f');
    c.circle(s * 0.5, s * 0.5, s * 0.05, '#ff6a6a');
  },
};

function itemSprite(id) {
  const c = new Canvas(S, S);
  const draw = ITEM_DRAW[id];
  if (draw) draw(c, S);
  return c;
}

/* -------------------------------------------------------------- UI icons --- */
function uiIcon(kind) {
  const c = new Canvas(64, 64);
  const s = 64;
  switch (kind) {
    case 'gold':
      c.circle(32, 32, 22, '#a87b17');
      c.circle(32, 32, 19, '#f0b429');
      c.circle(32, 32, 13, '#ffd66b');
      c.rect(27, 24, 10, 15, '#a87b17');
      c.rect(29, 26, 6, 11, '#ffe9a8');
      break;
    case 'star':
      c.poly([[32, 6], [40, 24], [60, 26], [45, 39], [49, 58], [32, 48], [15, 58], [19, 39], [4, 26], [24, 24]], '#f0b429');
      c.poly([[32, 12], [38, 26], [54, 28], [42, 37], [45, 52], [32, 44], [19, 52], [22, 37], [10, 28], [26, 26]], '#ffe9a8');
      break;
    case 'lock':
      c.circle(32, 26, 12, '#8b8078');
      c.circle(32, 26, 8, '#00000000');
      c.rect(20, 28, 24, 26, '#8b8078');
      c.rect(18, 30, 28, 22, '#4a4340');
      c.rect(30, 36, 5, 10, '#1a1512');
      c.circle(32, 36, 4, '#1a1512');
      break;
    case 'play':
      c.poly([[20, 12], [52, 32], [20, 52]], '#e8e2d8');
      break;
    case 'pause':
      c.rect(20, 14, 8, 36, '#e8e2d8');
      c.rect(36, 14, 8, 36, '#e8e2d8');
      break;
    case 'hammer':
      c.rect(28, 26, 8, 32, '#8a6f4a');
      c.roundRect(14, 12, 36, 16, 4, '#b9bec7');
      c.rect(14, 12, 36, 4, '#e6ecf1');
      break;
    case 'gear':
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        c.rect(32 + Math.cos(a) * 16 - 5, 32 + Math.sin(a) * 16 - 5, 10, 10, '#b9bec7');
      }
      c.circle(32, 32, 15, '#8b8078');
      c.circle(32, 32, 7, '#1a1512');
      break;
    case 'bolt':
      c.poly([[36, 6], [20, 34], [30, 34], [26, 58], [46, 26], [34, 26]], '#4aa3ff');
      break;
    case 'ad':
      c.roundRect(6, 14, 52, 36, 6, '#1f1a17');
      c.roundRect(9, 17, 46, 30, 4, '#2c2521');
      c.poly([[28, 22], [42, 32], [28, 42]], '#f0b429');
      c.rect(6, 56, 52, 4, '#a3231f', 0.8);
      break;
    case 'sound':
      c.poly([[12, 24], [22, 24], [34, 12], [34, 52], [22, 40], [12, 40]], '#e8e2d8');
      for (let i = 0; i < 2; i++) {
        for (let a = -0.7; a <= 0.7; a += 0.05) {
          c.rect(40 + i * 6 + Math.cos(a) * 2 * i, 32 + Math.sin(a) * (12 + i * 6), 2, 2, '#e8e2d8', 0.9);
        }
      }
      break;
    case 'scroll':
      c.roundRect(14, 10, 36, 44, 4, '#e8dcc0');
      c.rect(20, 20, 24, 3, '#8a6f4a');
      c.rect(20, 28, 24, 3, '#8a6f4a');
      c.rect(20, 36, 16, 3, '#8a6f4a');
      c.circle(14, 12, 5, '#c9a06a');
      c.circle(50, 52, 5, '#c9a06a');
      break;
    case 'trash':
      c.rect(18, 20, 28, 6, '#8b8078');
      c.rect(26, 12, 12, 6, '#8b8078');
      c.poly([[20, 28], [24, 54], [40, 54], [44, 28]], '#a3231f');
      for (let i = 0; i < 3; i++) c.rect(26 + i * 6, 32, 3, 18, '#6d1a16');
      break;
    case 'arrow':
      c.rect(12, 28, 30, 8, '#e8e2d8');
      c.poly([[40, 16], [56, 32], [40, 48]], '#e8e2d8');
      break;
    case 'plus':
      c.rect(26, 12, 12, 40, '#e8e2d8');
      c.rect(12, 26, 40, 12, '#e8e2d8');
      break;
    case 'check':
      c.poly([[10, 34], [24, 48], [54, 16], [48, 10], [24, 36], [16, 28]], '#5ee0a0');
      break;
    case 'speed':
      c.circle(32, 34, 22, '#1f1a17');
      c.circle(32, 34, 19, '#2c2521');
      c.line(32, 34, 44, 20, '#f0b429', 4);
      c.circle(32, 34, 4, '#f0b429');
      break;
    default:
      c.circle(32, 32, 20, '#8b8078');
  }
  return c;
}

/* ------------------------------------------------------------- menu bg --- */
function menuBackground() {
  const W = 1600;
  const H = 900;
  const c = new Canvas(W, H);
  const rnd = mulberry32(20260117);
  // небо
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const r = Math.round(10 + t * 90);
    const g = Math.round(8 + t * 34);
    const b = Math.round(16 + t * 16);
    for (let x = 0; x < W; x++) c.blend(x, y, [r, g, b], 1);
  }
  // звёзды
  for (let i = 0; i < 220; i++) {
    const x = rnd() * W;
    const y = rnd() * H * 0.5;
    c.rect(x, y, 1 + (rnd() > 0.85 ? 1 : 0), 1, '#e8dcc0', 0.15 + rnd() * 0.5);
  }
  // луна
  c.circle(1280, 150, 64, '#e8dcc0', 0.12);
  c.circle(1280, 150, 52, '#f6efdc', 0.85);
  c.circle(1300, 138, 46, '#0f0b10', 0.55);
  // горы (3 слоя)
  const layers = [
    { base: 560, amp: 200, color: [24, 20, 26], step: 130 },
    { base: 640, amp: 140, color: [30, 24, 24], step: 90 },
    { base: 720, amp: 90, color: [38, 28, 24], step: 60 },
  ];
  layers.forEach((L, li) => {
    const pts = [[0, H]];
    for (let x = 0; x <= W; x += L.step) pts.push([x, L.base - Math.abs(Math.sin(x * 0.004 + li) * L.amp) - rnd() * 30]);
    pts.push([W, H]);
    c.poly(pts, `#${L.color.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
  });
  // кузница: силуэт + зарево
  glow(c, 800, 760, 420, '#ff6a1a');
  glow(c, 800, 800, 240, '#ffb347');
  // наковальня
  c.rect(760, 700, 80, 26, '#12100f');
  c.poly([[720, 700], [880, 700], [900, 726], [700, 726]], '#1a1614');
  c.rect(780, 726, 40, 90, '#141110');
  // искры
  for (let i = 0; i < 120; i++) {
    const x = 400 + rnd() * 800;
    const y = 300 + rnd() * 460;
    const a = 0.1 + rnd() * 0.6;
    c.rect(x, y, 1 + (rnd() > 0.8 ? 1 : 0), 1 + (rnd() > 0.8 ? 1 : 0), rnd() > 0.5 ? '#ffb347' : '#ff6a1a', a);
  }
  // виньетка
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x += 1) {
      const d = Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2));
      if (d > 1.1) c.blend(x, y, [0, 0, 0], Math.min(0.85, (d - 1.1) * 1.4));
    }
  return c;
}

/* ----------------------------------------------------------------- audio --- */
const SR = 22050;

function writeWav(file, samples, sr = SR) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  const full = path.resolve(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf);
  count++;
}

const env = (t, dur, a = 0.01, d = 0.2) => Math.min(1, t / a) * Math.max(0, 1 - t / dur) ** (1 / d);

function noiseBurst(dur, freq, decay, vol = 0.7) {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const white = Math.random() * 2 - 1;
    last = last * 0.6 + white * 0.4;
    out[i] = last * env(t, dur, 0.002, decay) * vol * Math.cos(2 * Math.PI * freq * t);
  }
  return out;
}

function tone(freq, dur, vol = 0.4, type = 'sine', decay = 0.4) {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = Math.sin(2 * Math.PI * freq * t);
    if (type === 'tri') v = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t));
    if (type === 'square') v = Math.sign(Math.sin(2 * Math.PI * freq * t));
    out[i] = v * env(t, dur, 0.005, decay) * vol;
  }
  return out;
}

function mix(...parts) {
  const n = Math.max(...parts.map((p) => p.length));
  const out = new Float32Array(n);
  for (const p of parts) for (let i = 0; i < p.length; i++) out[i] += p[i];
  return out;
}

function concat(...parts) {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Float32Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function genAudio() {
  writeWav('audio/sfx_click.wav', tone(880, 0.06, 0.25, 'tri', 0.2));
  writeWav('audio/sfx_place.wav', mix(tone(120, 0.18, 0.5, 'sine', 0.5), noiseBurst(0.12, 90, 0.5, 0.35)));
  writeWav('audio/sfx_destroy.wav', mix(tone(70, 0.25, 0.55, 'sine', 0.8), noiseBurst(0.2, 60, 0.4, 0.4)));
  writeWav('audio/sfx_mine.wav', mix(noiseBurst(0.12, 1400, 0.12, 0.45), tone(220, 0.1, 0.3, 'square', 0.1)));
  writeWav('audio/sfx_smelt.wav', mix(noiseBurst(0.5, 500, 0.6, 0.25), tone(95, 0.5, 0.2, 'sine', 0.9)));
  writeWav(
    'audio/sfx_quest_done.wav',
    concat(tone(523, 0.12, 0.3, 'tri', 0.3), tone(659, 0.12, 0.3, 'tri', 0.3), tone(784, 0.22, 0.32, 'tri', 0.5)),
  );
  writeWav(
    'audio/sfx_upgrade.wav',
    concat(tone(392, 0.1, 0.28, 'tri', 0.2), tone(523, 0.1, 0.28, 'tri', 0.2), tone(659, 0.1, 0.3, 'tri', 0.2), tone(880, 0.3, 0.32, 'tri', 0.6)),
  );

  // bgm_level: ритмичный луп 16 c
  {
    const dur = 16;
    const n = dur * SR;
    const out = new Float32Array(n);
    const bassNotes = [110, 110, 146.8, 98, 110, 130.8, 98, 110];
    for (let b = 0; b < 8; b++) {
      const start = Math.floor((b * dur * SR) / 8);
      const len = Math.floor((dur * SR) / 8);
      const f = bassNotes[b];
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        const e = Math.exp(-t * 1.6) * 0.16;
        out[start + i] += Math.sin(2 * Math.PI * f * t) * e;
        // аккордовая подложка
        out[start + i] += (Math.sin(2 * Math.PI * f * 2 * t) * 0.05 + Math.sin(2 * Math.PI * f * 3 * t) * 0.03) * e * 1.2;
      }
      // удар молота
      const hit = Math.floor(start + len * 0.5);
      for (let i = 0; i < 900 && hit + i < n; i++) {
        const t = i / SR;
        out[hit + i] += Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 40) * 0.22;
      }
    }
    writeWav('audio/bgm_level.wav', out);
  }
  // bgm_menu: эмбиент 20 c
  {
    const dur = 20;
    const n = dur * SR;
    const out = new Float32Array(n);
    const notes = [146.8, 174.6, 220, 196, 146.8, 130.8];
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const idx = Math.floor(t / (dur / notes.length)) % notes.length;
      const f = notes[idx];
      const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.08 * t);
      out[i] =
        (Math.sin(2 * Math.PI * f * t) * 0.09 + Math.sin(2 * Math.PI * f * 1.5 * t) * 0.04 + Math.sin(2 * Math.PI * f * 2 * t) * 0.02) *
        lfo;
    }
    // фейд по краям для бесшовного лупа
    for (let i = 0; i < SR; i++) {
      const k = i / SR;
      out[i] *= k;
      out[n - 1 - i] *= k;
    }
    writeWav('audio/bgm_menu.wav', out);
  }
}

/* ------------------------------------------------------------------- main --- */
const BUILDINGS = [
  ['mine_iron', 2],
  ['mine_copper', 2],
  ['mine_coal', 2],
  ['mine_mithril', 3],
  ['lumberjack', 2],
  ['smelter_iron', 2],
  ['smelter_copper', 2],
  ['smelter_mithril', 3],
  ['forge_small', 2],
  ['forge_large', 3],
  ['gear_bench', 2],
  ['assembler', 3],
  ['generator_coal', 3],
  ['generator_magic', 3],
  ['enchanter', 2],
  ['warehouse', 3],
  ['conveyor', 1],
];

for (const [id, cells] of BUILDINGS) {
  for (const frame of [0, 1]) buildingSprite(id, cells, frame).out(`sprites/buildings/${id}_${frame}.png`);
}

for (const kind of ['grass', 'stone', 'water']) {
  for (let v = 0; v < 3; v++) tileSprite(kind, v).out(`sprites/tiles/${kind}_${v}.png`);
}

for (const id of Object.keys(ITEM_DRAW)) itemSprite(id).out(`sprites/items/${id}.png`);

for (const id of [
  'gold',
  'star',
  'lock',
  'play',
  'pause',
  'hammer',
  'gear',
  'bolt',
  'ad',
  'sound',
  'scroll',
  'trash',
  'arrow',
  'plus',
  'check',
  'speed',
]) uiIcon(id).out(`ui/icon_${id}.png`);

beltSprite(0).out('sprites/buildings/belt_0.png');
beltSprite(1).out('sprites/buildings/belt_1.png');

menuBackground().out('ui/menu_bg.png');
// favicon и логотип-марка
{
  const c = new Canvas(64, 64);
  c.circle(32, 32, 30, '#171310');
  c.circle(32, 32, 28, '#2a2320');
  c.rect(26, 18, 12, 30, '#8a6f4a');
  c.roundRect(12, 12, 40, 14, 3, '#b9bec7');
  c.rect(12, 12, 40, 3, '#e6ecf1');
  glow(c, 34, 30, 18, '#ff8a1e');
  c.out('ui/logo.png');
  fs.mkdirSync(path.resolve(ROOT, '..'), { recursive: true });
  fs.writeFileSync(path.resolve(ROOT, '..', 'favicon.png'), encodePNG(64, 64, c.px));
}

genAudio();

console.log(`Готово: ${count} файлов в public/assets`);

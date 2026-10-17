import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { Engine } from '../core/engine';
import { BUILDINGS } from '../data/buildings';
import { ITEMS } from '../data/items';
import type { Dir } from '../types';
import {
  ALL_ASSETS,
  BELT_SPRITES,
  BUILDING_TEXTURE_KEY,
  ITEM_TEXTURE_KEY,
  TILE_TEXTURE_KEY,
} from './assets';

export const TILE = 32;
const DIR_VEC: Record<Dir, { x: number; y: number; rot: number }> = {
  n: { x: 0, y: -1, rot: 0 },
  e: { x: 1, y: 0, rot: Math.PI / 2 },
  s: { x: 0, y: 1, rot: Math.PI },
  w: { x: -1, y: 0, rot: -Math.PI / 2 },
};

interface BuildingView {
  sprite: Sprite;
  frame: number;
}

interface BeltView {
  sprite: Sprite;
  items: Sprite[];
  dir: Dir;
  tileX: number;
  tileY: number;
}

export class GameRenderer {
  app = new Application();
  private world = new Container();
  private tileLayer = new Container();
  private beltLayer = new Container();
  private buildingLayer = new Container();
  private itemLayer = new Container();
  private grid = new Graphics();
  private ghost = new Sprite();
  private ghostRing = new Graphics();

  engine: Engine | null = null;
  private textures = new Map<string, Texture>();
  private bViews = new Map<string, BuildingView>();
  private beltViews = new Map<string, BeltView>();
  private tileSprites: Sprite[] = [];

  private zoom = 1;
  private hover = { x: -1, y: -1 };
  private dragging = false;
  private dragMoved = false;
  private lastPointer = { x: 0, y: 0 };
  private host: HTMLElement | null = null;
  private time = 0;
  private ready = false;

  onCellClick: ((x: number, y: number) => void) | null = null;
  getGhost: (() => { defId: string | null; demolish: boolean }) | null = null;

  async init(host: HTMLElement): Promise<void> {
    this.host = host;
    await this.app.init({
      background: '#14100d',
      resizeTo: host,
      antialias: false,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      roundPixels: true,
    });
    host.appendChild(this.app.canvas);
    this.app.canvas.style.display = 'block';
    this.app.canvas.style.touchAction = 'none';

    this.world.addChild(this.tileLayer, this.grid, this.beltLayer, this.buildingLayer, this.itemLayer);
    this.ghost.anchor.set(0, 0);
    this.ghost.alpha = 0.6;
    this.ghost.visible = false;
    this.world.addChild(this.ghostRing, this.ghost);
    this.app.stage.addChild(this.world);

    await this.preload();
    this.bindInput();
    this.ready = true;
    this.app.ticker.add((t) => this.frame(t.deltaMS));
  }

  private async preload(): Promise<void> {
    const loaded = await Assets.load(ALL_ASSETS);
    for (const [url, tex] of Object.entries(loaded) as [string, Texture][]) {
      tex.source.scaleMode = 'nearest';
      this.textures.set(url, tex);
    }
  }

  tex(url: string): Texture {
    return this.textures.get(url) ?? Texture.WHITE;
  }

  /* ------------------------------------------------------------- engine --- */
  setEngine(engine: Engine): void {
    this.engine = engine;
    this.clearWorld();
    this.buildMap(engine);
    this.fitCamera();
  }

  private clearWorld(): void {
    for (const v of this.bViews.values()) v.sprite.destroy();
    this.bViews.clear();
    for (const v of this.beltViews.values()) {
      v.sprite.destroy();
      v.items.forEach((s) => s.destroy());
    }
    this.beltViews.clear();
    this.tileSprites.forEach((s) => s.destroy());
    this.tileSprites = [];
    this.tileLayer.removeChildren();
    this.beltLayer.removeChildren();
    this.buildingLayer.removeChildren();
    this.itemLayer.removeChildren();
    this.grid.clear();
  }

  private buildMap(engine: Engine): void {
    const { gridW, gridH } = engine;
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const h = (x * 73856093) ^ (y * 19349663);
        const v = Math.abs(h) % 3;
        const kind = v === 2 ? 'stone' : 'grass';
        const s = new Sprite(this.tex(TILE_TEXTURE_KEY(kind, v)));
        s.position.set(x * TILE, y * TILE);
        this.tileLayer.addChild(s);
        this.tileSprites.push(s);
      }
    }
    this.grid.clear();
    this.grid.moveTo(0, 0);
    for (let x = 0; x <= gridW; x++) {
      this.grid.moveTo(x * TILE, 0).lineTo(x * TILE, gridH * TILE);
    }
    for (let y = 0; y <= gridH; y++) {
      this.grid.moveTo(0, y * TILE).lineTo(gridW * TILE, y * TILE);
    }
    this.grid.stroke({ width: 1, color: 0x000000, alpha: 0.16 });
  }

  fitCamera(): void {
    if (!this.engine || !this.host) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const mapW = this.engine.gridW * TILE;
    const mapH = this.engine.gridH * TILE;
    const z = Math.min(w / mapW, h / mapH) * 0.98;
    this.zoom = Math.max(0.5, Math.min(2, z));
    this.world.scale.set(this.zoom);
    this.world.position.set((w - mapW * this.zoom) / 2, (h - mapH * this.zoom) / 2);
  }

  /* -------------------------------------------------------------- input --- */
  private bindInput(): void {
    const host = this.host!;
    const cellFromEvent = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const wx = (px - this.world.x) / this.zoom;
      const wy = (py - this.world.y) / this.zoom;
      return { x: Math.floor(wx / TILE), y: Math.floor(wy / TILE) };
    };

    host.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      this.dragging = true;
      this.dragMoved = false;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      host.setPointerCapture?.(e.pointerId);
    });

    host.addEventListener('pointermove', (e) => {
      const cell = cellFromEvent(e.clientX, e.clientY);
      this.hover = cell;
      if (this.dragging) {
        const dx = e.clientX - this.lastPointer.x;
        const dy = e.clientY - this.lastPointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) this.dragMoved = true;
        this.world.x += dx;
        this.world.y += dy;
        this.lastPointer = { x: e.clientX, y: e.clientY };
      }
    });

    host.addEventListener('pointerup', (e) => {
      const wasDrag = this.dragMoved;
      this.dragging = false;
      if (wasDrag) return;
      const cell = cellFromEvent(e.clientX, e.clientY);
      this.onCellClick?.(cell.x, cell.y);
    });

    host.addEventListener('pointerleave', () => {
      this.hover = { x: -1, y: -1 };
      this.ghost.visible = false;
      this.ghostRing.clear();
    });

    host.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const rect = host.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const next = Math.max(0.5, Math.min(2, this.zoom * (e.deltaY < 0 ? 1.12 : 0.89)));
        const wx = (mx - this.world.x) / this.zoom;
        const wy = (my - this.world.y) / this.zoom;
        this.zoom = next;
        this.world.scale.set(next);
        this.world.position.set(mx - wx * next, my - wy * next);
      },
      { passive: false },
    );
  }

  /* --------------------------------------------------------------- draw --- */
  private frame(deltaMS: number): void {
    if (!this.ready) return;
    this.time += deltaMS / 1000;
    const engine = this.engine;
    if (!engine) return;
    this.syncBuildings(engine);
    this.syncBelts(engine);
    this.syncGhost(engine);
  }

  private syncBuildings(engine: Engine): void {
    const seen = new Set<string>();
    for (const b of engine.buildings) {
      seen.add(b.id);
      let v = this.bViews.get(b.id);
      if (!v) {
        const sprite = new Sprite(this.tex(BUILDING_TEXTURE_KEY(b.defId, 0)));
        sprite.position.set(b.x * TILE, b.y * TILE);
        this.buildingLayer.addChild(sprite);
        v = { sprite, frame: 0 };
        this.bViews.set(b.id, v);
      }
      const wantFrame = b.working ? (Math.floor(this.time * 4) % 2 === 0 ? 0 : 1) : 0;
      if (v.frame !== wantFrame) {
        v.frame = wantFrame;
        v.sprite.texture = this.tex(BUILDING_TEXTURE_KEY(b.defId, wantFrame));
      }
      v.sprite.tint = b.working ? 0xffffff : 0xbdb6ad;
    }
    for (const [id, v] of [...this.bViews.entries()]) {
      if (seen.has(id)) continue;
      v.sprite.destroy();
      this.bViews.delete(id);
    }
  }

  private syncBelts(engine: Engine): void {
    const seen = new Set<string>();
    for (const tile of engine.belts.values()) {
      const k = `${tile.x},${tile.y}`;
      seen.add(k);
      let v = this.beltViews.get(k);
      if (!v) {
        const sprite = new Sprite(this.tex(BELT_SPRITES[0]));
        sprite.anchor.set(0.5);
        sprite.position.set((tile.x + 0.5) * TILE, (tile.y + 0.5) * TILE);
        this.beltLayer.addChild(sprite);
        v = { sprite, items: [], dir: tile.dir, tileX: tile.x, tileY: tile.y };
        this.beltViews.set(k, v);
      }
      if (v.dir !== tile.dir || v.tileX !== tile.x || v.tileY !== tile.y) {
        v.dir = tile.dir;
        v.tileX = tile.x;
        v.tileY = tile.y;
        v.sprite.position.set((tile.x + 0.5) * TILE, (tile.y + 0.5) * TILE);
      }
      v.sprite.rotation = DIR_VEC[tile.dir].rot;
      v.sprite.texture = this.tex(BELT_SPRITES[Math.floor(this.time * 3) % 2]);

      // предметы
      while (v.items.length < tile.items.length) {
        const s = new Sprite(Texture.WHITE);
        s.anchor.set(0.5);
        s.width = 20;
        s.height = 20;
        this.itemLayer.addChild(s);
        v.items.push(s);
      }
      while (v.items.length > tile.items.length) v.items.pop()!.destroy();

      const dir = DIR_VEC[tile.dir];
      for (let i = 0; i < tile.items.length; i++) {
        const it = tile.items[i];
        const s = v.items[i];
        const iconId = ITEMS[it.item]?.iconId ?? it.item;
        const want = this.tex(ITEM_TEXTURE_KEY(iconId));
        if (s.texture !== want) s.texture = want;
        const offset = (it.progress - 0.5) * TILE * 0.72;
        s.position.set(
          (tile.x + 0.5) * TILE + dir.x * offset,
          (tile.y + 0.5) * TILE + dir.y * offset,
        );
        s.alpha = 1;
      }
    }
    for (const [k, v] of [...this.beltViews.entries()]) {
      if (seen.has(k)) continue;
      v.sprite.destroy();
      v.items.forEach((s) => s.destroy());
      this.beltViews.delete(k);
    }
  }

  private syncGhost(engine: Engine): void {
    const info = this.getGhost?.();
    this.ghostRing.clear();
    if (!info?.defId || this.hover.x < 0) {
      this.ghost.visible = false;
      return;
    }
    const { x, y } = this.hover;
    if (info.defId === 'conveyor') {
      this.ghost.visible = false;
      const ok = engine.inside(x, y) && !engine.buildings.some((b) => {
        const d = BUILDINGS[b.defId];
        return x >= b.x && x < b.x + d.cells && y >= b.y && y < b.y + d.cells;
      });
      this.ghostRing
        .rect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4)
        .fill({ color: ok ? 0x33ff88 : 0xff3333, alpha: 0.25 })
        .stroke({ width: 2, color: ok ? 0x33ff88 : 0xff3333, alpha: 0.8 });
      return;
    }
    const def = BUILDINGS[info.defId];
    if (!def) {
      this.ghost.visible = false;
      return;
    }
    const ok = engine.cellsFree(info.defId, x, y);
    this.ghost.texture = this.tex(BUILDING_TEXTURE_KEY(info.defId, 0));
    this.ghost.position.set(x * TILE, y * TILE);
    this.ghost.visible = true;
    this.ghost.tint = ok ? 0x8dff9e : 0xff6a6a;
    this.ghostRing
      .rect(x * TILE, y * TILE, def.cells * TILE, def.cells * TILE)
      .stroke({ width: 2, color: ok ? 0x8dff9e : 0xff6a6a, alpha: 0.9 });
  }

  destroy(): void {
    this.ready = false;
    this.engine = null;
    try {
      this.app.destroy(true, { children: true });
    } catch {
      /* ignore */
    }
  }
}

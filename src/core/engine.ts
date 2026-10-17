import { BELT, BUILDINGS, activeRecipe, buildingCost, questDescription } from '../data/buildings';
import { ITEMS, itemSell } from '../data/items';
import { getLevel } from '../data/levels';
import { buildCostMultiplier, questAmountMultiplier, speedMultiplier } from '../data/upgrades';
import type {
  BeltTile,
  BuildBlock,
  BuildingId,
  BuildingInstance,
  Dir,
  ItemId,
  LevelDef,
  QuestState,
  Snapshot,
  UpgradeKind,
} from '../types';
import { bus, sfx, toast } from './EventBus';

export const MAX_BUILDINGS = 200;
export const TICK = 0.05; // 20 Гц
const BASE_INPUT_CAP = 10;
const BASE_OUTPUT_CAP = 10;

/** Сколько секунд строится здание (примерно половина одного производственного цикла). */
export function buildTimeFor(defId: BuildingId): number {
  const def = BUILDINGS[defId];
  if (!def) return 4;
  const t = def.recipes.length ? Math.min(...def.recipes.map((r) => r.time)) : 8;
  return Math.max(3, Math.round(t * 0.7));
}

const key = (x: number, y: number) => `${x},${y}`;
const DIR_VEC: Record<Dir, [number, number]> = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };

export interface EngineSave {
  levelId: number;
  resources: Record<ItemId, number>;
  gold: number;
  buildings: BuildingInstance[];
  belts: BeltTile[];
  quests: QuestState[];
  elapsed: number;
}

export class Engine {
  level: LevelDef;
  resources: Record<ItemId, number> = {};
  gold = 0;
  buildings: BuildingInstance[] = [];
  belts = new Map<string, BeltTile>();
  quests: QuestState[] = [];
  elapsed = 0;
  upgrades: Partial<Record<UpgradeKind, number>> = {};
  speed = 1;
  paused = false;
  completed = false;
  bufferBonus = 0;
  private occupied = new Map<string, string>();
  private seq = 0;

  constructor(level: LevelDef, upgrades: Partial<Record<UpgradeKind, number>> = {}, gold = 0) {
    this.level = level;
    this.upgrades = { ...upgrades };
    this.resources = {};
    for (const [item, qty] of Object.entries(level.startingResources)) {
      if (qty > 0) this.resources[item] = qty;
    }
    this.gold = level.startingGold + gold;
    const amountMul = questAmountMultiplier(upgrades);
    this.quests = level.quests.map((q) => ({
      id: q.id,
      item: q.item,
      amount: Math.max(1, Math.round(q.amount * amountMul)),
      progress: 0,
      desc: questDescription(level.id, q.item),
      done: false,
      reward: q.reward.gold,
    }));
  }

  static forLevel(levelId: number, upgrades: Partial<Record<UpgradeKind, number>> = {}, gold = 0): Engine {
    return new Engine(getLevel(levelId), upgrades, gold);
  }

  static fromSave(save: EngineSave, upgrades: Partial<Record<UpgradeKind, number>> = {}): Engine {
    const level = getLevel(save.levelId);
    const e = new Engine(level, upgrades, 0);
    e.resources = { ...save.resources };
    e.gold = save.gold;
    e.quests = save.quests;
    e.elapsed = save.elapsed;
    e.buildings = [];
    for (const b of save.buildings) e.addExisting(b, true);
    for (const t of save.belts) e.belts.set(key(t.x, t.y), t);
    e.recalcBufferBonus();
    e.completed = e.quests.length > 0 && e.quests.every((q) => q.done);
    return e;
  }

  /* --------------------------------------------------------------- grid --- */
  get gridW(): number {
    return this.level.mapSize[0];
  }
  get gridH(): number {
    return this.level.mapSize[1];
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.gridW && y < this.gridH;
  }

  buildingAt(x: number, y: number): BuildingInstance | null {
    const id = this.occupied.get(key(x, y));
    if (!id) return null;
    return this.buildings.find((b) => b.id === id) ?? null;
  }

  cellsFree(defId: BuildingId, x: number, y: number): boolean {
    const def = BUILDINGS[defId];
    if (!def) return false;
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        if (!this.inside(cx, cy)) return false;
        if (this.occupied.has(key(cx, cy))) return false;
        if (this.belts.has(key(cx, cy))) return false;
      }
    return true;
  }

  /* ------------------------------------------------------------- costs --- */
  costOf(defId: BuildingId): { gold: number; materials: { item: ItemId; qty: number }[] } {
    const base = buildingCost(defId, this.level.id);
    return {
      gold: Math.max(1, Math.round(base.gold * buildCostMultiplier(this.upgrades))),
      materials: base.materials,
    };
  }

  beltCost(): number {
    return Math.max(1, Math.round(BELT.gold * buildCostMultiplier(this.upgrades)));
  }

  canAfford(gold: number, materials: { item: ItemId; qty: number }[] = []): boolean {
    if (this.gold < gold) return false;
    return materials.every((m) => (this.resources[m.item] ?? 0) >= m.qty);
  }

  /** Клетки, которые занял бы def при установке в (x, y), включая саму площадку. */
  footprint(defId: BuildingId, x: number, y: number, ignoreId?: string): string[] {
    const cells = BUILDINGS[defId]?.cells ?? 1;
    const out: string[] = [];
    for (let dy = 0; dy < cells; dy++)
      for (let dx = 0; dx < cells; dx++) {
        const k = key(x + dx, y + dy);
        const owner = this.occupied.get(k);
        if (owner && owner !== ignoreId) out.push(k);
      }
    return out;
  }

  /** Точная причина, почему постройку нельзя выполнить (null — всё в порядке). */
  blockReason(defId: BuildingId, x: number, y: number): BuildBlock {
    if (!this.level.availableBuildings.includes(defId)) return 'not-available';
    if (this.buildings.length >= MAX_BUILDINGS) return 'limit';
    if (!this.cellsFree(defId, x, y)) return 'occupied';
    const cost = this.costOf(defId);
    if (this.gold < cost.gold) return 'no-gold';
    if (!cost.materials.every((m) => (this.resources[m.item] ?? 0) >= m.qty)) return 'no-materials';
    return null;
  }

  /** Причина, почему нельзя перенести здание id в (x, y). */
  moveBlockReason(id: string, x: number, y: number): BuildBlock {
    const b = this.buildings.find((v) => v.id === id);
    if (!b) return 'occupied';
    const def = BUILDINGS[b.defId];
    if (!def) return 'occupied';
    if (x === b.x && y === b.y) return null;
    if (!this.inside(x, y) || !this.inside(x + def.cells - 1, y + def.cells - 1)) return 'occupied';
    const own = new Set(this.footprint(b.defId, b.x, b.y, b.id));
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        if (!this.inside(cx, cy)) return 'occupied';
        const k = key(cx, cy);
        if (own.has(k)) continue; // свои клетки не мешаем
        if (this.occupied.has(k)) return 'occupied';
        if (this.belts.has(k)) return 'occupied';
      }
    return null;
  }

  /** Перенос здания без повторной оплаты. */
  moveBuilding(id: string, x: number, y: number): boolean {
    const b = this.buildings.find((v) => v.id === id);
    if (!b) return false;
    if (this.moveBlockReason(id, x, y) !== null) return false;
    if (x === b.x && y === b.y) return true;
    const def = BUILDINGS[b.defId];
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) this.occupied.delete(key(b.x + dx, b.y + dy));
    b.x = x;
    b.y = y;
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) this.occupied.set(key(x + dx, y + dy), b.id);
    sfx('place');
    bus.emit('state-changed');
    return true;
  }

  private pay(gold: number, materials: { item: ItemId; qty: number }[] = []): void {
    this.gold -= gold;
    for (const m of materials) this.resources[m.item] = (this.resources[m.item] ?? 0) - m.qty;
  }

  /** Подробное сообщение о нехватке: что именно и сколько нужно. */
  private missingText(defId: BuildingId, cost: { gold: number; materials: { item: ItemId; qty: number }[] }): string {
    const parts: string[] = [];
    if (this.gold < cost.gold) parts.push(`золото: нужно ещё ${cost.gold - this.gold}`);
    for (const m of cost.materials) {
      const have = this.resources[m.item] ?? 0;
      if (have < m.qty) parts.push(`${(ITEMS[m.item]?.name ?? m.item).toLowerCase()}: не хватает ${m.qty - have}`);
    }
    return parts.length ? `Не хватает — ${parts.join(', ')}` : 'Не хватает ресурсов';
  }

  /* ----------------------------------------------------------- building --- */
  placeBuilding(defId: BuildingId, x: number, y: number): boolean {
    const def = BUILDINGS[defId];
    if (!def) return false;
    if (!this.level.availableBuildings.includes(defId)) {
      toast('Здание ещё не открыто на этом уровне', 'error');
      return false;
    }
    if (this.buildings.length >= MAX_BUILDINGS) {
      toast(`Лимит ${MAX_BUILDINGS} зданий`, 'error');
      return false;
    }
    if (!this.cellsFree(defId, x, y)) {
      toast('Здесь занято', 'error');
      return false;
    }
    const cost = this.costOf(defId);
    if (!this.canAfford(cost.gold, cost.materials)) {
      toast(this.missingText(defId, cost), 'error');
      return false;
    }
    this.pay(cost.gold, cost.materials);
    const inst: BuildingInstance = {
      id: `b${++this.seq}`,
      defId,
      x,
      y,
      recipeIndex: 0,
      progress: 0,
      inputs: {},
      outputs: {},
      working: false,
      buildProgress: 0,
    };
    this.addExisting(inst);
    this.recalcBufferBonus();
    sfx('place');
    bus.emit('built', inst);
    return true;
  }

  private addExisting(b: BuildingInstance, instant = false): void {
    // Совместимость со старыми сохранениями (поле buildProgress появилось позже):
    // здания из сейва достраиваем мгновенно, иначе загрузка старого сейва
    // превратила бы их в «вечную стройку» без производства.
    if (instant && (b.buildProgress ?? 1) < 1) b.buildProgress = 1;
    this.buildings.push(b);
    const def = BUILDINGS[b.defId];
    if (!def) return;
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) this.occupied.set(key(b.x + dx, b.y + dy), b.id);
    const num = Number(b.id.replace('b', ''));
    if (!Number.isNaN(num)) this.seq = Math.max(this.seq, num);
  }

  removeAt(x: number, y: number): boolean {
    const b = this.buildingAt(x, y);
    if (b) return this.removeBuilding(b.id);
    const k = key(x, y);
    if (this.belts.has(k)) {
      this.belts.delete(k);
      this.gold += Math.floor(this.beltCost() / 2);
      sfx('destroy');
      return true;
    }
    return false;
  }

  removeBuilding(id: string): boolean {
    const idx = this.buildings.findIndex((b) => b.id === id);
    if (idx < 0) return false;
    const b = this.buildings[idx];
    const def = BUILDINGS[b.defId];
    for (let dy = 0; dy < def.cells; dy++)
      for (let dx = 0; dx < def.cells; dx++) this.occupied.delete(key(b.x + dx, b.y + dy));
    this.buildings.splice(idx, 1);
    const cost = this.costOf(b.defId);
    this.gold += Math.floor(cost.gold / 2);
    for (const m of cost.materials) {
      this.resources[m.item] = (this.resources[m.item] ?? 0) + Math.floor(m.qty / 2);
    }
    this.recalcBufferBonus();
    sfx('destroy');
    bus.emit('destroyed', b);
    return true;
  }

  setRecipe(buildingId: string, index: number): void {
    const b = this.buildings.find((x) => x.id === buildingId);
    if (!b) return;
    const def = BUILDINGS[b.defId];
    if (index < 0 || index >= def.recipes.length) return;
    b.recipeIndex = index;
    b.working = false;
    b.progress = 0;
  }

  private recalcBufferBonus(): void {
    this.bufferBonus = this.buildings.reduce((acc, b) => acc + (BUILDINGS[b.defId]?.bufferBonus ?? 0), 0);
  }

  get inputCap(): number {
    return BASE_INPUT_CAP + this.bufferBonus;
  }
  get outputCap(): number {
    return BASE_OUTPUT_CAP + this.bufferBonus;
  }

  /* -------------------------------------------------------------- belts --- */
  placeBelt(x: number, y: number, dir: Dir): boolean {
    if (!this.inside(x, y)) return false;
    if (this.occupied.has(key(x, y))) {
      toast('Клетка занята зданием', 'error');
      return false;
    }
    const k = key(x, y);
    if (this.belts.has(k)) {
      this.belts.get(k)!.dir = dir;
      return true;
    }
    const price = this.beltCost();
    if (this.gold < price) {
      toast('Не хватает золота', 'error');
      return false;
    }
    this.gold -= price;
    this.belts.set(k, { x, y, dir, items: [] });
    sfx('place');
    return true;
  }

  beltAt(x: number, y: number): BeltTile | null {
    return this.belts.get(key(x, y)) ?? null;
  }

  /* --------------------------------------------------------- simulation --- */
  advance(realDt: number): void {
    if (this.paused) return;
    const dt = Math.min(0.25, realDt) * this.speed;
    this.elapsed += dt;
    const steps = Math.ceil(dt / TICK);
    const step = dt / steps;
    for (let i = 0; i < steps; i++) this.tick(step);
  }

  tick(dt: number): void {
    this.pullFromStorage();
    for (const b of this.buildings) this.processBuilding(b, dt);
    // Сначала конвейеры двигаются и освобождают клетки, потом здания отдают.
    this.moveBelts(dt);
    this.beltsToBuildings();
    this.transferOutputs();
    // Прямая связь со складом: если зданию некуда отдавать продукт (рядом нет
    // свободных клеток под конвейер и нет соседей-получателей), оно сбрасывает
    // его на соседний склад. Без этого рудник со стоящим вплотную складом
    // мгновенно останавливался («не производит ресурс»), а печь железа
    // никогда не выдавала слитки.
    this.dumpToAdjacentStorage();
  }

  /** Соседние клетки здания в пределах карты (свободные или с получателями). */
  private freeNeighbors(b: BuildingInstance): { x: number; y: number }[] {
    return this.neighborCells(b);
  }

  /**
   * Здание отдаёт по одному предмету из своего выходного буфера соседнему
   * складу, если больше отдавать некуда (нет свободных соседних клеток под
   * конвейер и нет соседей-получателей). Работает и при заполненном буфере.
   */
  private dumpToAdjacentStorage(): void {
    for (const b of this.buildings) {
      if ((b.buildProgress ?? 1) < 1) continue;
      if (BUILDINGS[b.defId]?.kind === 'storage') continue;
      const items = Object.keys(b.outputs).filter((k) => (b.outputs[k] ?? 0) > 0);
      if (items.length === 0) continue;
      const item = items[0];
      // если вокруг есть свободные клетки — продукт уйдёт обычным путём
      // (transferOutputs поставит его на конвейер или отдаст соседу)
      if (this.freeNeighbors(b).length > 0) continue;
      // все соседние клетки заняты зданиями: ищем среди них склад
      for (const c of this.neighborCells(b)) {
        const o = this.buildingAt(c.x, c.y);
        if (!o || o.id === b.id) continue;
        if (BUILDINGS[o.defId]?.kind !== 'storage') continue;
        this.resources[item] = (this.resources[item] ?? 0) + 1;
        b.outputs[item] = (b.outputs[item] ?? 0) - 1;
        break;
      }
    }
  }

  /**
   * Умная подача: если зданию не хватает входных материалов или топлива,
   * оно берёт недостающее прямо со склада. Раньше печь железа молча простаивала
   * без руды в буфере — даже когда руда лежала на складе («не производит слитки»).
   */
  private pullFromStorage(): void {
    const cap = this.inputCap;
    for (const b of this.buildings) {
      if ((b.buildProgress ?? 1) < 1) continue;
      const def = BUILDINGS[b.defId];
      if (!def) continue;
      const rec = this.activeRec(b);
      if (!rec) continue;
      // вход рецепта
      for (const i of rec.inputs) {
        const need = Math.max(0, i.qty - (b.inputs[i.item] ?? 0));
        if (need === 0) continue;
        const room = Math.max(0, cap - (b.inputs[i.item] ?? 0));
        const take = Math.min(need, room, this.resources[i.item] ?? 0);
        if (take > 0) {
          this.resources[i.item] = (this.resources[i.item] ?? 0) - take;
          b.inputs[i.item] = (b.inputs[i.item] ?? 0) + take;
        }
      }
      // топливо (уголь и т.п.): если здание уже умеет само его добывать
      // (угольная шахта), оно экономит уголь — иначе шахта жрёт собственный
      // ресурс и никогда не начнёт цикл. Остальные здания берут топливо из
      // общего запаса напрямую: раньше печь железа молча простаивала без
      // угля в буфере («не производит слитки»).
      if (def.fuel) {
        const f = def.fuel;
        const makesFuel = rec.outputs.some((o) => o.item === f.item);
        if (!makesFuel) {
          const need = Math.max(0, f.qty - (b.inputs[f.item] ?? 0));
          if (need > 0) {
            const room = Math.max(0, cap - (b.inputs[f.item] ?? 0));
            const take = Math.min(need, room, this.resources[f.item] ?? 0);
            if (take > 0) {
              this.resources[f.item] = (this.resources[f.item] ?? 0) - take;
              b.inputs[f.item] = (b.inputs[f.item] ?? 0) + take;
            }
          }
        }
      }
    }
  }

  private activeRec(b: BuildingInstance) {
    return activeRecipe(b.defId, b.recipeIndex, this.level.id);
  }

  private hasInputs(b: BuildingInstance, inputs: { item: ItemId; qty: number }[]): boolean {
    return inputs.every((i) => (b.inputs[i.item] ?? 0) >= i.qty);
  }

  private hasOutputSpace(b: BuildingInstance, outputs: { item: ItemId; qty: number }[], cap: number): boolean {
    return outputs.every((o) => (b.outputs[o.item] ?? 0) + o.qty <= cap);
  }

  /** Причина простоя готового здания (для ИИ-помощника и snapshot). */
  private stallReason(b: BuildingInstance): 'no-input' | 'no-fuel' | 'output-full' | null {
    const def = BUILDINGS[b.defId];
    if (!def || def.recipes.length === 0) return null;
    if ((b.buildProgress ?? 1) < 1) return null;
    const rec = this.activeRec(b);
    if (!rec) return null;
    if (!this.hasInputs(b, rec.inputs)) return 'no-input';
    if (def.fuel && (b.inputs[def.fuel.item] ?? 0) < def.fuel.qty) return 'no-fuel';
    if (!this.hasOutputSpace(b, rec.outputs, this.outputCap)) return 'output-full';
    return null;
  }

  private processBuilding(b: BuildingInstance, dt: number): void {
    const def = BUILDINGS[b.defId];
    if (!def || def.recipes.length === 0) return;
    // Стадия стройки: здание не работает, пока buildProgress не дойдёт до 1.
    if ((b.buildProgress ?? 1) < 1) {
      b.buildProgress = Math.min(1, (b.buildProgress ?? 0) + dt / buildTimeFor(b.defId));
      if (b.buildProgress < 1) return;
      b.progress = 0;
      sfx('place');
      bus.emit('state-changed');
    }
    const rec = this.activeRec(b);
    if (!rec) return;
    const mul = speedMultiplier(this.upgrades, def.kind);
    const outCap = this.outputCap;

    if (!b.working) {
      if (!this.hasInputs(b, rec.inputs)) return;
      // топливо берём из внутреннего буфера здания (пополняется со склада в pullFromStorage)
      if (def.fuel && (b.inputs[def.fuel.item] ?? 0) < def.fuel.qty) return;
      if (rec.mana && (this.resources.mana_energy ?? 0) < rec.mana) return;
      if (!this.hasOutputSpace(b, rec.outputs, outCap)) return;
      for (const i of rec.inputs) b.inputs[i.item] = (b.inputs[i.item] ?? 0) - i.qty;
      if (def.fuel) b.inputs[def.fuel.item] = (b.inputs[def.fuel.item] ?? 0) - def.fuel.qty;
      if (rec.mana) this.resources.mana_energy = (this.resources.mana_energy ?? 0) - rec.mana;
      b.working = true;
      b.progress = 0;
    }

    b.progress += dt * mul;
    if (b.progress + 1e-9 < rec.time) return;

    if (!this.hasOutputSpace(b, rec.outputs, outCap)) {
      b.progress = rec.time;
      return;
    }
    for (const o of rec.outputs) {
      b.outputs[o.item] = (b.outputs[o.item] ?? 0) + o.qty;
      this.registerProduced(o.item, o.qty);
    }
    b.working = false;
    b.progress = 0;
    bus.emit('produce', { defId: b.defId, x: b.x, y: b.y, outputs: rec.outputs });
  }

  private registerProduced(item: ItemId, qty: number): void {
    let changed = false;
    for (const q of this.quests) {
      if (q.done || q.item !== item) continue;
      q.progress = Math.min(q.amount, q.progress + qty);
      if (q.progress >= q.amount) {
        q.done = true;
        this.gold += q.reward;
        changed = true;
        bus.emit('quest-done', q);
        toast(`Задание выполнено: +${q.reward} золота`, 'success');
        sfx('quest');
      }
    }
    if (changed) bus.emit('state-changed');
    if (!this.completed && this.quests.length > 0 && this.quests.every((q) => q.done)) {
      this.completed = true;
      bus.emit('level-complete', { levelId: this.level.id });
    }
  }

  /* ------------------------------------------------- перенос предметов --- */
  private neighborCells(b: BuildingInstance): { x: number; y: number; dx: number; dy: number }[] {
    const def = BUILDINGS[b.defId];
    const out: { x: number; y: number; dx: number; dy: number }[] = [];
    const push = (x: number, y: number, dx: number, dy: number) => {
      if (!this.inside(x, y)) return;
      if (this.occupied.has(key(x, y))) return;
      out.push({ x, y, dx, dy });
    };
    for (let i = 0; i < def.cells; i++) {
      push(b.x + i, b.y - 1, 0, -1);
      push(b.x + i, b.y + def.cells, 0, 1);
      push(b.x - 1, b.y + i, -1, 0);
      push(b.x + def.cells, b.y + i, 1, 0);
    }
    return out;
  }

  private accepts(defId: BuildingId, recipeIndex: number, item: ItemId): boolean {
    if (BUILDINGS[defId]?.kind === 'storage') return true;
    const rec = activeRecipe(defId, recipeIndex, this.level.id);
    if (!rec) return false;
    return rec.inputs.some((i) => i.item === item);
  }

  /** Кладём предмет в здание: обычные — в буфер, склад — сразу в общий запас. */
  private insertIntoBuilding(b: BuildingInstance, item: ItemId): boolean {
    if (BUILDINGS[b.defId]?.kind === 'storage') {
      this.resources[item] = (this.resources[item] ?? 0) + 1;
      return true;
    }
    if ((b.inputs[item] ?? 0) >= this.inputCap) return false;
    b.inputs[item] = (b.inputs[item] ?? 0) + 1;
    return true;
  }

  private pushFromBuilding(b: BuildingInstance, item: ItemId): boolean {
    const cells = this.neighborCells(b);
    const centerX = b.x + BUILDINGS[b.defId].cells / 2;
    const centerY = b.y + BUILDINGS[b.defId].cells / 2;
    // 1) конвейеры, уводящие от здания
    const belts = cells
      .map((c) => ({ c, tile: this.beltAt(c.x, c.y) }))
      .filter((x): x is { c: typeof cells[number]; tile: BeltTile } => !!x.tile && x.tile.items.length < BELT.capacity)
      .sort((p, q) => {
        const score = (v: { c: { x: number; y: number }; tile: BeltTile }) => {
          const [vx, vy] = DIR_VEC[v.tile.dir];
          const away = (v.c.x + 0.5 - centerX) * vx + (v.c.y + 0.5 - centerY) * vy;
          return away * 2 - v.tile.items.length;
        };
        return score(q) - score(p);
      });
    if (belts.length > 0) {
      belts[0].tile.items.push({ item, progress: 0 });
      return true;
    }
    // 2) напрямую в соседнее здание (или на склад)
    for (const c of cells) {
      const other = this.buildingAt(c.x, c.y);
      if (!other || other.id === b.id) continue;
      if (!this.accepts(other.defId, other.recipeIndex, item)) continue;
      if (this.insertIntoBuilding(other, item)) return true;
    }
    return false;
  }

  private transferOutputs(): void {
    for (const b of this.buildings) {
      const items = Object.keys(b.outputs).filter((k) => (b.outputs[k] ?? 0) > 0);
      if (items.length === 0) continue;
      for (const item of items) {
        if (this.pushFromBuilding(b, item)) {
          b.outputs[item] -= 1;
          break;
        }
      }
    }
  }

  private handoff(tile: BeltTile, item: { item: ItemId; progress: number }): boolean {
    const [dx, dy] = DIR_VEC[tile.dir];
    const nx = tile.x + dx;
    const ny = tile.y + dy;
    if (!this.inside(nx, ny)) return false;
    const next = this.beltAt(nx, ny);
    if (next && next.items.length < BELT.capacity) {
      next.items.push({ item: item.item, progress: 0 });
      return true;
    }
    const b = this.buildingAt(nx, ny);
    if (b && this.accepts(b.defId, b.recipeIndex, item.item) && this.insertIntoBuilding(b, item.item)) {
      return true;
    }
    return false;
  }

  private moveBelts(dt: number): void {
    const speed = BELT.speed;
    for (const tile of this.belts.values()) {
      for (let i = 0; i < tile.items.length; i++) {
        const it = tile.items[i];
        if (i === 0) {
          if (it.progress < 1) it.progress = Math.min(1, it.progress + speed * dt);
          if (it.progress >= 1 && this.handoff(tile, it)) {
            tile.items.shift();
            i--;
          }
        } else {
          const limit = Math.max(0, tile.items[i - 1].progress - 0.28);
          if (it.progress < limit) it.progress = Math.min(limit, it.progress + speed * dt);
        }
      }
    }
  }

  /** Забираем предметы с конвейера, упирающегося в здание (на случай, если загрузка шла иначе). */
  private beltsToBuildings(): void {
    for (const tile of this.belts.values()) {
      const front = tile.items[0];
      if (!front || front.progress < 1) continue;
      if (this.handoff(tile, front)) tile.items.shift();
    }
  }

  /* ------------------------------------------------------------- прочее --- */
  sell(item: ItemId, qty: number): number {
    const have = this.resources[item] ?? 0;
    const n = Math.min(qty, have);
    if (n <= 0) return 0;
    this.resources[item] = have - n;
    const money = Math.round(itemSell(item) * n);
    this.gold += money;
    sfx('click');
    return money;
  }

  countOf(defId: BuildingId): number {
    return this.buildings.filter((b) => b.defId === defId).length;
  }

  snapshot(): Snapshot {
    return {
      resources: { ...this.resources },
      gold: this.gold,
      quests: this.quests.map((q) => ({ ...q })),
      levelId: this.level.id,
      levelName: this.level.name,
      elapsed: this.elapsed,
      parTime: this.level.parTime,
      allQuestsDone: this.quests.length > 0 && this.quests.every((q) => q.done),
      buildingsCount: this.buildings.length,
      beltsCount: this.belts.size,
      gridsize: [this.gridW, this.gridH],
      buildQueue: this.buildings.map((b) => {
        const bp = b.buildProgress ?? 1;
        const rec = this.activeRec(b);
        const cycle = bp < 1 ? 1 : rec ? Math.min(1, (b.progress || 0) / rec.time) : 0;
        return {
          id: b.id,
          defId: b.defId,
          name: BUILDINGS[b.defId]?.name ?? b.defId,
          x: b.x,
          y: b.y,
          progress: bp < 1 ? bp * 0.985 : cycle,
          building: bp < 1,
          stalled: bp >= 1 && !b.working && this.stallReason(b) !== null,
          stallReason: bp >= 1 ? this.stallReason(b) : null,
        };
      }),
    };
  }

  serialize(): EngineSave {
    return {
      levelId: this.level.id,
      resources: { ...this.resources },
      gold: this.gold,
      buildings: this.buildings.map((b) => ({
        ...b,
        inputs: { ...b.inputs },
        outputs: { ...b.outputs },
      })),
      belts: [...this.belts.values()].map((t) => ({ ...t, items: t.items.map((i) => ({ ...i })) })),
      quests: this.quests.map((q) => ({ ...q })),
      elapsed: this.elapsed,
    };
  }
}

/** Список предметов, которые умеет принимать здание (для подсказок в UI). */
export function acceptsItems(defId: BuildingId, levelId: number): ItemId[] {
  const def = BUILDINGS[defId];
  return def.recipes.flatMap((rec) => activeRecipe(defId, 0, levelId)?.inputs.map((i) => i.item) ?? []);
}

export const itemLabel = (id: ItemId) => ITEMS[id]?.name ?? id;
export const priceOf = (id: ItemId) => itemSell(id);

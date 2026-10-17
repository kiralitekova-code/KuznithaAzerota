export type ItemId = string;
export type BuildingId = string;
export type Dir = 'n' | 'e' | 's' | 'w';

export type ItemCategory = 'raw' | 'intermediate' | 'final' | 'energy';

export interface ItemDef {
  id: ItemId;
  name: string;
  nameEn: string;
  category: ItemCategory;
  /** Цена продажи за 1 шт. */
  sell: number;
  /** id спрайта-иконки (по умолчанию совпадает с id) */
  iconId?: ItemId;
  desc?: string;
}

export interface Ingredient {
  item: ItemId;
  qty: number;
}

export interface Recipe {
  id: string;
  inputs: Ingredient[];
  outputs: Ingredient[];
  /** базовое время цикла, сек */
  time: number;
  /** расход маны за цикл */
  mana?: number;
}

export type BuildingKind = 'mine' | 'smelter' | 'craft' | 'power' | 'storage' | 'enchanter';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  nameEn: string;
  cells: number;
  kind: BuildingKind;
  unlockLevel: number;
  cost: { gold: number; materials?: Ingredient[] };
  recipes: Recipe[];
  /** расход угля за цикл (только шахты/печи) */
  fuel?: Ingredient;
  /** бонус к буферу склада */
  bufferBonus?: number;
  desc: string;
}

export interface BuildingInstance {
  id: string;
  defId: BuildingId;
  x: number;
  y: number;
  recipeIndex: number;
  progress: number;
  inputs: Record<ItemId, number>;
  outputs: Record<ItemId, number>;
  working: boolean;
  /** прогресс стройки 0..1 (< 1 — здание ещё строится и не работает) */
  buildProgress?: number;
}

/** Причина, по которой постройку/перенос выполнить нельзя. */
export type BuildBlock = 'not-available' | 'limit' | 'occupied' | 'no-gold' | 'no-materials' | null;

export interface BeltItem {
  item: ItemId;
  progress: number;
}

export interface BeltTile {
  x: number;
  y: number;
  dir: Dir;
  items: BeltItem[];
}

export interface QuestDef {
  id: string;
  type: 'produce';
  item: ItemId;
  amount: number;
  reward: { gold: number };
  /** Человекочитаемое описание задания (что и как делать). */
  desc?: string;
}

export interface QuestState {
  id: string;
  item: ItemId;
  amount: number;
  progress: number;
  desc?: string;
  done: boolean;
  reward: number;
}

export interface LevelDef {
  id: number;
  name: string;
  mapSize: [number, number];
  startingResources: Record<ItemId, number>;
  startingGold: number;
  availableBuildings: BuildingId[];
  quests: QuestDef[];
  parTime: number;
  unlockUpgradeChoice?: number;
}

export type UpgradeKind = 'production' | 'smelting' | 'mining' | 'building' | 'quest';

export interface UpgradeDef {
  id: UpgradeKind;
  name: string;
  desc: string;
  icon: string;
  /** прибавка к бонусу за каждое взятие */
  perStack: number;
  maxStacks: number;
}

export interface PlayerProfile {
  gold: number;
  unlockedLevel: number;
  upgrades: Partial<Record<UpgradeKind, number>>;
  totalPlayTime: number;
}

export interface Settings {
  music: number;
  sfx: number;
  lang: 'ru';
}

export interface SaveData {
  version: number;
  player: PlayerProfile;
  currentLevel: null | {
    levelId: number;
    resources: Record<ItemId, number>;
    gold: number;
    buildings: BuildingInstance[];
    belts: BeltTile[];
    quests: QuestState[];
    elapsed: number;
  };
  settings: Settings;
  meta: { lastSavedAt: number; totalPlayTime: number; lastCompletedLevel?: number };
}

/** Краткая информация о строящемся/построенном здании для панели стройки. */
export interface BuildInfoEntry {
  id: string;
  defId: BuildingId;
  name: string;
  x: number;
  y: number;
  /** 0..1 — общий прогресс (стройка + готовность) */
  progress: number;
  building: boolean;
  /** true — здание готово, но простаивает (нет руды/угля или выход переполнен) */
  stalled?: boolean;
  /** причина простоя для подсказок ИИ-помощника */
  stallReason?: 'no-input' | 'no-fuel' | 'output-full' | null;
}

export interface Snapshot {
  resources: Record<ItemId, number>;
  gold: number;
  quests: QuestState[];
  levelId: number;
  levelName: string;
  elapsed: number;
  parTime: number;
  allQuestsDone: boolean;
  buildingsCount: number;
  beltsCount: number;
  gridsize: [number, number];
  buildQueue: BuildInfoEntry[];
}

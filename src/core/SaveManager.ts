import type { SaveData } from '../types';

const KEY = 'forge_save_v1';
export const SAVE_VERSION = 3;

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  player: { gold: 0, unlockedLevel: 1, upgrades: {}, totalPlayTime: 0 },
  currentLevel: null,
  settings: { music: 0.5, sfx: 0.8, lang: 'ru' },
  meta: { lastSavedAt: 0, totalPlayTime: 0 },
});

/** Миграции сохранений: каждая ступень — отдельная функция. */
export function migrate(data: unknown): SaveData {
  const base = defaultSave();
  if (!data || typeof data !== 'object') return base;
  const save = { ...base, ...(data as Partial<SaveData>) } as SaveData;
  const v = (save as { version?: number }).version ?? 1;

  if (v < 2) {
    save.player = { ...base.player, ...(save.player ?? {}) };
    save.settings = { ...base.settings, ...(save.settings ?? {}) };
    save.player.upgrades = save.player.upgrades ?? {};
  }
  if (v < 3) {
    save.meta = { ...base.meta, ...(save.meta ?? {}) };
    if (typeof save.player.unlockedLevel !== 'number' || save.player.unlockedLevel < 1) save.player.unlockedLevel = 1;
    if (save.currentLevel && !Array.isArray(save.currentLevel.belts)) save.currentLevel = null;
  }
  save.version = SAVE_VERSION;
  return save;
}

async function idb() {
  return import('idb-keyval');
}

export async function saveGame(data: SaveData): Promise<void> {
  try {
    const { set } = await idb();
    await set(KEY, { ...data, meta: { ...data.meta, lastSavedAt: Date.now() } });
    localStorage.setItem('forge_save_meta', JSON.stringify({ at: Date.now() }));
  } catch (e) {
    console.warn('Не удалось сохранить игру', e);
  }
}

export async function loadGame(): Promise<SaveData | null> {
  try {
    const { get } = await idb();
    const data = await get(KEY);
    return data ? migrate(data) : null;
  } catch (e) {
    console.warn('Не удалось загрузить сохранение', e);
    return null;
  }
}

export async function clearGame(): Promise<void> {
  try {
    const { del } = await idb();
    await del(KEY);
  } catch {
    /* ignore */
  }
}

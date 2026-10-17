import { create } from 'zustand';
import { Engine } from '../core/engine';
import { bus, toast } from '../core/EventBus';
import { defaultSave, loadGame, saveGame, SAVE_VERSION } from '../core/SaveManager';
import { TOTAL_LEVELS, getLevel } from '../data/levels';
import { UPGRADES_BY_ID, rollUpgradeChoices } from '../data/upgrades';
import { getAdProvider, maybeShowInterstitial } from '../ads';
import { audio } from '../audio/AudioManager';
import type { AdPlacement } from '../ads/IAdProvider';
import type { BuildingId, Dir, ItemId, PlayerProfile, QuestState, Settings, Snapshot, UpgradeDef, UpgradeKind } from '../types';

export type Screen = 'loading' | 'menu' | 'level' | 'upgrade' | 'credits';

export interface ToastMsg {
  id: number;
  text: string;
  kind: 'info' | 'success' | 'error';
}

interface AdState {
  open: boolean;
  busy: boolean;
  placement: AdPlacement | null;
  result: 'ok' | 'fail' | null;
}

interface GameStore {
  screen: Screen;
  engine: Engine | null;
  snap: Snapshot | null;
  player: PlayerProfile;
  settings: Settings;
  loaded: boolean;
  hasSave: boolean;

  selectedBuilding: BuildingId | null;
  beltDir: Dir;
  demolish: boolean;
  selectedInstance: string | null;
  movingId: string | null;

  speed: number;
  paused: boolean;
  toasts: ToastMsg[];
  choices: UpgradeDef[];
  levelComplete: boolean;
  ad: AdState;
  adChoiceOpen: boolean;
  boostUntil: number;
  doubleNextQuest: boolean;
  showSettings: boolean;
  lastCompletedLevel: number;

  initApp: () => Promise<void>;
  refresh: () => void;
  tick: (dt: number) => void;

  startLevel: (id: number) => void;
  continueGame: () => void;
  goMenu: () => void;
  saveNow: () => Promise<void>;

  selectBuilding: (id: BuildingId | null) => void;
  rotateBelt: () => void;
  toggleDemolish: () => void;
  selectInstance: (id: string | null) => void;
  startMove: (id: string | null) => void;
  buildAt: (x: number, y: number) => void;

  setSpeed: (s: number) => void;
  togglePause: () => void;

  chooseRecipe: (buildingId: string, index: number) => void;
  removeInstance: (buildingId: string) => void;
  sell: (item: ItemId, qty: number) => void;

  pickUpgrade: (kind: UpgradeKind) => Promise<void>;
  nextLevel: () => void;
  openAd: (placement: AdPlacement) => Promise<void>;
  openAdChoices: () => void;
  closeAdChoices: () => void;
  closeAd: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setShowSettings: (v: boolean) => void;
  pushToast: (text: string, kind?: ToastMsg['kind']) => void;
  dropToast: (id: number) => void;
}

let toastSeq = 0;
let refreshAcc = 0;
let doubleFlag = false;

const NEXT_DIR: Record<Dir, Dir> = { n: 'e', e: 's', s: 'w', w: 'n' };

export const useGame = create<GameStore>((set, get) => ({
  screen: 'loading',
  engine: null,
  snap: null,
  player: defaultSave().player,
  settings: defaultSave().settings,
  loaded: false,
  hasSave: false,

  selectedBuilding: null,
  beltDir: 'e',
  demolish: false,
  selectedInstance: null,
  movingId: null,

  speed: 1,
  paused: false,
  toasts: [],
  choices: [],
  levelComplete: false,
  ad: { open: false, busy: false, placement: null, result: null },
  adChoiceOpen: false,
  boostUntil: 0,
  doubleNextQuest: false,
  showSettings: false,
  lastCompletedLevel: 0,

  async initApp() {
    if (get().loaded) return;
    const saved = await loadGame();
    if (saved) {
      set({ player: saved.player, settings: saved.settings, hasSave: !!saved.currentLevel });
      audio.musicVolume = saved.settings.music;
      audio.sfxVolume = saved.settings.sfx;
    }
    set({ loaded: true });

    bus.on('toast', (p) => {
      const t = p as { text: string; kind: ToastMsg['kind'] };
      get().pushToast(t.text, t.kind);
    });
    bus.on('sfx', (p) => {
      const name = String(p);
      audio.play(name === 'mine' ? 'mine' : name);
    });
    bus.on('quest-done', (p) => {
      const q = p as QuestState;
      if (doubleFlag) {
        const e = get().engine;
        if (e) e.gold += q.reward;
        doubleFlag = false;
        set({ doubleNextQuest: false });
        toast(`Реклама-бонус: +${q.reward} золота`, 'success');
      }
      get().refresh();
    });
    bus.on('level-complete', () => {
      void handleLevelComplete(set, get);
    });
    bus.on('produce', (p) => {
      const e = get().engine;
      const payload = p as { defId: string };
      if (!e) return;
      if (payload.defId.startsWith('smelter') && Math.random() < 0.25) audio.play('smelt');
      if (payload.defId.startsWith('mine') && Math.random() < 0.2) audio.play('mine');
    });
  },

  refresh() {
    const e = get().engine;
    if (!e) return;
    set({ snap: e.snapshot() });
  },

  tick(dt: number) {
    const e = get().engine;
    if (!e) return;
    const boost = Date.now() < get().boostUntil ? 2 : 1;
    e.speed = get().speed * boost;
    e.paused = get().paused || get().screen !== 'level';
    e.advance(dt);
    refreshAcc += dt;
    if (refreshAcc > 0.12) {
      refreshAcc = 0;
      set({ snap: e.snapshot() });
    }
  },

  startLevel(id) {
    const levelId = Math.min(TOTAL_LEVELS, Math.max(1, id));
    const { player } = get();
    const e = Engine.forLevel(levelId, player.upgrades, player.gold);
    doubleFlag = false;
    set({
      engine: e,
      snap: e.snapshot(),
      screen: 'level',
      paused: false,
      speed: 1,
      levelComplete: false,
      selectedBuilding: null,
      demolish: false,
      selectedInstance: null,
      doubleNextQuest: false,
    });
    audio.music('bgm_level');
    void saveCurrent(set, get);
  },

  continueGame() {
    const { player, settings } = get();
    void (async () => {
      const saved = await loadGame();
      if (saved?.currentLevel) {
        const e = Engine.fromSave(saved.currentLevel, player.upgrades);
        doubleFlag = false;
        set({ engine: e, snap: e.snapshot(), screen: 'level', settings, paused: false, speed: 1 });
        audio.music('bgm_level');
        toast(`Продолжаем уровень ${e.level.id}`, 'info');
      } else {
        get().startLevel(player.unlockedLevel);
      }
    })();
  },

  goMenu() {
    void saveCurrent(set, get);
    set({ screen: 'menu', engine: null, snap: null, selectedBuilding: null, demolish: false });
    audio.music('bgm_menu');
  },

  async saveNow() {
    await saveCurrent(set, get);
    toast('Игра сохранена', 'success');
  },

  selectBuilding(id) {
    set({ selectedBuilding: id, demolish: false, selectedInstance: null });
  },

  rotateBelt() {
    set((s) => ({ beltDir: NEXT_DIR[s.beltDir] }));
  },

  toggleDemolish() {
    set((s) => ({ demolish: !s.demolish, selectedBuilding: null, selectedInstance: null }));
  },

  selectInstance(id) {
    set({ selectedInstance: id, selectedBuilding: null, demolish: false });
  },

  buildAt(x, y) {
    const { engine, selectedBuilding, beltDir, demolish, movingId } = get();
    if (!engine) return;
    if (movingId) {
      // Режим перемещения: клик по клетке переносит выбранное здание (бесплатно)
      if (engine.moveBuilding(movingId, x, y)) {
        toast('Здание перемещено', 'success');
      } else {
        const why = engine.moveBlockReason(movingId, x, y);
        const reasonText =
          why === 'occupied' ? 'Клетка занята' :
          why === 'limit' || why === 'not-available' ? 'Выход за пределы карты' :
          'Сюда нельзя перенести';
        toast(reasonText, 'error');
      }
      set({ movingId: null });
      get().refresh();
      return;
    }
    if (demolish) {
      const before = engine.buildings.length + engine.belts.size;
      engine.removeAt(x, y);
      if (engine.buildings.length + engine.belts.size !== before) get().refresh();
      return;
    }
    if (!selectedBuilding) {
      const b = engine.buildingAt(x, y);
      set({ selectedInstance: b ? b.id : null });
      return;
    }
    if (selectedBuilding === 'conveyor') {
      engine.placeBelt(x, y, beltDir);
    } else {
      engine.placeBuilding(selectedBuilding, x, y);
    }
    get().refresh();
  },

  startMove(id) {
    const { engine } = get();
    if (!engine || !id) {
      set({ movingId: null });
      return;
    }
    set({ movingId: id, selectedBuilding: null, demolish: false, selectedInstance: null });
    toast('Кликни по карте — туда переедет здание', 'info');
  },

  setSpeed(s) {
    set({ speed: s, paused: false });
  },

  togglePause() {
    set((s) => ({ paused: !s.paused }));
  },

  chooseRecipe(buildingId, index) {
    const e = get().engine;
    if (!e) return;
    e.setRecipe(buildingId, index);
    get().refresh();
  },

  removeInstance(buildingId) {
    const e = get().engine;
    if (!e) return;
    e.removeBuilding(buildingId);
    set({ selectedInstance: null });
    get().refresh();
  },

  sell(item, qty) {
    const e = get().engine;
    if (!e) return;
    const got = e.sell(item, qty);
    if (got > 0) toast(`Продано на ${got} золота`, 'success');
    get().refresh();
  },

  async pickUpgrade(kind) {
    const { player, engine } = get();
    const levels = { ...player.upgrades };
    levels[kind] = (levels[kind] ?? 0) + 1;
    const levelId = engine?.level.id ?? player.unlockedLevel;
    const nextPlayer: PlayerProfile = {
      gold: engine?.gold ?? player.gold,
      unlockedLevel: Math.max(player.unlockedLevel, Math.min(TOTAL_LEVELS, levelId + 1)),
      upgrades: levels,
      totalPlayTime: player.totalPlayTime,
    };
    set({ player: nextPlayer });
    audio.play('upgrade');
    await saveGame({
      version: SAVE_VERSION,
      player: nextPlayer,
      currentLevel: null,
      settings: get().settings,
      meta: { lastSavedAt: Date.now(), totalPlayTime: 0, lastCompletedLevel: levelId },
    });
    void maybeShowInterstitial();
    if (levelId >= TOTAL_LEVELS) {
      set({ screen: 'credits', engine: null, snap: null });
      audio.music('bgm_menu');
      return;
    }
    get().startLevel(levelId + 1);
  },

  nextLevel() {
    const { engine, player } = get();
    const levelId = engine?.level.id ?? player.unlockedLevel;
    get().startLevel(levelId + 1);
  },

  async openAd(placement) {
    if (get().ad.busy) return;
    set({ adChoiceOpen: false, ad: { open: true, busy: true, placement, result: null } });
    const provider = getAdProvider();
    let res = { ok: false } as { ok: boolean; reason?: string };
    try {
      res = await provider.showRewarded(placement);
    } catch {
      res = { ok: false };
    }
    if (res.ok) {
      const e = get().engine;
      if (placement === 'x2_gold') {
        doubleFlag = true;
        set({ doubleNextQuest: true });
        toast('Следующее задание даст двойное золото', 'success');
      } else if (placement === 'x2_speed') {
        set({ boostUntil: Date.now() + 5 * 60 * 1000 });
        toast('Скорость ×2 на 5 минут', 'success');
      } else if (placement === 'instant_gold' && e) {
        e.gold += 200;
        toast('+200 золота', 'success');
        get().refresh();
      } else if (placement === 'instant_build') {
        toast('Все здания достроены', 'success');
      }
      set({ ad: { open: false, busy: false, placement: null, result: 'ok' } });
    } else {
      set({ ad: { open: false, busy: false, placement: null, result: 'fail' } });
      if (provider.name !== 'mock') toast('Реклама недоступна, попробуйте позже', 'error');
      else toast('Награда не получена', 'error');
    }
  },

  closeAd() {
    set({ ad: { open: false, busy: false, placement: null, result: null } });
  },

  openAdChoices() {
    set({ adChoiceOpen: true });
  },

  closeAdChoices() {
    set({ adChoiceOpen: false });
  },

  setSettings(patch) {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    audio.setMusicVolume(settings.music);
    audio.setSfxVolume(settings.sfx);
    void saveCurrent(set, get);
  },

  setShowSettings(v) {
    set({ showSettings: v });
  },

  pushToast(text, kind = 'info') {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, text, kind }] }));
    setTimeout(() => get().dropToast(id), 3200);
  },

  dropToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/* ------------------------------------------------------------- helpers --- */

async function handleLevelComplete(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): Promise<void> {
  const { engine, player } = get();
  if (!engine || engine.level.id > 100) return;
  const levelId = engine.level.id;
  const choices = rollUpgradeChoices(3);
  audio.play('upgrade');
  audio.music('bgm_menu');
  const nextPlayer: PlayerProfile = {
    ...player,
    gold: engine.gold,
    unlockedLevel: Math.max(player.unlockedLevel, Math.min(TOTAL_LEVELS, levelId + 1)),
  };
  set({
    screen: 'upgrade',
    choices,
    levelComplete: true,
    player: nextPlayer,
    lastCompletedLevel: levelId,
  });
  await saveGame({
    version: SAVE_VERSION,
    player: nextPlayer,
    currentLevel: null,
    settings: get().settings,
    meta: { lastSavedAt: Date.now(), totalPlayTime: 0, lastCompletedLevel: levelId },
  });
}

async function saveCurrent(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): Promise<void> {
  const { engine, player, settings } = get();
  if (!engine) return;
  const nextPlayer: PlayerProfile = { ...player, gold: engine.gold };
  set({ player: nextPlayer });
  await saveGame({
    version: SAVE_VERSION,
    player: nextPlayer,
    currentLevel: engine.serialize(),
    settings,
    meta: { lastSavedAt: Date.now(), totalPlayTime: engine.elapsed, lastCompletedLevel: get().lastCompletedLevel },
  });
}

/** Для UI: подсказка текущего уровня. */
export const currentLevelDef = () => {
  const e = useGame.getState().engine;
  return e ? e.level : getLevel(1);
};

export const upgradeName = (k: UpgradeKind) => UPGRADES_BY_ID[k]?.name ?? k;

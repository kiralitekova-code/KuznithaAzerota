/**
 * Генератор 100 статических уровней (src/data/levels.ts).
 * Уровни 1–5 заданы вручную как обучающие, остальные строятся по тирам
 * (1–20, 21–40, 41–60, 61–80, 81–100) с ростом объёмов и числа заданий.
 *
 * Запуск: npm run levels
 */
import fs from 'node:fs';
import path from 'node:path';

const BUILDINGS = [
  ['mine_iron', 1],
  ['lumberjack', 1],
  ['warehouse', 1],
  ['mine_coal', 2],
  ['forge_small', 2],
  ['smelter_iron', 1],
  ['mine_copper', 3],
  ['smelter_copper', 4],
  ['generator_coal', 6],
  ['gear_bench', 8],
  ['forge_large', 10],
  ['assembler', 15],
  ['enchanter', 30],
  ['mine_mithril', 40],
  ['smelter_mithril', 40],
  ['generator_magic', 50],
];

const TIER_NAMES = [
  ['Первая кузня', 'Дым над горном', 'Угольный перевал', 'Рудная жила', 'Молот и наковальня', 'Шлаковый двор'],
  ['Медный тракт', 'Шестерённый цех', 'Мана-поток', 'Кузня на перевале', 'Заказы гильдии', 'Сборочный ряд'],
  ['Мифриловый предел', 'Рунный горн', 'Зачарованный клинок', 'Плавильня глубин', 'Орден кузнецов', 'Древние чертежи'],
  ['Тёмное железо', 'Копейный ряд', 'Кузня теней', 'Руническая линия', 'Пламенный конвейер', 'Мастерская титанов'],
  ['Артефактный цех', 'Сердце горна', 'Легендарная ковка', 'Трон кузнеца', 'Вечный горн', 'Кузница Азерота'],
];

const TIER_ITEMS = ['ancient_sword_t1', 'ancient_axe_t2', 'ancient_hammer_t3', 'ancient_spear_t4', 'ancient_artifact_t5'];

function quest(id, item, amount, gold) {
  return { id, type: 'produce', item, amount: Math.max(1, Math.round(amount)), reward: { gold: Math.round(gold) } };
}

function makeLevel(level) {
  const tier = Math.min(5, Math.ceil(level / 20));
  const names = TIER_NAMES[tier - 1];
  const name = names[(level - 1) % names.length] + (level > 6 ? ` · ${level}` : '');
  const mapSize = level < 40 ? [40, 25] : level < 70 ? [48, 30] : [60, 40];
  const availableBuildings = BUILDINGS.filter(([, unlock]) => unlock <= level).map(([id]) => id);

  const quests = [];
  quests.push(quest('q_ingot', 'ingot_iron', 8 + level * 2, 80 + level * 18));
  if (level >= 2) quests.push(quest('q_blade', 'blade_rough', 4 + Math.floor(level * 0.8), 120 + level * 20));
  if (level >= 8) quests.push(quest('q_gear', 'gear_small', 2 + Math.floor(level / 10), 180 + level * 22));
  if (level >= 10) quests.push(quest('q_refined', 'blade_refined', 2 + Math.floor(level / 12), 320 + level * 30));
  if (level >= 15)
    quests.push(quest('q_final', TIER_ITEMS[tier - 1], 1 + Math.floor((level - 15) / 15), 600 + level * 55));
  if (level >= 30)
    quests.push(quest('q_ench', `${TIER_ITEMS[tier - 1]}_enchanted`, 1 + Math.floor((level - 30) / 20), 900 + level * 70));
  if (level >= 40) quests.push(quest('q_mithril', 'ingot_mithril', 3 + Math.floor(level / 8), 800 + level * 45));
  if (level >= 55) quests.push(quest('q_gear2', 'gear_large', 2 + Math.floor(level / 20), 1100 + level * 50));

  return {
    id: level,
    name,
    mapSize,
    startingResources: {
      coal: 50 + level * 3,
      wood: 30 + level * 2,
      leather: 10 + Math.floor(level / 2),
      ingot_iron: level >= 10 ? 5 : 0,
      rune_shard: level >= 30 ? 2 : 0,
      mana_core: level >= 50 ? 1 : 0,
    },
    startingGold: 350 + level * 90,
    availableBuildings,
    quests,
    parTime: 120 + level * 8,
    unlockUpgradeChoice: 3,
  };
}

/* --------------------------- обучающие 1–6 вручную --------------------------- */
const tutorial = {
  1: {
    id: 1,
    name: 'Первая кузня',
    mapSize: [30, 20],
    startingResources: { coal: 60, wood: 40, leather: 10 },
    startingGold: 400,
    availableBuildings: ['mine_iron', 'lumberjack', 'smelter_iron', 'warehouse'],
    quests: [quest('q_ingot_1', 'ingot_iron', 6, 80), quest('q_ingot_2', 'ingot_iron', 15, 160)],
    parTime: 180,
    unlockUpgradeChoice: 3,
  },
  2: {
    id: 2,
    name: 'Дым над горном',
    mapSize: [30, 20],
    startingResources: { coal: 70, wood: 50, leather: 10 },
    startingGold: 500,
    availableBuildings: ['mine_iron', 'lumberjack', 'smelter_iron', 'mine_coal', 'forge_small', 'warehouse'],
    quests: [quest('q_ingot', 'ingot_iron', 12, 120), quest('q_blade', 'blade_rough', 5, 220)],
    parTime: 210,
    unlockUpgradeChoice: 3,
  },
  3: {
    id: 3,
    name: 'Угольный перевал',
    mapSize: [32, 22],
    startingResources: { coal: 80, wood: 50, leather: 12 },
    startingGold: 650,
    availableBuildings: ['mine_iron', 'lumberjack', 'smelter_iron', 'mine_coal', 'forge_small', 'mine_copper', 'warehouse'],
    quests: [
      quest('q_coal', 'coal', 30, 120),
      quest('q_ingot', 'ingot_iron', 18, 200),
      quest('q_blade', 'blade_rough', 6, 260),
    ],
    parTime: 240,
    unlockUpgradeChoice: 3,
  },
  4: {
    id: 4,
    name: 'Рудная жила',
    mapSize: [32, 22],
    startingResources: { coal: 90, wood: 60, leather: 14 },
    startingGold: 800,
    availableBuildings: [
      'mine_iron',
      'lumberjack',
      'smelter_iron',
      'mine_coal',
      'forge_small',
      'mine_copper',
      'smelter_copper',
      'warehouse',
    ],
    quests: [
      quest('q_copper', 'ingot_copper', 10, 200),
      quest('q_ingot', 'ingot_iron', 24, 260),
      quest('q_blade', 'blade_rough', 8, 320),
    ],
    parTime: 270,
    unlockUpgradeChoice: 3,
  },
  5: {
    id: 5,
    name: 'Молот и наковальня',
    mapSize: [34, 24],
    startingResources: { coal: 100, wood: 70, leather: 16 },
    startingGold: 950,
    availableBuildings: [
      'mine_iron',
      'lumberjack',
      'smelter_iron',
      'mine_coal',
      'forge_small',
      'mine_copper',
      'smelter_copper',
      'warehouse',
    ],
    quests: [
      quest('q_hilt', 'hilt', 4, 220),
      quest('q_ingot', 'ingot_iron', 30, 300),
      quest('q_blade', 'blade_rough', 10, 380),
    ],
    parTime: 300,
    unlockUpgradeChoice: 3,
  },
  6: {
    id: 6,
    name: 'Шлаковый двор',
    mapSize: [34, 24],
    startingResources: { coal: 110, wood: 70, leather: 18 },
    startingGold: 1100,
    availableBuildings: [
      'mine_iron',
      'lumberjack',
      'smelter_iron',
      'mine_coal',
      'forge_small',
      'mine_copper',
      'smelter_copper',
      'generator_coal',
      'warehouse',
    ],
    quests: [
      quest('q_mana', 'mana_energy', 6, 240),
      quest('q_ingot', 'ingot_iron', 36, 340),
      quest('q_blade', 'blade_rough', 12, 420),
    ],
    parTime: 330,
    unlockUpgradeChoice: 3,
  },
};

const levels = [];
for (let i = 1; i <= 100; i++) levels.push(tutorial[i] ?? makeLevel(i));

const banner = `/* ВНИМАНИЕ: файл сгенерирован tools/gen-levels.mjs — правьте генератор, а не этот файл. */
import type { LevelDef } from '../types';

export const TOTAL_LEVELS = ${levels.length};

export const LEVELS: LevelDef[] = [
${levels.map((l) => `  ${JSON.stringify(l)},`).join('\n')}
];

export const getLevel = (id: number): LevelDef => LEVELS[Math.min(LEVELS.length - 1, Math.max(0, id - 1))];
`;

const out = path.resolve(process.cwd(), 'src', 'data', 'levels.ts');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, banner, 'utf8');
console.log(`Уровней сгенерировано: ${levels.length} → ${out}`);

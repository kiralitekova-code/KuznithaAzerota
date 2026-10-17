import type { BuildingDef, BuildingId, Ingredient, ItemId, LevelDef } from '../types';

/** Метаданные конвейера (не здание в сетке зданий). */
export const BELT = {
  id: 'conveyor' as BuildingId,
  name: 'Конвейер',
  nameEn: 'Conveyor',
  gold: 8,
  speed: 1, // клеток в секунду
  capacity: 4, // предметов на тайл
  unlockLevel: 1,
};

const r = (
  id: string,
  inputs: Ingredient[],
  outputs: Ingredient[],
  time: number,
  mana?: number,
): BuildingDef['recipes'][number] => ({ id, inputs, outputs, time, mana });

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  mine_iron: {
    id: 'mine_iron',
    name: 'Железный рудник',
    nameEn: 'Iron Mine',
    cells: 2,
    kind: 'mine',
    unlockLevel: 1,
    cost: { gold: 60, materials: [{ item: 'wood', qty: 10 }] },
    fuel: { item: 'coal', qty: 1 },
    recipes: [r('mine_iron', [], [{ item: 'ore_iron', qty: 1 }], 3)],
    desc: 'Добывает железную руду. Требует 1 уголь на цикл.',
  },
  lumberjack: {
    id: 'lumberjack',
    name: 'Лесопилка',
    nameEn: 'Sawmill',
    cells: 2,
    kind: 'mine',
    unlockLevel: 1,
    cost: { gold: 50, materials: [{ item: 'wood', qty: 8 }] },
    recipes: [r('plank', [], [{ item: 'plank', qty: 1 }], 2.5)],
    desc: 'Пилит доски из древесины. Работает без топлива.',
  },
  mine_coal: {
    id: 'mine_coal',
    name: 'Угольная шахта',
    nameEn: 'Coal Mine',
    cells: 2,
    kind: 'mine',
    unlockLevel: 2,
    cost: { gold: 90, materials: [{ item: 'wood', qty: 12 }] },
    recipes: [r('mine_coal', [], [{ item: 'coal', qty: 1 }], 2.5)],
    desc: 'Добывает уголь — топливо для шахт и печей.',
  },
  forge_small: {
    id: 'forge_small',
    name: 'Малый верстак',
    nameEn: 'Small Forge',
    cells: 2,
    kind: 'craft',
    unlockLevel: 2,
    cost: { gold: 200, materials: [{ item: 'wood', qty: 15 }] },
    recipes: [
      r('blade_rough', [{ item: 'ingot_iron', qty: 2 }], [{ item: 'blade_rough', qty: 1 }], 5),
      r('hilt', [{ item: 'plank', qty: 2 }, { item: 'ingot_iron', qty: 1 }], [{ item: 'hilt', qty: 1 }], 6),
      r('leather_strap', [{ item: 'leather', qty: 2 }], [{ item: 'leather_strap', qty: 1 }], 3),
      r('pommel', [{ item: 'ingot_copper', qty: 1 }], [{ item: 'pommel', qty: 1 }], 4),
    ],
    desc: 'Куёт черновые клинки, рукояти, навершия и ремни. Рецепт выбирается вручную.',
  },
  smelter_iron: {
    id: 'smelter_iron',
    name: 'Печь железа',
    nameEn: 'Iron Smelter',
    cells: 2,
    kind: 'smelter',
    unlockLevel: 1,
    cost: { gold: 140, materials: [{ item: 'wood', qty: 20 }] },
    recipes: [r('ingot_iron', [{ item: 'ore_iron', qty: 1 }, { item: 'coal', qty: 1 }], [{ item: 'ingot_iron', qty: 1 }], 4)],
    desc: 'Плавит железную руду в слитки. Съедает 1 уголь на цикл.',
  },
  mine_copper: {
    id: 'mine_copper',
    name: 'Медный рудник',
    nameEn: 'Copper Mine',
    cells: 2,
    kind: 'mine',
    unlockLevel: 3,
    cost: { gold: 180, materials: [{ item: 'wood', qty: 16 }, { item: 'ingot_iron', qty: 2 }] },
    fuel: { item: 'coal', qty: 1 },
    recipes: [r('mine_copper', [], [{ item: 'ore_copper', qty: 1 }], 3)],
    desc: 'Добывает медную руду.',
  },
  smelter_copper: {
    id: 'smelter_copper',
    name: 'Печь меди',
    nameEn: 'Copper Smelter',
    cells: 2,
    kind: 'smelter',
    unlockLevel: 4,
    cost: { gold: 300, materials: [{ item: 'ingot_iron', qty: 4 }] },
    recipes: [r('ingot_copper', [{ item: 'ore_copper', qty: 1 }, { item: 'coal', qty: 1 }], [{ item: 'ingot_copper', qty: 1 }], 4)],
    desc: 'Плавит медную руду в слитки.',
  },
  generator_coal: {
    id: 'generator_coal',
    name: 'Угольный генератор',
    nameEn: 'Coal Generator',
    cells: 3,
    kind: 'power',
    unlockLevel: 6,
    cost: { gold: 260, materials: [{ item: 'ingot_iron', qty: 4 }] },
    recipes: [r('mana', [{ item: 'coal', qty: 4 }], [{ item: 'mana_energy', qty: 1 }], 10)],
    desc: 'Сжигает уголь и вырабатывает ману — топливо магических зданий.',
  },
  gear_bench: {
    id: 'gear_bench',
    name: 'Станок шестерён',
    nameEn: 'Gear Bench',
    cells: 2,
    kind: 'craft',
    unlockLevel: 8,
    cost: { gold: 420, materials: [{ item: 'ingot_iron', qty: 6 }, { item: 'plank', qty: 4 }] },
    recipes: [
      r('gear_small', [{ item: 'ingot_iron', qty: 1 }, { item: 'ingot_copper', qty: 1 }], [{ item: 'gear_small', qty: 1 }], 5, 1),
    ],
    desc: 'Точит шестерни. Требует 1 ману на цикл.',
  },
  forge_large: {
    id: 'forge_large',
    name: 'Большой верстак',
    nameEn: 'Large Forge',
    cells: 3,
    kind: 'craft',
    unlockLevel: 10,
    cost: { gold: 900, materials: [{ item: 'ingot_iron', qty: 10 }, { item: 'plank', qty: 6 }] },
    recipes: [
      r('blade_refined', [{ item: 'blade_rough', qty: 1 }, { item: 'hilt', qty: 1 }], [{ item: 'blade_refined', qty: 1 }], 8),
      r('gear_large', [{ item: 'gear_small', qty: 2 }], [{ item: 'gear_large', qty: 1 }], 9),
      r('spring', [{ item: 'ingot_iron', qty: 2 }], [{ item: 'spring', qty: 1 }], 6),
    ],
    desc: 'Доводит клинки, собирает крупные шестерни и пружины.',
  },
  assembler: {
    id: 'assembler',
    name: 'Сборочный стол',
    nameEn: 'Assembler',
    cells: 3,
    kind: 'craft',
    unlockLevel: 15,
    cost: { gold: 2000, materials: [{ item: 'ingot_iron', qty: 20 }, { item: 'gear_small', qty: 2 }] },
    recipes: [
      r(
        'final',
        [
          { item: 'blade_refined', qty: 1 },
          { item: 'hilt', qty: 1 },
          { item: 'pommel', qty: 1 },
        ],
        [{ item: 'ancient_sword_t1', qty: 1 }],
        15,
        2,
      ),
    ],
    desc: 'Собирает древнее оружие. Изделие зависит от текущего тира уровня.',
  },
  enchanter: {
    id: 'enchanter',
    name: 'Зачарователь',
    nameEn: 'Enchanter',
    cells: 2,
    kind: 'enchanter',
    unlockLevel: 30,
    cost: { gold: 5200, materials: [{ item: 'ingot_mithril', qty: 2 }, { item: 'rune_shard', qty: 1 }] },
    recipes: [r('enchant', [{ item: 'rune_shard', qty: 1 }], [], 25, 5)],
    desc: 'Усиливает древнее оружие рунами. Вход — готовое изделие текущего тира.',
  },
  mine_mithril: {
    id: 'mine_mithril',
    name: 'Мифриловый рудник',
    nameEn: 'Mithril Mine',
    cells: 3,
    kind: 'mine',
    unlockLevel: 40,
    cost: { gold: 6000, materials: [{ item: 'ingot_iron', qty: 20 }, { item: 'gear_small', qty: 4 }] },
    fuel: { item: 'coal', qty: 3 },
    recipes: [r('mine_mithril', [], [{ item: 'ore_mithril', qty: 1 }], 5)],
    desc: 'Добывает мифриловую руду. Нужно 3 угля на цикл.',
  },
  smelter_mithril: {
    id: 'smelter_mithril',
    name: 'Мифриловая печь',
    nameEn: 'Mithril Smelter',
    cells: 3,
    kind: 'smelter',
    unlockLevel: 40,
    cost: { gold: 7000, materials: [{ item: 'ingot_copper', qty: 20 }, { item: 'gear_small', qty: 4 }] },
    recipes: [
      r('ingot_mithril', [{ item: 'ore_mithril', qty: 1 }, { item: 'coal', qty: 2 }], [{ item: 'ingot_mithril', qty: 1 }], 6),
    ],
    desc: 'Плавит мифрил — основу поздних тиров.',
  },
  generator_magic: {
    id: 'generator_magic',
    name: 'Магический генератор',
    nameEn: 'Magic Generator',
    cells: 3,
    kind: 'power',
    unlockLevel: 50,
    cost: { gold: 15000, materials: [{ item: 'ingot_mithril', qty: 6 }, { item: 'gear_large', qty: 2 }] },
    recipes: [
      r('mana_big', [{ item: 'rune_shard', qty: 1 }, { item: 'mana_core', qty: 1 }], [{ item: 'mana_energy', qty: 5 }], 20),
    ],
    desc: 'Даёт сразу 5 маны за цикл, но требует руны и ядро маны.',
  },
  warehouse: {
    id: 'warehouse',
    name: 'Склад',
    nameEn: 'Warehouse',
    cells: 3,
    kind: 'storage',
    unlockLevel: 1,
    cost: { gold: 200, materials: [{ item: 'wood', qty: 25 }] },
    recipes: [],
    bufferBonus: 50,
    desc: '+50 к буферу входа и выхода всех зданий.',
  },
};

export const BUILDING_LIST = Object.values(BUILDINGS);

export function buildingsForLevel(level: number): BuildingDef[] {
  return BUILDING_LIST.filter((b) => b.unlockLevel <= level).sort((a, b) => a.unlockLevel - b.unlockLevel);
}

/** Стоимость постройки: золото растёт на 15 % за каждый уровень выше уровня открытия.
 *  Материалы тоже берутся из текущего уровня: древесина дорожает, а с уровня 2 её
 *  заменяют доски (их пилит лесопилка) — чтобы постройка всегда была обеспечена производством. */
export function buildingCost(defId: BuildingId, level: number): { gold: number; materials: Ingredient[] } {
  const def = BUILDINGS[defId];
  const steps = Math.max(0, level - def.unlockLevel);
  const usePlanks = level >= 2;
  return {
    gold: Math.round(def.cost.gold * Math.pow(1.15, steps)),
    materials: def.cost.materials
      ? def.cost.materials.map((m) =>
          m.item === 'wood' && usePlanks ? { item: 'plank', qty: Math.max(1, Math.ceil(m.qty / 2)) } : { ...m },
        )
      : [],
  };
}

/** Активный рецепт здания с подстановкой финального изделия текущего тира. */
export function activeRecipe(
  defId: BuildingId,
  recipeIndex: number,
  level: number,
): { inputs: Ingredient[]; outputs: Ingredient[]; time: number; mana?: number } | null {
  const def = BUILDINGS[defId];
  const rec = def.recipes[Math.min(recipeIndex, def.recipes.length - 1)];
  if (!rec) return null;
  const tierItem: ItemId = ['ancient_sword_t1', 'ancient_axe_t2', 'ancient_hammer_t3', 'ancient_spear_t4', 'ancient_artifact_t5'][
    Math.min(4, Math.max(0, Math.ceil(level / 20) - 1))
  ];
  if (defId === 'assembler') {
    return {
      inputs: rec.inputs.map((i) => ({ ...i })),
      outputs: [{ item: tierItem, qty: 1 }],
      time: rec.time,
      mana: rec.mana,
    };
  }
  if (defId === 'enchanter') {
    return {
      inputs: [{ item: tierItem, qty: 1 }, ...rec.inputs.map((i) => ({ ...i }))],
      outputs: [{ item: `${tierItem}_enchanted`, qty: 1 }],
      time: rec.time,
      mana: rec.mana,
    };
  }
  return {
    inputs: rec.inputs.map((i) => ({ ...i })),
    outputs: rec.outputs.map((i) => ({ ...i })),
    time: rec.time,
    mana: rec.mana,
  };
}

export function levelAvailableBuildings(levelDef: LevelDef): BuildingDef[] {
  return levelDef.availableBuildings.map((id) => BUILDINGS[id]).filter(Boolean);
}

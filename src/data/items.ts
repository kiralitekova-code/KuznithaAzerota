import type { ItemDef, ItemId } from '../types';

const def = (
  id: ItemId,
  name: string,
  nameEn: string,
  category: ItemDef['category'],
  sell: number,
  iconId?: ItemId,
  desc?: string,
): ItemDef => ({ id, name, nameEn, category, sell, iconId, desc });

export const ITEMS: Record<ItemId, ItemDef> = Object.fromEntries(
  [
    // ---- сырьё
    def('ore_iron', 'Железная руда', 'Iron Ore', 'raw', 2),
    def('ore_copper', 'Медная руда', 'Copper Ore', 'raw', 3),
    def('ore_mithril', 'Мифриловая руда', 'Mithril Ore', 'raw', 12),
    def('ore_darkiron', 'Тёмное железо', 'Dark Iron Ore', 'raw', 20),
    def('coal', 'Уголь', 'Coal', 'raw', 2),
    def('wood', 'Древесина', 'Wood', 'raw', 1),
    def('leather', 'Кожа', 'Leather', 'raw', 4),
    // ---- промежуточные
    def('ingot_iron', 'Железный слиток', 'Iron Ingot', 'intermediate', 6),
    def('ingot_copper', 'Медный слиток', 'Copper Ingot', 'intermediate', 8),
    def('ingot_mithril', 'Мифриловый слиток', 'Mithril Ingot', 'intermediate', 30),
    def('ingot_darkiron', 'Слиток тёмного железа', 'Dark Iron Ingot', 'intermediate', 45),
    def('plank', 'Доски', 'Plank', 'intermediate', 3),
    def('leather_strap', 'Кожаный ремень', 'Leather Strap', 'intermediate', 8),
    def('rope', 'Канат', 'Rope', 'intermediate', 10),
    def('gear_small', 'Малая шестерня', 'Small Gear', 'intermediate', 16),
    def('gear_large', 'Большая шестерня', 'Large Gear', 'intermediate', 40),
    def('spring', 'Пружина', 'Spring', 'intermediate', 20),
    def('blade_rough', 'Черновой клинок', 'Rough Blade', 'intermediate', 28),
    def('blade_refined', 'Обработанный клинок', 'Refined Blade', 'intermediate', 70),
    def('hilt', 'Рукоять', 'Hilt', 'intermediate', 22),
    def('pommel', 'Навершие', 'Pommel', 'intermediate', 18),
    def('gem_socket', 'Оправa для камня', 'Gem Socket', 'intermediate', 60),
    def('rune_shard', 'Осколок руны', 'Rune Shard', 'intermediate', 120),
    def('mana_core', 'Ядро маны', 'Mana Core', 'intermediate', 250),
    // ---- энергия
    def('mana_energy', 'Мана', 'Mana', 'energy', 12),
    // ---- финальные изделия
    def('ancient_sword_t1', 'Древний меч', 'Ancient Sword', 'final', 100, undefined, 'Тир I · уровни 1–20'),
    def('ancient_axe_t2', 'Древний топор', 'Ancient Axe', 'final', 150, undefined, 'Тир II · уровни 21–40'),
    def('ancient_hammer_t3', 'Древний молот', 'Ancient Hammer', 'final', 225, undefined, 'Тир III · уровни 41–60'),
    def('ancient_spear_t4', 'Древнее копьё', 'Ancient Spear', 'final', 337, undefined, 'Тир IV · уровни 61–80'),
    def('ancient_artifact_t5', 'Древний артефакт', 'Ancient Artifact', 'final', 506, undefined, 'Тир V · уровни 81–100'),
    // ---- зачарованные версии
    def('ancient_sword_t1_enchanted', 'Зачарованный древний меч', 'Enchanted Ancient Sword', 'final', 250, 'ancient_sword_t1'),
    def('ancient_axe_t2_enchanted', 'Зачарованный древний топор', 'Enchanted Ancient Axe', 'final', 375, 'ancient_axe_t2'),
    def('ancient_hammer_t3_enchanted', 'Зачарованный древний молот', 'Enchanted Ancient Hammer', 'final', 562, 'ancient_hammer_t3'),
    def('ancient_spear_t4_enchanted', 'Зачарованное древнее копьё', 'Enchanted Ancient Spear', 'final', 843, 'ancient_spear_t4'),
    def('ancient_artifact_t5_enchanted', 'Зачарованный древний артефакт', 'Enchanted Ancient Artifact', 'final', 1265, 'ancient_artifact_t5'),
  ].map((it) => [it.id, it]),
);

export const ITEM_LIST = Object.values(ITEMS);

export const FINAL_ITEMS = ITEM_LIST.filter((i) => i.category === 'final' && !i.id.includes('enchanted'));

/** Финальное изделие, соответствующее уровню игры (тир 1..5). */
export function finalItemForLevel(level: number): ItemId {
  const tier = Math.min(5, Math.max(1, Math.ceil(level / 20)));
  return FINAL_ITEMS[tier - 1].id;
}

export function enchantedItemFor(itemId: ItemId): ItemId {
  return `${itemId}_enchanted`;
}

export const itemName = (id: ItemId) => ITEMS[id]?.name ?? id;
export const itemSell = (id: ItemId) => ITEMS[id]?.sell ?? 0;
export const itemIcon = (id: ItemId) => ITEMS[id]?.iconId ?? id;

/** Ресурсы, которые видны в верхней панели (в фиксированном порядке). */
export const RESOURCE_BAR: ItemId[] = [
  'coal',
  'wood',
  'ore_iron',
  'ore_copper',
  'ingot_iron',
  'ingot_copper',
  'blade_rough',
  'blade_refined',
  'gear_small',
  'mana_energy',
];

import type { UpgradeDef, UpgradeKind } from '../types';

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'production',
    name: 'Ускорение производства',
    desc: '+10 % к скорости всех производственных зданий',
    icon: 'gear',
    perStack: 0.1,
    maxStacks: 20,
  },
  {
    id: 'smelting',
    name: 'Ускорение плавки',
    desc: '+15 % к скорости печей',
    icon: 'bolt',
    perStack: 0.15,
    maxStacks: 15,
  },
  {
    id: 'mining',
    name: 'Ускорение шахт',
    desc: '+15 % к скорости добычи',
    icon: 'hammer',
    perStack: 0.15,
    maxStacks: 15,
  },
  {
    id: 'building',
    name: 'Ускорение стройки',
    desc: '−20 % к стоимости постройки зданий',
    icon: 'speed',
    perStack: 0.2,
    maxStacks: 5,
  },
  {
    id: 'quest',
    name: 'Меньше ресурсов в заданиях',
    desc: '−5 % к требуемому количеству в заданиях (не более 50 %)',
    icon: 'scroll',
    perStack: 0.05,
    maxStacks: 10,
  },
];

export const UPGRADES_BY_ID: Record<UpgradeKind, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
) as Record<UpgradeKind, UpgradeDef>;

/** Множитель скорости для типа здания. */
export function speedMultiplier(
  upgrades: Partial<Record<UpgradeKind, number>>,
  kind: 'mine' | 'smelter' | 'craft' | 'power' | 'enchanter' | 'storage',
): number {
  let m = 1;
  m *= 1 + (upgrades.production ?? 0) * 0.1;
  if (kind === 'smelter' || kind === 'power') m *= 1 + (upgrades.smelting ?? 0) * 0.15;
  if (kind === 'mine') m *= 1 + (upgrades.mining ?? 0) * 0.15;
  return m;
}

export function buildCostMultiplier(upgrades: Partial<Record<UpgradeKind, number>>): number {
  return Math.max(0.2, 1 - (upgrades.building ?? 0) * 0.2);
}

export function questAmountMultiplier(upgrades: Partial<Record<UpgradeKind, number>>): number {
  return Math.max(0.5, 1 - (upgrades.quest ?? 0) * 0.05);
}

/** Три случайные карточки улучшений из пула (без повторов). */
export function rollUpgradeChoices(count = 3, seed = Math.random()): UpgradeDef[] {
  const pool = [...UPGRADES];
  const out: UpgradeDef[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  while (out.length < count && pool.length > 0) {
    const i = Math.floor(rnd() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

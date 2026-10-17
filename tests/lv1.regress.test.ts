import { describe, expect, it } from 'vitest';
import { Engine } from '../src/core/engine';
import { getLevel } from '../src/data/levels';

const run = (e: Engine, seconds: number) => {
  const steps = Math.round(seconds / 0.05);
  for (let i = 0; i < steps; i++) e.tick(0.05);
};

describe('Регрессия: уровень 1 производит железные слитки', () => {
  it('цепочка рудник+печь на реальном уровне 1 выдаёт ingot_iron и засчитывает квест', () => {
    const e = new Engine(getLevel(1));
    // ставим шахту угля, рудник и печь (координаты — свободные клетки)
    expect(e.placeBuilding('mine_coal', 2, 2)).toBe(true);
    expect(e.placeBuilding('mine_iron', 6, 2)).toBe(true);
    expect(e.placeBuilding('smelter_iron', 10, 2)).toBe(true);
    run(e, 120);
    expect(e.resources.ingot_iron ?? 0).toBeGreaterThan(0);
    const q = e.quests[0];
    expect(q.progress).toBeGreaterThan(0);
  });

  it('загрузка сохранения с недостроенным зданием не даёт «вечную стройку»', () => {
    const e = new Engine(getLevel(1));
    e.placeBuilding('mine_iron', 3, 3);
    const save = e.save();
    (save.buildings[0] as any).buildProgress = 0.4; // имитируем сейв посреди стройки
    const e2 = Engine.fromSave(save);
    expect(e2.buildings[0].buildProgress).toBe(1);
    run(e2, 60);
    expect(e2.resources.ore_iron ?? 0).toBeGreaterThan(0);
  });
});

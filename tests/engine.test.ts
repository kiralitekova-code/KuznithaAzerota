import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../src/core/engine';
import { activeRecipe, buildingCost, BUILDINGS } from '../src/data/buildings';
import { speedMultiplier, questAmountMultiplier } from '../src/data/upgrades';
import { LEVELS, getLevel } from '../src/data/levels';
import { bus } from '../src/core/EventBus';
import type { LevelDef } from '../src/types';

function makeLevel(overrides: Partial<LevelDef> = {}): LevelDef {
  return {
    id: 1,
    name: 'Тест',
    mapSize: [12, 10],
    startingResources: { coal: 200, wood: 200, leather: 50 },
    startingGold: 5000,
    availableBuildings: [
      'mine_iron',
      'mine_coal',
      'lumberjack',
      'smelter_iron',
      'forge_small',
      'warehouse',
      'conveyor',
    ],
    quests: [{ id: 'q1', type: 'produce', item: 'ore_iron', amount: 3, reward: { gold: 100 } }],
    parTime: 60,
    ...overrides,
  };
}

const run = (e: Engine, seconds: number) => {
  const steps = Math.round(seconds / 0.05);
  for (let i = 0; i < steps; i++) e.tick(0.05);
};

describe('Engine: постройка', () => {
  let e: Engine;
  beforeEach(() => {
    e = new Engine(makeLevel());
  });

  it('списывает золото и занимает клетки', () => {
    const before = e.gold;
    const cost = e.costOf('mine_iron');
    expect(e.placeBuilding('mine_iron', 1, 1)).toBe(true);
    expect(e.gold).toBe(before - cost.gold);
    expect(e.buildings).toHaveLength(1);
    expect(e.buildingAt(1, 1)?.defId).toBe('mine_iron');
    expect(e.buildingAt(2, 2)?.defId).toBe('mine_iron');
    expect(e.buildingAt(3, 3)).toBeNull();
  });

  it('не даёт построить на занятое место и вне карты', () => {
    e.placeBuilding('mine_iron', 1, 1);
    expect(e.placeBuilding('mine_iron', 2, 2)).toBe(false);
    expect(e.placeBuilding('mine_iron', 11, 9)).toBe(false);
  });

  it('не даёт строить здание, не открытое на уровне', () => {
    expect(e.placeBuilding('assembler', 0, 0)).toBe(false);
  });

  it('возвращает половину стоимости при сносе', () => {
    e.placeBuilding('mine_iron', 1, 1);
    const goldBefore = e.gold;
    const id = e.buildings[0].id;
    expect(e.removeBuilding(id)).toBe(true);
    expect(e.gold).toBeGreaterThan(goldBefore);
    expect(e.buildings).toHaveLength(0);
  });

  it('стоимость растёт на 15% за уровень выше уровня открытия', () => {
    expect(buildingCost('mine_iron', 1).gold).toBe(60);
    expect(buildingCost('mine_iron', 5).gold).toBe(Math.round(60 * 1.15 ** 4));
  });
});

describe('Engine: производство', () => {
  it('шахта добывает руду и тратит уголь', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1);
    const coalBefore = e.resources.coal;
    run(e, 3.0);
    expect(e.buildings[0].outputs.ore_iron).toBe(1);
    expect(e.resources.coal).toBe(coalBefore - 1);
  });

  it('без угля шахта не работает', () => {
    const e = new Engine(makeLevel({ startingResources: { wood: 200 } }));
    e.placeBuilding('mine_iron', 1, 1);
    run(e, 6);
    expect(e.buildings[0].outputs.ore_iron ?? 0).toBe(0);
  });

  it('печь плавит руду в слиток', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('smelter_iron', 1, 1);
    const b = e.buildings[0];
    b.inputs.ore_iron = 2;
    b.inputs.coal = 2;
    run(e, 4.0);
    expect(b.outputs.ingot_iron).toBe(1);
    expect(b.inputs.ore_iron).toBe(1);
  });

  it('верстак выбирает рецепт по наличию входов', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('forge_small', 1, 1);
    const b = e.buildings[0];
    b.inputs.ingot_iron = 4;
    run(e, 5.0);
    expect(b.outputs.blade_rough).toBe(1);
  });

  it('улучшения ускоряют добычу', () => {
    const e = new Engine(makeLevel(), { mining: 2 });
    e.placeBuilding('mine_iron', 1, 1);
    run(e, 2.7);
    expect(e.buildings[0].outputs.ore_iron).toBe(1);
    expect(speedMultiplier({ mining: 2 }, 'mine')).toBeCloseTo(1.3);
  });
});

describe('Engine: конвейеры и склад', () => {
  it('предмет едет по конвейеру и попадает в запас через склад', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1); // занимает клетки 1..2
    e.placeBelt(3, 1, 'e');
    e.placeBelt(4, 1, 'e');
    e.placeBuilding('warehouse', 5, 1);
    run(e, 14);
    expect(e.resources.ore_iron ?? 0).toBeGreaterThanOrEqual(1);
  });

  it('конвейер не принимает больше 4 предметов на тайл', () => {
    const e = new Engine(makeLevel());
    e.placeBelt(1, 1, 'e');
    const tile = e.beltAt(1, 1)!;
    for (let i = 0; i < 4; i++) tile.items.push({ item: 'coal', progress: 0 });
    run(e, 6);
    expect(tile.items.length).toBeLessThanOrEqual(4);
  });

  it('направление конвейера меняется на месте без списания золота', () => {
    const e = new Engine(makeLevel());
    e.placeBelt(2, 2, 'e');
    const gold = e.gold;
    e.placeBelt(2, 2, 's');
    expect(e.beltAt(2, 2)!.dir).toBe('s');
    expect(e.gold).toBe(gold);
  });
});

describe('Engine: задания и прогресс', () => {
  it('задание засчитывает произведённое и выдаёт золото', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1);
    const gold = e.gold;
    run(e, 9.0);
    expect(e.quests[0].done).toBe(true);
    expect(e.gold).toBe(gold + 100);
    expect(e.completed).toBe(true);
  });

  it('событие level-complete отправляется один раз', () => {
    let count = 0;
    const off = bus.on('level-complete', () => {
      count++;
    });
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1);
    run(e, 20);
    off();
    expect(count).toBe(1);
  });

  it('уменьшение требований заданий применяется к количеству', () => {
    const e = new Engine(makeLevel(), { quest: 4 });
    expect(e.quests[0].amount).toBe(Math.max(1, Math.round(3 * questAmountMultiplier({ quest: 4 }))));
    expect(questAmountMultiplier({ quest: 20 })).toBe(0.5);
  });

  it('нельзя перевыполнить задание', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1);
    run(e, 30);
    expect(e.quests[0].progress).toBeLessThanOrEqual(e.quests[0].amount);
  });
});

describe('Engine: сохранение', () => {
  it('сериализация и загрузка сохраняют состояние', () => {
    const e = new Engine(makeLevel());
    e.placeBuilding('mine_iron', 1, 1);
    e.placeBelt(4, 4, 'n');
    run(e, 4);
    const data = e.serialize();
    const restored = Engine.fromSave(data);
    expect(restored.buildings).toHaveLength(1);
    expect(restored.belts.size).toBe(1);
    expect(restored.gold).toBe(e.gold);
    expect(restored.quests[0].progress).toBe(e.quests[0].progress);
    expect(restored.resources.coal).toBe(e.resources.coal);
  });
});

describe('Данные уровней', () => {
  it('100 уровней, у каждого есть задания и доступные здания', () => {
    expect(LEVELS).toHaveLength(100);
    for (const l of LEVELS) {
      expect(l.quests.length).toBeGreaterThan(0);
      expect(l.availableBuildings.length).toBeGreaterThan(0);
      expect(l.mapSize[0]).toBeGreaterThan(10);
    }
  });

  it('финальное изделие зависит от тира уровня', () => {
    expect(activeRecipe('assembler', 0, 5)?.outputs[0].item).toBe('ancient_sword_t1');
    expect(activeRecipe('assembler', 0, 25)?.outputs[0].item).toBe('ancient_axe_t2');
    expect(activeRecipe('assembler', 0, 45)?.outputs[0].item).toBe('ancient_hammer_t3');
    expect(activeRecipe('assembler', 0, 65)?.outputs[0].item).toBe('ancient_spear_t4');
    expect(activeRecipe('assembler', 0, 99)?.outputs[0].item).toBe('ancient_artifact_t5');
  });

  it('зачарователь выдаёт зачарованную версию текущего тира', () => {
    expect(activeRecipe('enchanter', 0, 55)?.outputs[0].item).toBe('ancient_hammer_t3_enchanted');
  });

  it('запрос несуществующего уровня возвращает крайние', () => {
    expect(getLevel(999).id).toBe(100);
    expect(getLevel(-5).id).toBe(1);
  });

  it('в данных 16 зданий с корректными размерами', () => {
    expect(Object.keys(BUILDINGS)).toHaveLength(16);
    for (const b of Object.values(BUILDINGS)) {
      expect([2, 3]).toContain(b.cells);
      expect(b.cost.gold).toBeGreaterThan(0);
    }
  });
});

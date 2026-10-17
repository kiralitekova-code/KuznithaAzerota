import { describe, expect, it } from 'vitest';
import { Engine } from '../src/core/engine';
import { getLevel } from '../src/data/levels';

describe('debug', () => {
  it('save load', () => {
    const e = new Engine(getLevel(1));
    console.log('placed', e.placeBuilding('mine_iron', 3, 3), 'count', e.buildings.length);
    const save = e.serialize();
    console.log('save buildings len', save.buildings.length, JSON.stringify(save.buildings[0]));
    (save.buildings[0] as any).buildProgress = 0.4;
    const e2 = Engine.fromSave(save);
    console.log('e2 count', e2.buildings.length, 'bp', e2.buildings[0]?.buildProgress);
    for (let i = 0; i < 600; i++) e2.tick(0.05);
    console.log('res', JSON.stringify(e2.resources));
    expect(true).toBe(true);
  });
});

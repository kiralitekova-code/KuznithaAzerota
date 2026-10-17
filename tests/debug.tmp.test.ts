import { it } from 'vitest';
import { Engine } from '../src/core/engine';
import { getLevel } from '../src/data/levels';

const run = (e: Engine, seconds: number) => { for (let i = 0; i < Math.round(seconds/0.05); i++) e.tick(0.05); };

it('dbg2', () => {
  const e = new Engine(getLevel(1));
  console.log('place mine_coal:', e.placeBuilding('mine_coal', 2, 2));
  console.log('place mine_iron:', e.placeBuilding('mine_iron', 6, 2));
  console.log('place smelter:', e.placeBuilding('smelter_iron', 10, 2));
  for (const b of e.buildings) console.log(b.defId, 'prog=', b.buildProgress, 'in=', JSON.stringify(b.inputs), 'out=', JSON.stringify(b.outputs));
  run(e, 30);
  for (const b of e.buildings) console.log('after30', b.defId, 'bp=', b.buildProgress, 'working=', b.working, 'in=', JSON.stringify(b.inputs), 'out=', JSON.stringify(b.outputs));
  console.log('res after 30s:', JSON.stringify(e.resources));
  run(e, 90);
  console.log('res after 120s:', JSON.stringify(e.resources));
});

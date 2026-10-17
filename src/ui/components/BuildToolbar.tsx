import { useGame } from '../../store/gameStore';
import { BUILDING_LIST, BELT } from '../../data/buildings';
import { ITEMS } from '../../data/items';
import { BuildingIcon, Icon, ItemIcon } from '../Icon';
import { fmt } from '../../utils/format';
import type { BuildingId } from '../../types';

export function BuildToolbar() {
  const snap = useGame((s) => s.snap);
  const engine = useGame((s) => s.engine);
  const selected = useGame((s) => s.selectedBuilding);
  const beltDir = useGame((s) => s.beltDir);
  const demolish = useGame((s) => s.demolish);
  const selectBuilding = useGame((s) => s.selectBuilding);
  const rotateBelt = useGame((s) => s.rotateBelt);
  const toggleDemolish = useGame((s) => s.toggleDemolish);

  if (!snap || !engine) return null;
  const level = engine.level;

  const dirLabel: Record<string, string> = { n: '↑', e: '→', s: '↓', w: '←' };

  const items: { id: BuildingId; locked: boolean; unlock: number }[] = BUILDING_LIST.map((b) => ({
    id: b.id,
    locked: !level.availableBuildings.includes(b.id),
    unlock: b.unlockLevel,
  }));

  return (
    <div className="panel absolute bottom-20 left-2 top-16 z-20 flex w-[150px] flex-col overflow-hidden p-1.5 md:w-[178px]">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-widest text-forge-steel/50">Постройки</span>
        <span className="text-[10px] text-forge-steel/40">
          {snap.buildingsCount}/200
        </span>
      </div>

      <div className="scroll-thin flex-1 space-y-1 overflow-y-auto pr-0.5">
        {items.map(({ id, locked, unlock }) => {
          const def = BUILDING_LIST.find((b) => b.id === id)!;
          const cost = engine.costOf(id);
          const affordable = engine.canAfford(cost.gold, cost.materials);
          const isSel = selected === id;
          return (
            <button
              key={id}
              disabled={locked}
              onClick={() => selectBuilding(isSel ? null : id)}
              title={locked ? `Откроется на уровне ${unlock}` : def.desc}
              className={`relative flex w-full items-center gap-2 rounded-lg border p-1.5 text-left transition ${
                isSel
                  ? 'border-forge-ember bg-forge-ember/15'
                  : locked
                    ? 'cursor-not-allowed border-forge-iron/30 bg-black/30 opacity-45'
                    : 'border-forge-iron/40 bg-forge-stone/60 hover:border-forge-ember/60 hover:bg-forge-stone'
              }`}
            >
              <BuildingIcon defId={id} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium leading-tight text-forge-steel">{def.name}</div>
                {locked ? (
                  <div className="flex items-center gap-1 text-[10px] text-forge-steel/60">
                    <Icon name="lock" size={10} /> ур. {unlock}
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 text-[10px] ${affordable ? 'text-forge-gold' : 'text-red-400'}`}>
                    <Icon name="gold" size={10} /> {fmt(cost.gold)}
                    {cost.materials.map((m) => (
                      <span key={m.item} className="flex items-center gap-0.5 text-forge-steel/60" title={ITEMS[m.item]?.name}>
                        <ItemIcon id={m.item} size={10} />
                        {m.qty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 space-y-1 border-t border-forge-iron/40 pt-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => selectBuilding(selected === 'conveyor' ? null : 'conveyor')}
            className={`flex flex-1 items-center gap-1 rounded-lg border p-1.5 text-left transition ${
              selected === 'conveyor'
                ? 'border-forge-ember bg-forge-ember/15'
                : 'border-forge-iron/40 bg-forge-stone/60 hover:border-forge-ember/60'
            }`}
            title={`Конвейер: ${BELT.speed} кл/сек`}
          >
            <BuildingIcon defId="conveyor" size={30} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] leading-tight">Конвейер</div>
              <div className="flex items-center gap-1 text-[10px] text-forge-gold">
                <Icon name="gold" size={10} /> {engine.beltCost()}
              </div>
            </div>
          </button>
          <button
            onClick={rotateBelt}
            className="w-9 rounded-lg border border-forge-iron/40 bg-forge-stone/60 text-lg hover:border-forge-ember/60"
            title="Повернуть конвейер (R)"
          >
            {dirLabel[beltDir]}
          </button>
        </div>
        <button
          onClick={toggleDemolish}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border p-1.5 text-[11px] transition ${
            demolish ? 'border-red-500 bg-red-950/70 text-red-200' : 'border-forge-iron/40 bg-forge-stone/60 hover:border-red-500/60'
          }`}
        >
          <Icon name="trash" size={14} /> Снос (X)
        </button>
      </div>
    </div>
  );
}

import { useGame } from '../../store/gameStore';
import { BUILDINGS, activeRecipe } from '../../data/buildings';
import { ITEMS } from '../../data/items';
import { Icon, ItemIcon } from '../Icon';

export function BuildingInfo() {
  const selectedInstance = useGame((s) => s.selectedInstance);
  const engine = useGame((s) => s.engine);
  const chooseRecipe = useGame((s) => s.chooseRecipe);
  const removeInstance = useGame((s) => s.removeInstance);
  const selectInstance = useGame((s) => s.selectInstance);
  const snap = useGame((s) => s.snap);

  if (!engine || !selectedInstance) return null;
  const b = engine.buildings.find((x) => x.id === selectedInstance);
  if (!b) return null;
  const def = BUILDINGS[b.defId];
  if (!def) return null;
  const rec = activeRecipe(b.defId, b.recipeIndex, engine.level.id);

  return (
    <div className="panel absolute bottom-20 left-1/2 z-30 w-[min(94vw,420px)] -translate-x-1/2 p-3">
      <div className="mb-2 flex items-start gap-2">
        <div className="flex-1">
          <div className="text-sm font-semibold text-forge-gold">{def.name}</div>
          <div className="text-[11px] text-forge-steel/50">
            {def.cells}×{def.cells} · {b.working ? 'работает' : 'ожидает'}
          </div>
        </div>
        <button className="btn-ghost h-7 w-7 !px-0" onClick={() => selectInstance(null)}>
          ✕
        </button>
      </div>

      {def.recipes.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {def.recipes.map((r, i) => (
            <button
              key={r.id}
              onClick={() => chooseRecipe(b.id, i)}
              className={`rounded-md border px-2 py-1 text-[10px] transition ${
                i === b.recipeIndex
                  ? 'border-forge-ember bg-forge-ember/20 text-forge-gold'
                  : 'border-forge-iron/40 bg-forge-stone/60 text-forge-steel/70 hover:border-forge-ember/50'
              }`}
            >
              {ITEMS[activeRecipe(b.defId, i, engine.level.id)?.outputs[0]?.item ?? '']?.name ?? r.id}
            </button>
          ))}
        </div>
      )}

      {rec && (
        <div className="panel-soft mb-2 flex items-center gap-2 p-2 text-[11px]">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {rec.inputs.map((i) => (
              <span key={i.item} className="flex items-center gap-0.5 rounded bg-black/40 px-1 py-0.5" title={ITEMS[i.item]?.name}>
                <ItemIcon id={i.item} size={14} /> {i.qty}
                <span className="text-forge-steel/40">({b.inputs[i.item] ?? 0})</span>
              </span>
            ))}
          </div>
          <Icon name="arrow" size={14} />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {rec.outputs.map((o) => (
              <span key={o.item} className="flex items-center gap-0.5 rounded bg-black/40 px-1 py-0.5" title={ITEMS[o.item]?.name}>
                <ItemIcon id={o.item} size={14} /> {o.qty}
                <span className="text-forge-steel/40">({b.outputs[o.item] ?? 0})</span>
              </span>
            ))}
          </div>
          <span className="shrink-0 text-forge-steel/50">{rec.time} с</span>
        </div>
      )}

      <div className="bar mb-2">
        <span style={{ width: `${rec ? Math.min(100, (b.progress / rec.time) * 100) : 0}%` }} />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[10px] text-forge-steel/40">
          буфер: {engine.inputCap} вх · {engine.outputCap} вых
        </div>
        <button className="btn-danger ml-auto !px-2 !py-1 text-xs" onClick={() => removeInstance(b.id)}>
          <Icon name="trash" size={14} /> Снести
        </button>
      </div>
    </div>
  );
}

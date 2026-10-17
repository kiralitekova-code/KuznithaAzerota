import { useGame } from '../../store/gameStore';
import { ITEMS } from '../../data/items';
import { Icon, ItemIcon } from '../Icon';
import { fmt } from '../../utils/format';

export function QuestPanel() {
  const snap = useGame((s) => s.snap);
  if (!snap) return null;

  return (
    <div className="panel absolute bottom-20 right-2 top-16 z-20 flex w-[240px] flex-col p-2 lg:w-[292px]">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon name="scroll" size={16} />
        <span className="text-[10px] uppercase tracking-widest text-forge-steel/50">Задания</span>
        <span className="ml-auto text-[10px] text-forge-steel/40">~{Math.round(snap.parTime / 60)} мин</span>
      </div>

      <div className="scroll-thin flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {snap.quests.map((q) => {
          const pct = Math.min(100, (q.progress / q.amount) * 100);
          return (
            <div
              key={q.id}
              className={`rounded-lg border p-2 transition ${
                q.done ? 'border-emerald-700/50 bg-emerald-950/30' : 'border-forge-iron/40 bg-forge-stone/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ItemIcon id={q.item} size={22} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] leading-tight text-forge-steel">
                    {ITEMS[q.item]?.name ?? q.item}
                  </div>
                  {q.desc && (
                    <div className="mt-0.5 text-[10px] leading-snug text-forge-steel/55">{q.desc}</div>
                  )}
                  <div className="text-[10px] text-forge-steel/50">
                    {fmt(Math.min(q.progress, q.amount))} / {fmt(q.amount)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="flex items-center gap-0.5 text-[11px] text-forge-gold">
                    <Icon name="gold" size={12} /> {q.reward}
                  </span>
                  {q.done && <Icon name="check" size={14} />}
                </div>
              </div>
              <div className="bar mt-1.5">
                <span style={{ width: `${pct}%`, background: q.done ? 'linear-gradient(90deg,#2fb36d,#7ef2b0)' : undefined }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 rounded-lg border border-forge-iron/30 bg-black/30 p-2 text-[10px] leading-snug text-forge-steel/50">
        Стройте цепочку: <span className="text-forge-gold">шахта → конвейер → печь → склад</span>. Всё, что доехало до
        склада, попадает в запас и его можно продать.
      </div>
    </div>
  );
}

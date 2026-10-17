import { useGame } from '../../store/gameStore';
import { RESOURCE_BAR, ITEMS } from '../../data/items';
import { Icon, ItemIcon } from '../Icon';
import { fmt, fmtTime } from '../../utils/format';

export function ResourceBar() {
  const snap = useGame((s) => s.snap);
  const boostUntil = useGame((s) => s.boostUntil);
  const goMenu = useGame((s) => s.goMenu);
  const openAdChoices = useGame((s) => s.openAdChoices);
  const setShowSettings = useGame((s) => s.setShowSettings);

  if (!snap) return null;
  const boostLeft = Math.max(0, Math.ceil((boostUntil - Date.now()) / 1000));
  const doneQuests = snap.quests.filter((q) => q.done).length;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-2">
      <div className="panel pointer-events-auto flex items-center gap-2 px-2 py-1.5">
        <button
          className="btn-ghost h-9 w-9 shrink-0 !px-0"
          title="В меню"
          onClick={goMenu}
        >
          <span className="inline-block -scale-x-100">
            <Icon name="arrow" size={16} />
          </span>
        </button>

        <div className="hidden shrink-0 flex-col leading-tight sm:flex">
          <span className="text-[10px] uppercase tracking-widest text-forge-steel/50">Уровень {snap.levelId}</span>
          <span className="max-w-[130px] truncate text-xs font-semibold text-forge-gold">{snap.levelName}</span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-thin">
          {RESOURCE_BAR.map((id) => {
            const qty = snap.resources[id] ?? 0;
            return (
              <div
                key={id}
                title={`${ITEMS[id]?.name ?? id}: ${qty}`}
                className={`chip shrink-0 !px-2 !py-1 ${qty === 0 ? 'opacity-40' : ''}`}
              >
                <ItemIcon id={id} size={18} />
                <span className="tabular-nums">{fmt(qty)}</span>
              </div>
            );
          })}
        </div>

        <div className="chip shrink-0 border-forge-gold/40 bg-forge-gold/10 !px-2.5 !py-1 text-forge-gold">
          <Icon name="gold" size={18} />
          <span className="tabular-nums font-semibold">{fmt(snap.gold)}</span>
        </div>

        {boostLeft > 0 && (
          <div className="chip hidden shrink-0 border-sky-500/40 bg-sky-500/10 !px-2 !py-1 text-sky-200 sm:flex">
            <Icon name="speed" size={16} /> ×2 · {fmtTime(boostLeft)}
          </div>
        )}

        <div className="chip hidden shrink-0 !px-2 !py-1 md:flex" title="Задания и время">
          <Icon name="scroll" size={16} />
          {doneQuests}/{snap.quests.length} · {fmtTime(snap.elapsed)}
        </div>

        <button className="btn-ghost h-9 w-9 shrink-0 !px-0" title="Реклама за награду" onClick={openAdChoices}>
          <Icon name="ad" size={18} />
        </button>
        <button className="btn-ghost h-9 w-9 shrink-0 !px-0" title="Настройки" onClick={() => setShowSettings(true)}>
          <Icon name="gear" size={18} />
        </button>
      </div>
    </div>
  );
}

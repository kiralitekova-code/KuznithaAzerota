import { useGame } from '../../store/gameStore';
import { Icon } from '../Icon';

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-50 flex w-[min(92vw,460px)] -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-cardin flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-xl backdrop-blur ${
            t.kind === 'success'
              ? 'border-emerald-600/60 bg-emerald-950/85 text-emerald-100'
              : t.kind === 'error'
                ? 'border-red-800/70 bg-red-950/85 text-red-100'
                : 'border-forge-iron/60 bg-forge-coal/90 text-forge-steel'
          }`}
        >
          <Icon name={t.kind === 'error' ? 'lock' : t.kind === 'success' ? 'check' : 'scroll'} size={16} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

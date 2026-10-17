import { useState } from 'react';
import { useGame } from '../../store/gameStore';
import { Icon } from '../Icon';
import { fmtTime } from '../../utils/format';
import { assetUrl } from '../../render/assets';

export function UpgradeScreen() {
  const choices = useGame((s) => s.choices);
  const player = useGame((s) => s.player);
  const snap = useGame((s) => s.snap);
  const pickUpgrade = useGame((s) => s.pickUpgrade);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-4">
      <img src={assetUrl('ui/menu_bg.png')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-forge-ink/80" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-6 text-center">
          <div className="mb-1 text-xs uppercase tracking-[0.3em] text-forge-steel/50">Уровень пройден</div>
          <h2 className="title text-3xl text-forge-gold glow-gold sm:text-4xl">Выберите улучшение</h2>
          {snap && (
            <p className="mt-2 text-sm text-forge-steel/60">
              Время: {fmtTime(snap.elapsed)} · заданий: {snap.quests.filter((q) => q.done).length}/{snap.quests.length}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {choices.map((c, i) => {
            const stacks = player.upgrades[c.id] ?? 0;
            const active = picked === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setPicked(c.id)}
                style={{ animationDelay: `${i * 90}ms` }}
                className={`card-lift animate-cardin panel relative flex flex-col items-center gap-2 p-5 text-center ${
                  active ? 'border-forge-ember bg-forge-ember/10' : ''
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-forge-iron/50 bg-black/40">
                  <Icon name={c.icon} size={38} />
                </div>
                <div className="text-sm font-semibold text-forge-gold">{c.name}</div>
                <p className="text-xs leading-snug text-forge-steel/70">{c.desc}</p>
                <div className="mt-auto pt-1 text-[10px] uppercase tracking-widest text-forge-steel/40">
                  сейчас ×{stacks}
                </div>
                {active && (
                  <div className="absolute right-2 top-2 text-forge-gold">
                    <Icon name="check" size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className="btn-primary min-w-[260px] py-3 text-lg"
            disabled={!picked || busy}
            onClick={async () => {
              if (!picked) return;
              setBusy(true);
              await pickUpgrade(picked as never);
            }}
          >
            {busy ? 'Загрузка…' : 'Подтвердить и продолжить'} <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

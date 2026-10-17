import { useGame } from '../../store/gameStore';
import { PLACEMENT_LABELS } from '../../ads/IAdProvider';
import type { AdPlacement } from '../../ads/IAdProvider';
import { adsAreMock } from '../../ads';
import { Icon } from '../Icon';

const CHOICES: { id: AdPlacement; hint: string }[] = [
  { id: 'x2_gold', hint: 'Следующее задание принесёт вдвое больше золота' },
  { id: 'x2_speed', hint: 'Все здания работают вдвое быстрее 5 минут' },
  { id: 'instant_gold', hint: 'Сразу +200 золота на постройки' },
];

export function AdRewardModal() {
  const open = useGame((s) => s.adChoiceOpen);
  const ad = useGame((s) => s.ad);
  const openAd = useGame((s) => s.openAd);
  const close = useGame((s) => s.closeAdChoices);

  if (!open && !ad.open) return null;

  if (ad.open) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="panel w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-forge-ember/50 bg-forge-ember/10 animate-forgepulse">
            <Icon name="ad" size={34} />
          </div>
          <h3 className="title mb-2 text-lg text-forge-gold">Реклама за награду</h3>
          <p className="mb-4 text-sm text-forge-steel/70">
            {ad.placement ? PLACEMENT_LABELS[ad.placement] : 'Загружаем ролик…'}
          </p>
          <div className="bar mb-3">
            <span className="animate-pulse" style={{ width: '70%' }} />
          </div>
          <p className="text-xs text-forge-steel/40">Награда начислится после просмотра</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={close}>
      <div className="panel w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center gap-2">
          <Icon name="ad" size={22} />
          <h3 className="title text-lg text-forge-gold">Награда за рекламу</h3>
        </div>
        <p className="mb-4 text-xs text-forge-steel/50">
          {adsAreMock() ? 'Демо-режим: ролик эмулируется 3 секунды' : 'Реклама от площадки-партнёра'}
        </p>

        <div className="space-y-2">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              className="card-lift panel-soft flex w-full items-center gap-3 p-3 text-left"
              onClick={() => openAd(c.id)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forge-ember/15">
                <Icon name={c.id === 'x2_speed' ? 'speed' : c.id === 'x2_gold' ? 'gold' : 'plus'} size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-forge-steel">{PLACEMENT_LABELS[c.id]}</div>
                <div className="text-xs text-forge-steel/50">{c.hint}</div>
              </div>
              <Icon name="play" size={16} />
            </button>
          ))}
        </div>

        <button className="btn-ghost mt-4 w-full" onClick={close}>
          Не сейчас
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useGame } from '../../store/gameStore';
import { assetUrl } from '../../render/assets';
import { UPGRADES } from '../../data/upgrades';
import { Icon } from '../Icon';
import { TOTAL_LEVELS } from '../../data/levels';

export function MainMenu() {
  const startLevel = useGame((s) => s.startLevel);
  const continueGame = useGame((s) => s.continueGame);
  const setShowSettings = useGame((s) => s.setShowSettings);
  const hasSave = useGame((s) => s.hasSave);
  const player = useGame((s) => s.player);
  const setScreen = (s: 'credits') => useGame.setState({ screen: s });
  const [showUpgrades, setShowUpgrades] = useState(false);

  const continueDisabled = !hasSave && player.unlockedLevel <= 1;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={assetUrl('ui/menu_bg.png')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: 'floaty 24s ease-in-out infinite alternate' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forge-ink via-forge-ink/70 to-transparent" />

      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${45 + i * 4}%`,
            animationDelay: `${(i % 6) * 0.6}s`,
            animationDuration: `${3.5 + (i % 4) * 0.6}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex h-full flex-col justify-center gap-8 px-6 sm:px-14 lg:px-24">
        <div className="flex items-center gap-4">
          <img src={assetUrl('ui/logo.png')} alt="" className="pixelated h-20 w-20 drop-shadow-[0_0_26px_rgba(255,122,26,.5)]" />
          <div>
            <h1 className="title text-4xl font-extrabold tracking-wide text-forge-gold glow-gold sm:text-6xl">
              КУЗНИЦА АЗЕРОТА
            </h1>
            <p className="mt-2 max-w-md text-sm text-forge-steel/80">
              Строй шахты, плавь руду, веди конвейеры — и выкуй древнее оружие. {TOTAL_LEVELS} уровней автоматизации.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <button className="btn-primary w-full py-3 text-lg" onClick={() => startLevel(1)}>
            <Icon name="play" size={22} /> Играть
          </button>
          <button className="btn-ghost w-full py-3 text-lg" disabled={continueDisabled} onClick={continueGame}>
            <Icon name="arrow" size={20} /> Продолжить
            {player.unlockedLevel > 1 && (
              <span className="ml-1 rounded bg-black/40 px-2 py-0.5 text-xs">ур. {player.unlockedLevel}</span>
            )}
          </button>
          <button className="btn-ghost w-full py-3 text-lg" onClick={() => setShowUpgrades(true)}>
            <Icon name="star" size={20} /> Улучшения
          </button>
          <div className="flex gap-3">
            <button className="btn-ghost flex-1 py-3" onClick={() => setShowSettings(true)}>
              <Icon name="gear" size={18} /> Настройки
            </button>
            <button className="btn-ghost flex-1 py-3" onClick={() => setScreen('credits')}>
              <Icon name="scroll" size={18} /> Кредиты
            </button>
          </div>
        </div>

        <div className="flex gap-3 text-xs text-forge-steel/60">
          <span className="chip">
            <Icon name="gold" size={16} /> {player.gold}
          </span>
          <span className="chip">
            <Icon name="star" size={16} /> Улучшений: {Object.values(player.upgrades).reduce((a, b) => a + (b ?? 0), 0)}
          </span>
          <span className="chip">
            <Icon name="hammer" size={16} /> Уровень {player.unlockedLevel} / {TOTAL_LEVELS}
          </span>
        </div>
      </div>

      {showUpgrades && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowUpgrades(false)}>
          <div className="panel w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="title mb-4 text-xl text-forge-gold">Улучшения кузнеца</h2>
            <div className="space-y-3">
              {UPGRADES.map((u) => {
                const stacks = player.upgrades[u.id] ?? 0;
                return (
                  <div key={u.id} className="panel-soft flex items-center gap-3 p-3">
                    <Icon name={u.icon} size={32} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-forge-steel">{u.name}</span>
                        <span className="text-xs text-forge-gold">×{stacks}</span>
                      </div>
                      <p className="text-xs text-forge-steel/60">{u.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn-ghost mt-5 w-full" onClick={() => setShowUpgrades(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

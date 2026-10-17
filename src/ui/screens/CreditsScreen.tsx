import { useGame } from '../../store/gameStore';
import { assetUrl } from '../../render/assets';

export function CreditsScreen() {
  const goMenu = useGame((s) => s.goMenu);
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-forge-ink p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,122,26,.25),transparent_60%)]" />
      <div className="panel relative z-10 w-full max-w-2xl p-8">
        <div className="mb-6 flex items-center gap-4">
          <img src={assetUrl('ui/logo.png')} alt="" className="pixelated h-16 w-16" />
          <div>
            <h1 className="title text-2xl text-forge-gold">Кузница Азерота</h1>
            <p className="text-sm text-forge-steel/60">Версия 1.0 · браузерная автоматизация</p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-forge-steel/80">
          <p>
            <span className="text-forge-gold">Идея, код, баланс:</span> команда AgentHere. Игра сделана по техническому
            заданию «Кузница Азерота» (GDD + TDD v1.0).
          </p>
          <p>
            <span className="text-forge-gold">Графика и звук:</span> все спрайты, тайлы, иконки, фон, музыка и эффекты
            сгенерированы процедурно специально для игры и распространяются как CC0 — защищённых материалов Blizzard
            нет, использованы только оригинальные названия.
          </p>
          <p>
            <span className="text-forge-gold">Технологии:</span> TypeScript, Vite, PixiJS 8, React 18, Zustand,
            TailwindCSS, Howler.js, IndexedDB.
          </p>
          <p>
            <span className="text-forge-gold">Реклама:</span> показ рекламы за награду — только по желанию игрока.
            В разработке используется эмулятор, в продакшене — Yandex.Games / CrazyGames SDK.
          </p>
        </div>

        <button className="btn-primary mt-8 w-full" onClick={goMenu}>
          В главное меню
        </button>
      </div>
    </div>
  );
}

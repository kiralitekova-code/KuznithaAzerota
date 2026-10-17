import { useEffect, useState } from 'react';
import { Assets } from 'pixi.js';
import { ALL_ASSETS, assetUrl } from '../../render/assets';
import { useGame } from '../../store/gameStore';
import { audio } from '../../audio/AudioManager';

const STEPS = ['Разжигаем горн…', 'Точим клинки…', 'Заливаем расплав…', 'Готово!'];

export function LoadingScreen() {
  const [pct, setPct] = useState(0);
  const initApp = useGame((s) => s.initApp);

  useEffect(() => {
    let alive = true;
    const start = Date.now();
    (async () => {
      try {
        await Promise.all([
          initApp(),
          Assets.init(),
          Assets.load(ALL_ASSETS, (p: number) => {
            if (alive) setPct(Math.max(1, Math.round(p * 100)));
          }),
        ]);
      } catch (e) {
        console.warn('Ошибка загрузки ассетов', e);
      }
      const wait = Math.max(300, 1500 - (Date.now() - start));
      window.setTimeout(() => {
        if (!alive) return;
        setPct(100);
        const params = new URLSearchParams(location.search);
        const play = params.get('play');
        if (play !== null) {
          useGame.getState().startLevel(Number(play) || 1);
        } else {
          useGame.setState({ screen: 'menu' });
          audio.music('bgm_menu');
        }
      }, wait);
    })();
    return () => {
      alive = false;
    };
  }, [initApp]);

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-forge-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 70%, rgba(255,122,26,.35), transparent 55%)',
        }}
      />
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${8 + i * 5}%`,
            animationDelay: `${(i % 7) * 0.45}s`,
            animationDuration: `${3 + (i % 5) * 0.4}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative h-32 w-32">
          <img
            src={assetUrl('ui/logo.png')}
            alt=""
            className="pixelated absolute inset-0 m-auto h-28 w-28 animate-floaty drop-shadow-[0_0_30px_rgba(255,122,26,.55)]"
          />
          <div className="absolute -right-2 top-2 h-10 w-3 origin-bottom animate-[cardin_1s_ease-in-out_infinite_alternate] rounded-sm bg-forge-steel shadow-[0_0_14px_rgba(255,150,60,.6)]" />
        </div>

        <h1 className="title text-3xl font-bold text-forge-gold glow-gold">КУЗНИЦА АЗЕРОТА</h1>

        <div className="w-[min(520px,80vw)]">
          <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-forge-steel/70">
            <span>{step}</span>
            <span>{pct}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full border border-forge-iron/70 bg-black/70">
            <div
              className="h-full rounded-full transition-[width] duration-200"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg,#8c3b06,#ff7a1a 45%,#ffd66b 80%,#fff3c4)',
                boxShadow: '0 0 18px rgba(255,150,60,.85)',
              }}
            />
          </div>
          <div className="mt-3 text-center text-xs text-forge-steel/50">
            Пиксель-арт и звук сгенерированы специально для игры · CC0
          </div>
        </div>
      </div>
    </div>
  );
}

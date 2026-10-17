import { useEffect, useState } from 'react';
import { useGame } from '../../store/gameStore';
import { GameCanvas } from '../components/GameCanvas';
import { ResourceBar } from '../components/ResourceBar';
import { BuildToolbar } from '../components/BuildToolbar';
import { QuestPanel } from '../components/QuestPanel';
import { BuildingInfo } from '../components/BuildingInfo';
import { MiniMap } from '../components/MiniMap';
import { ShopPanel } from '../components/ShopPanel';
import { Icon } from '../Icon';
import { fmtTime } from '../../utils/format';

export function LevelScreen() {
  const snap = useGame((s) => s.snap);
  const paused = useGame((s) => s.paused);
  const speed = useGame((s) => s.speed);
  const togglePause = useGame((s) => s.togglePause);
  const setSpeed = useGame((s) => s.setSpeed);
  const saveNow = useGame((s) => s.saveNow);
  const openAdChoices = useGame((s) => s.openAdChoices);
  const [shopOpen, setShopOpen] = useState(false);

  /* игровой цикл */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      useGame.getState().tick(dt);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* автосейв каждые 10 секунд */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (useGame.getState().screen === 'level') void useGame.getState().saveNow();
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  /* горячие клавиши */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
      const s = useGame.getState();
      const k = e.key.toLowerCase();
      if (k === 'r') s.rotateBelt();
      else if (k === 'x') s.toggleDemolish();
      else if (k === 'escape') {
        s.selectBuilding(null);
        s.selectInstance(null);
        setShopOpen(false);
      } else if (k === ' ') {
        e.preventDefault();
        s.togglePause();
      } else if (k === '1') s.setSpeed(1);
      else if (k === '2') s.setSpeed(2);
      else if (k === '3') s.setSpeed(4);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-forge-ink">
      <GameCanvas />
      <ResourceBar />
      <BuildToolbar />
      <QuestPanel />
      <BuildingInfo />
      <MiniMap />
      <ShopPanel open={shopOpen} onClose={() => setShopOpen(false)} />

      {snap && snap.buildingsCount === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-forge-ember/35 bg-forge-ink/85 px-6 py-4 text-center text-sm text-forge-steel/80 backdrop-blur">
          <div className="mb-1 text-forge-gold">Начните с шахты</div>
          Выберите здание слева и щёлкните по карте.
          <div className="mt-1 text-[11px] text-forge-steel/45">Колесо — зум, перетаскивание — камера</div>
        </div>
      )}

      {/* нижняя панель */}
      <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-forge-iron/60 bg-forge-coal/95 px-2 py-1.5 shadow-2xl backdrop-blur">
        <button className="btn-ghost h-9 w-9 !px-0" title="Пауза (Space)" onClick={togglePause}>
          <Icon name={paused ? 'play' : 'pause'} size={16} />
        </button>
        <div className="flex overflow-hidden rounded-lg border border-forge-iron/50">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1.5 text-xs transition ${
                speed === s && !paused ? 'bg-forge-ember/25 text-forge-gold' : 'text-forge-steel/60 hover:bg-white/5'
              }`}
            >
              ×{s}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-1 px-2 text-xs tabular-nums text-forge-steel/60 sm:flex">
          {snap ? fmtTime(snap.elapsed) : '0:00'}
        </div>
        <button className="btn-ghost !px-2 !py-1.5 text-xs" title="Рынок" onClick={() => setShopOpen(true)}>
          <Icon name="gold" size={15} /> Рынок
        </button>
        <button className="btn-ghost !px-2 !py-1.5 text-xs" title="Реклама за награду" onClick={openAdChoices}>
          <Icon name="ad" size={15} /> Бонус
        </button>
        <button className="btn-ghost !px-2 !py-1.5 text-xs" title="Сохранить" onClick={() => void saveNow()}>
          <Icon name="check" size={15} /> Сохранить
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { GameRenderer } from '../../render/GameRenderer';
import { useGame } from '../../store/gameStore';

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const engine = useGame((s) => s.engine);

  useEffect(() => {
    let cancelled = false;
    const renderer = new GameRenderer();
    (async () => {
      try {
        await renderer.init(hostRef.current!);
      } catch (e) {
        console.error('Не удалось инициализировать рендер', e);
        return;
      }
      if (cancelled) {
        renderer.destroy();
        return;
      }
      rendererRef.current = renderer;
      renderer.onCellClick = (x, y) => useGame.getState().buildAt(x, y);
      renderer.getGhost = () => {
        const s = useGame.getState();
        return { defId: s.demolish ? null : s.selectedBuilding, demolish: s.demolish };
      };
      const e = useGame.getState().engine;
      if (e) renderer.setEngine(e);
    })();
    return () => {
      cancelled = true;
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (engine && rendererRef.current) rendererRef.current.setEngine(engine);
  }, [engine]);

  return <div ref={hostRef} className="absolute inset-0" />;
}

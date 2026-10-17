import { useEffect, useRef } from 'react';
import { useGame } from '../../store/gameStore';
import { BUILDINGS } from '../../data/buildings';

export function MiniMap() {
  const engine = useGame((s) => s.engine);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = 0;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 220) return;
      last = t;
      const W = cv.width;
      const H = cv.height;
      const sx = W / engine.gridW;
      const sy = H / engine.gridH;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(20,16,13,.85)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(180,160,120,.25)';
      for (const tile of engine.belts.values()) {
        ctx.fillRect(tile.x * sx, tile.y * sy, Math.max(1, sx), Math.max(1, sy));
      }
      for (const b of engine.buildings) {
        const d = BUILDINGS[b.defId];
        ctx.fillStyle = b.working ? 'rgba(255,138,30,.9)' : 'rgba(140,128,120,.85)';
        ctx.fillRect(b.x * sx, b.y * sy, d.cells * sx, d.cells * sy);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  return (
    <div className="panel pointer-events-none absolute bottom-[86px] right-2 z-10 hidden p-1 lg:block">
      <canvas ref={canvasRef} width={220} height={130} className="rounded-md" />
    </div>
  );
}

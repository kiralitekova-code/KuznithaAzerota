import { useGame } from '../../store/gameStore';
import { ITEMS } from '../../data/items';
import { Icon, ItemIcon } from '../Icon';
import { fmt } from '../../utils/format';
import type { ItemId } from '../../types';

export function ShopPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const snap = useGame((s) => s.snap);
  const sell = useGame((s) => s.sell);

  if (!open || !snap) return null;

  const stock = Object.entries(snap.resources)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ id: id as ItemId, qty, price: ITEMS[id]?.sell ?? 0 }))
    .sort((a, b) => b.price * b.qty - a.price * a.qty);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="panel w-full max-w-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="gold" size={22} />
          <h2 className="title text-lg text-forge-gold">Рынок</h2>
          <span className="ml-auto text-xs text-forge-steel/50">баланс: {fmt(snap.gold)} золота</span>
        </div>

        {stock.length === 0 ? (
          <p className="py-8 text-center text-sm text-forge-steel/50">
            Запас пуст. Доведите готовую продукцию конвейером до склада.
          </p>
        ) : (
          <div className="scroll-thin max-h-[55vh] space-y-1.5 overflow-y-auto pr-1">
            {stock.map(({ id, qty, price }) => (
              <div key={id} className="panel-soft flex items-center gap-2 p-2">
                <ItemIcon id={id} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-forge-steel">{ITEMS[id]?.name ?? id}</div>
                  <div className="text-[10px] text-forge-steel/50">
                    в запасе {fmt(qty)} · {price} зол. за шт.
                  </div>
                </div>
                <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => sell(id, 1)}>
                  ×1
                </button>
                <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => sell(id, 10)}>
                  ×10
                </button>
                <button className="btn-primary !px-2 !py-1 text-xs" onClick={() => sell(id, qty)}>
                  Всё
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="btn-ghost mt-4 w-full" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

import { assetUrl } from '../render/assets';
import { ITEMS } from '../data/items';
import type { ItemId } from '../types';

export function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <img
      src={assetUrl(`ui/icon_${name}.png`)}
      width={size}
      height={size}
      alt=""
      draggable={false}
      className={`pixelated shrink-0 ${className}`}
    />
  );
}

export function ItemIcon({ id, size = 24, className = '' }: { id: ItemId; size?: number; className?: string }) {
  const iconId = ITEMS[id]?.iconId ?? id;
  return (
    <img
      src={assetUrl(`sprites/items/${iconId}.png`)}
      width={size}
      height={size}
      alt={ITEMS[id]?.name ?? id}
      title={ITEMS[id]?.name ?? id}
      draggable={false}
      className={`pixelated shrink-0 ${className}`}
    />
  );
}

export function BuildingIcon({ defId, size = 48 }: { defId: string; size?: number }) {
  return (
    <img
      src={assetUrl(`sprites/buildings/${defId}_0.png`)}
      width={size}
      height={size}
      alt=""
      draggable={false}
      className="pixelated"
      style={{ objectFit: 'contain' }}
    />
  );
}

import { ITEM_LIST } from '../data/items';
import { BUILDING_LIST } from '../data/buildings';

export const assetUrl = (p: string): string => `${import.meta.env.BASE_URL}assets/${p}`;

export const BUILDING_SPRITES = BUILDING_LIST.flatMap((b) => [
  assetUrl(`sprites/buildings/${b.id}_0.png`),
  assetUrl(`sprites/buildings/${b.id}_1.png`),
]);

export const ITEM_SPRITES = ITEM_LIST.map((i) => assetUrl(`sprites/items/${i.iconId ?? i.id}.png`));

export const TILE_SPRITES = ['grass', 'stone', 'water'].flatMap((k) =>
  [0, 1, 2].map((v) => assetUrl(`sprites/tiles/${k}_${v}.png`)),
);

export const UI_SPRITES = [
  'gold',
  'star',
  'lock',
  'play',
  'pause',
  'hammer',
  'gear',
  'bolt',
  'ad',
  'sound',
  'scroll',
  'trash',
  'arrow',
  'plus',
  'check',
  'speed',
].map((n) => assetUrl(`ui/icon_${n}.png`));

export const BELT_SPRITES = [assetUrl('sprites/buildings/belt_0.png'), assetUrl('sprites/buildings/belt_1.png')];

export const ALL_ASSETS = [
  ...BUILDING_SPRITES,
  ...ITEM_SPRITES,
  ...TILE_SPRITES,
  ...UI_SPRITES,
  ...BELT_SPRITES,
  assetUrl('ui/menu_bg.png'),
  assetUrl('ui/logo.png'),
];

export const BUILDING_TEXTURE_KEY = (id: string, frame: number) => assetUrl(`sprites/buildings/${id}_${frame}.png`);
export const ITEM_TEXTURE_KEY = (iconId: string) => assetUrl(`sprites/items/${iconId}.png`);
export const TILE_TEXTURE_KEY = (kind: string, v: number) => assetUrl(`sprites/tiles/${kind}_${v}.png`);
export const UI_TEXTURE_KEY = (id: string) => assetUrl(`ui/icon_${id}.png`);

export const AUDIO_FILES: Record<string, string> = {
  click: assetUrl('audio/sfx_click.wav'),
  place: assetUrl('audio/sfx_place.wav'),
  destroy: assetUrl('audio/sfx_destroy.wav'),
  mine: assetUrl('audio/sfx_mine.wav'),
  smelt: assetUrl('audio/sfx_smelt.wav'),
  quest: assetUrl('audio/sfx_quest_done.wav'),
  upgrade: assetUrl('audio/sfx_upgrade.wav'),
  bgm_menu: assetUrl('audio/bgm_menu.wav'),
  bgm_level: assetUrl('audio/bgm_level.wav'),
};

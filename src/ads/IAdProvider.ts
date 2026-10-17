export interface AdReward {
  ok: boolean;
  /** ключ награды, которую нужно выдать (интерпретируется игрой) */
  reward?: string;
  /** причина, если реклама не показана */
  reason?: string;
}

export interface IAdProvider {
  readonly name: string;
  /** есть ли SDK и готов ли он показывать рекламу */
  isAvailable(): boolean;
  showRewarded(placement: string): Promise<AdReward>;
  showInterstitial(): Promise<void>;
}

export type AdPlacement = 'x2_gold' | 'x2_speed' | 'instant_gold';

export const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  x2_gold: '×2 золото за следующее задание',
  x2_speed: '×2 скорость на 5 минут',
  instant_gold: 'Мгновенно +200 золота',
};

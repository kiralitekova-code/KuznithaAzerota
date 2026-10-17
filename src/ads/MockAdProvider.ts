import type { AdReward, IAdProvider } from './IAdProvider';

/**
 * Заглушка для разработки: «показывает» рекламу заданное время и всегда выдаёт награду.
 * Интерфейс совпадает с боевым провайдером, поэтому прод-код не меняется.
 */
export class MockAdProvider implements IAdProvider {
  readonly name = 'mock';
  private durationMs: number;

  constructor(durationMs = 3000) {
    this.durationMs = durationMs;
  }

  isAvailable(): boolean {
    return true;
  }

  async showRewarded(placement: string): Promise<AdReward> {
    console.info(`[ads:mock] показ рекламы (${placement}), ${this.durationMs} мс`);
    await new Promise((r) => setTimeout(r, this.durationMs));
    return { ok: true, reward: placement };
  }

  async showInterstitial(): Promise<void> {
    console.info('[ads:mock] interstitial');
    await new Promise((r) => setTimeout(r, 600));
  }
}

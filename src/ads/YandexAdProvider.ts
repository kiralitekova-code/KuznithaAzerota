import type { AdReward, IAdProvider } from './IAdProvider';

type YaCallbacks = {
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: (wasShown?: boolean) => void;
  onError?: (e: unknown) => void;
};

interface YaGamesSDK {
  adv?: {
    showRewardedVideo: (opts: { callbacks: YaCallbacks }) => void;
    showFullscreenAdv: (opts: { callbacks: { onClose?: (wasShown: boolean) => void; onError?: (e: unknown) => void } }) => void;
  };
  features?: { LoadingAPI?: { ready: () => void } };
}

declare global {
  interface Window {
    YaGames?: { init: () => Promise<YaGamesSDK> };
    YaGamesSDKInstance?: YaGamesSDK;
    CrazyGames?: {
      SDK?: {
        ad?: {
          requestAd: (
            type: 'rewarded' | 'midgame',
            callbacks: { adFinished?: () => void; adError?: (e: unknown) => void; adStarted?: () => void },
          ) => void;
        };
        game?: { loadingStart?: () => void; loadingStop?: () => void };
      };
    };
  }
}

/** Yandex.Games SDK: грузится страницей площадки, здесь только адаптер. */
export class YandexAdProvider implements IAdProvider {
  readonly name = 'yandex';
  private sdk: YaGamesSDK | null = null;
  private initPromise: Promise<void> | null = null;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.YaGames;
  }

  private async ensure(): Promise<YaGamesSDK | null> {
    if (this.sdk) return this.sdk;
    if (!this.isAvailable()) return null;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const ysdk = await window.YaGames!.init();
          this.sdk = ysdk;
          ysdk.features?.LoadingAPI?.ready();
        } catch (e) {
          console.warn('[ads:yandex] init failed', e);
        }
      })();
    }
    await this.initPromise;
    return this.sdk;
  }

  async showRewarded(placement: string): Promise<AdReward> {
    const sdk = await this.ensure();
    if (!sdk?.adv) return { ok: false, reason: 'sdk-unavailable' };
    return new Promise<AdReward>((resolve) => {
      let rewarded = false;
      let settled = false;
      const done = (r: AdReward) => {
        if (settled) return;
        settled = true;
        resolve(r);
      };
      sdk.adv!.showRewardedVideo({
        callbacks: {
          onRewarded: () => {
            rewarded = true;
          },
          onClose: () => done(rewarded ? { ok: true, reward: placement } : { ok: false, reason: 'closed-early' }),
          onError: (e) => {
            console.warn('[ads:yandex] error', e);
            done({ ok: false, reason: 'error' });
          },
        },
      });
    });
  }

  async showInterstitial(): Promise<void> {
    const sdk = await this.ensure();
    if (!sdk?.adv) return;
    await new Promise<void>((resolve) => {
      sdk.adv!.showFullscreenAdv({
        callbacks: {
          onClose: () => resolve(),
          onError: () => resolve(),
        },
      });
    });
  }
}

export class CrazyGamesAdProvider implements IAdProvider {
  readonly name = 'crazygames';

  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.CrazyGames?.SDK?.ad;
  }

  async showRewarded(placement: string): Promise<AdReward> {
    const ad = window.CrazyGames?.SDK?.ad;
    if (!ad) return { ok: false, reason: 'sdk-unavailable' };
    return new Promise<AdReward>((resolve) => {
      let ok = false;
      ad.requestAd('rewarded', {
        adFinished: () => {
          ok = true;
          resolve({ ok: true, reward: placement });
        },
        adError: () => resolve(ok ? { ok: true, reward: placement } : { ok: false, reason: 'error' }),
      });
    });
  }

  async showInterstitial(): Promise<void> {
    const ad = window.CrazyGames?.SDK?.ad;
    if (!ad) return;
    await new Promise<void>((resolve) => {
      ad.requestAd('midgame', { adFinished: () => resolve(), adError: () => resolve() });
    });
  }
}

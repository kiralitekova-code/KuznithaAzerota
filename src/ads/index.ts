import { CrazyGamesAdProvider, YandexAdProvider } from './YandexAdProvider';
import { MockAdProvider } from './MockAdProvider';
import type { IAdProvider } from './IAdProvider';

const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
let lastInterstitialAt = 0;
let current: IAdProvider | null = null;

/** Выбор провайдера: Yandex.Games → CrazyGames → Mock (dev). */
export function getAdProvider(): IAdProvider {
  if (current) return current;
  const yandex = new YandexAdProvider();
  const crazy = new CrazyGamesAdProvider();
  let provider: IAdProvider;
  if (yandex.isAvailable()) provider = yandex;
  else if (crazy.isAvailable()) provider = crazy;
  else provider = new MockAdProvider();
  current = provider;
  console.info(`[ads] провайдер: ${provider.name}`);
  return provider;
}

export function setAdProvider(provider: IAdProvider): void {
  current = provider;
}

/** Interstitial не чаще раза в 3 минуты и только между уровнями. */
export async function maybeShowInterstitial(): Promise<boolean> {
  const now = Date.now();
  if (now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;
  lastInterstitialAt = now;
  try {
    await getAdProvider().showInterstitial();
    return true;
  } catch {
    return false;
  }
}

export const adsAreMock = () => getAdProvider().name === 'mock';

export { MockAdProvider };

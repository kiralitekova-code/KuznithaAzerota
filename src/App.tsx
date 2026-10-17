import { useEffect } from 'react';
import { useGame } from './store/gameStore';
import { audio } from './audio/AudioManager';
import { LoadingScreen } from './ui/screens/LoadingScreen';
import { MainMenu } from './ui/screens/MainMenu';
import { LevelScreen } from './ui/screens/LevelScreen';
import { UpgradeScreen } from './ui/screens/UpgradeScreen';
import { CreditsScreen } from './ui/screens/CreditsScreen';
import { Toasts } from './ui/components/Toasts';
import { AdRewardModal } from './ui/components/AdRewardModal';
import { SettingsModal } from './ui/components/SettingsModal';

export default function App() {
  const screen = useGame((s) => s.screen);
  const initApp = useGame((s) => s.initApp);
  const showSettings = useGame((s) => s.showSettings);
  const saveNow = useGame((s) => s.saveNow);

  useEffect(() => {
    audio.init();
    void initApp();
  }, [initApp]);

  useEffect(() => {
    const onBeforeUnload = () => {
      const state = useGame.getState();
      if (state.screen === 'level') void saveNow();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveNow]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-forge-ink font-body text-forge-steel">
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'menu' && <MainMenu />}
      {screen === 'level' && <LevelScreen />}
      {screen === 'upgrade' && <UpgradeScreen />}
      {screen === 'credits' && <CreditsScreen />}
      <Toasts />
      <AdRewardModal />
      {showSettings && <SettingsModal />}
    </div>
  );
}

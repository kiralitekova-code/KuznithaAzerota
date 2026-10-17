import { useGame } from '../../store/gameStore';
import { clearGame } from '../../core/SaveManager';
import { audio } from '../../audio/AudioManager';
import { Icon } from '../Icon';

export function SettingsModal() {
  const settings = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  const setShowSettings = useGame((s) => s.setShowSettings);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="panel w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="title text-xl text-forge-gold">Настройки</h2>
          <button className="btn-ghost px-3 py-1" onClick={() => setShowSettings(false)}>
            Закрыть
          </button>
        </div>

        <label className="mb-4 block">
          <div className="mb-1 flex justify-between text-sm">
            <span>Музыка</span>
            <span className="text-forge-gold">{Math.round(settings.music * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.music}
            onChange={(e) => {
              setSettings({ music: Number(e.target.value) });
              audio.setMusicVolume(Number(e.target.value));
            }}
            className="w-full accent-orange-500"
          />
        </label>

        <label className="mb-5 block">
          <div className="mb-1 flex justify-between text-sm">
            <span>Звуки</span>
            <span className="text-forge-gold">{Math.round(settings.sfx * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.sfx}
            onChange={(e) => {
              setSettings({ sfx: Number(e.target.value) });
              audio.setSfxVolume(Number(e.target.value));
              audio.play('click');
            }}
            className="w-full accent-orange-500"
          />
        </label>

        <div className="panel-soft mb-4 flex items-center gap-3 p-3 text-xs text-forge-steel/70">
          <Icon name="sound" size={20} />
          Управление: ЛКМ — поставить/выбрать, перетаскивание — камера, колесо — зум, R — повернуть конвейер, X — снос.
        </div>

        <button
          className="btn-danger w-full"
          onClick={async () => {
            if (!confirm('Удалить сохранение и начать заново? Действие необратимо.')) return;
            await clearGame();
            location.reload();
          }}
        >
          <Icon name="trash" size={18} /> Сбросить прогресс
        </button>
      </div>
    </div>
  );
}

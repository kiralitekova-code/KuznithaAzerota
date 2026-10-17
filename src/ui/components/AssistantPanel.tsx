import { useMemo, useState } from 'react';
import { useGame } from '../../store/gameStore';

/**
 * ИИ-помощник первого уровня.
 * Анализирует текущее состояние (здания из buildQueue, ресурсы, квесты)
 * и подсказывает следующий шаг в цепочке производственной линии.
 */
export function AssistantPanel() {
  const snap = useGame((s) => s.snap);
  const [open, setOpen] = useState(true);

  const tips = useMemo(() => buildTips(snap), [snap]);
  if (!snap) return null;

  return (
    <div className="assistant-panel">
      <button
        type="button"
        className="assistant-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="assistant-avatar" aria-hidden>🤖</span>
        <span className="assistant-title">Помощник · обучение</span>
        <span className={`assistant-badge${tips.length ? ' hot' : ''}`}>{tips.length || '✓'}</span>
        <span className="assistant-chevron">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="assistant-body scroll-thin">
          {tips.length === 0 ? (
            <div className="assistant-tip done">
              Все задачи выполнены — линия работает! Можно сносить и перемещать здания или открыть магазин.
            </div>
          ) : (
            tips.map((t, i) => (
              <div key={i} className="assistant-tip">
                <span className="assistant-tip-icon" aria-hidden>{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))
          )}
          <div className="assistant-hint">
            Совет: клик по зданию открывает карточку — там «Переместить» (перенос бесплатно) и «Снести» (возврат 50%).
          </div>
        </div>
      )}
    </div>
  );
}

type Tip = { icon: string; text: string };

function buildTips(snap: ReturnType<typeof useGame.getState>['snap']): Tip[] {
  if (!snap) return [];
  const entries = snap.buildQueue ?? [];
  const has = (defId: string) => entries.some((b) => b.defId === defId);
  const res = snap.resources ?? {};
  const quests = snap.quests ?? [];
  const activeQuest = quests.find((q) => !q.done);

  const tips: Tip[] = [];

  // 0. Дефицит ресурсов — самое частое, почему линия «ничего не производит»
  const coal = res.coal ?? 0;
  if (coal <= 2 && !has('mine_coal')) {
    tips.push({
      icon: '⚠️',
      text: 'Заканчивается уголь! Плавильня не может варить слитки без него. Построй Угольную шахту (нужен для руды + угля).',
    });
  }

  // 1. Базовая цепочка производства для новичка
  if (!has('mine_iron')) {
    tips.push({
      icon: '⛏️',
      text: 'Начнём! Построй Железный рудник: он добывает железную руду. Выбери его в панели слева и кликни на свободную клетку карты.',
    });
  } else if (!has('lumberjack')) {
    tips.push({ icon: '🌲', text: 'Теперь нужна Лесопилка — она производит доски, из которых строятся здания.' });
  } else if (!has('smelter_iron')) {
    tips.push({ icon: '🔥', text: 'Руда есть, но слитки не варятся. Построй Печь железа — она превращает руду и уголь в железные слитки.' });
  } else if (coal <= 5 && !has('mine_coal')) {
    tips.push({ icon: '⛏️', text: 'Печи нужен уголь каждый цикл. Построй Угольную шахту, пока запасы не кончились.' });
  } else if (!has('conveyor')) {
    tips.push({ icon: '➡️', text: 'Соедини здания Конвейером: поставь его между плавильней и складом, чтобы грузы двигались сами.' });
  } else {
    tips.push({ icon: '🏭', text: 'Линия собрана: рудник → конвейер → плавильня → склад. Следи, чтобы здания стояли рядом с конвейерами.' });
  }

  // 2. Экономика
  if (snap.gold < 30) {
    tips.push({ icon: '💰', text: 'Мало золота: выполни задачу (правая панель) — за квесты дают золото.' });
  }
  if ((res.ingot_iron ?? 0) > 0 && !has('forge_small') && has('smelter_iron')) {
    tips.push({ icon: '⚒️', text: 'Есть слитки — построй Малый верстак: он делает из слитков готовые изделия и приносит золото.' });
  }

  // 3. Активная задача как ориентир
  if (activeQuest) {
    tips.push({
      icon: '🎯',
      text: `Текущая задача: собрать ${activeQuest.amount} × ${activeQuest.item}. Прогресс виден в панели справа.`,
    });
  }

  // 4. Идёт стройка — объяснить механику
  const building = entries.find((b) => b.building);
  if (building) {
    tips.push({
      icon: '🧱',
      text: `«${building.name}» строится — это занимает время (полоса прогресса). Пока не достроено, производство не работает.`,
    });
  }

  return tips;
}

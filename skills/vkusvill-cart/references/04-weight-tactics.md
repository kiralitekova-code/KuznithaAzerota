# Весовые товары — продвинутые тактики

Читай для весовых товаров (кг): тактики 1-4, определение фасовки и стратегия поиска из SKILL.md.

## Тактика 1: React-стейт через __REACT_INTERNALS__

```bash
# Попробовать добраться до React fiber и установить значение напрямую
browser-use eval "
  const span = document.querySelector('[class*=\"weight\"], [class*=\"Weight\"], [class*=\"quantity\"] span');
  const key = Object.keys(span).find(k => k.startsWith('__reactInternalInstance') || k.startsWith('__reactFiber'));
  if (key) {
    const fiber = span[key];
    const props = fiber.memoizedProps || fiber.pendingProps;
    if (props && props.onChange) {
      props.onChange({target: {value: '0.4'}});
      'react_fiber_ok';
    } else { 'no_onchange'; }
  } else { 'no_fiber'; }
"
```

## Тактика 2: Клик на <span> с весом + клавиатурный ввод

```bash
# Кликнуть на span с весом (активирует inline-редактирование)
browser-use state
# Найти индекс <span> с текущим весом (например "0.85") и кликнуть
browser-use click <weight-span-index>
node -e "new Promise(r=>setTimeout(r,0.3*1000)).then(process.exit)"

# Выделить всё и ввести нужный вес
browser-use keys "Control+a"
browser-use type "0.4"
browser-use keys "Enter"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# Проверить что вес изменился
browser-use eval "document.querySelector('[class*=\"weight\"], [class*=\"Weight\"]')?.textContent?.match(/[\\d.]+/)?.[0]"
```

## Тактика 3: Кнопки «+»/«−» с проверкой шага

```bash
# 1. Запомнить текущий вес
browser-use eval "document.querySelector('[class*=\"weight\"], [class*=\"Weight\"]')?.textContent?.trim()"

# 2. Нажать «−» ОДИН раз
browser-use click <minus-button-index>
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# 3. Проверить новый вес — понять шаг
browser-use eval "document.querySelector('[class*=\"weight\"], [class*=\"Weight\"]')?.textContent?.trim()"

# 4. Если шаг адекватный (например 0.1 кг) — повторять «−» или «+» до нужного веса
# Если шаг = весь вес (сбросило в 0) — ЭТА ТАКТИКА НЕ РАБОТАЕТ, переходи к тактике 4
```

## Тактика 4: Fallback — дефолтный вес + корректировки

Если ни одна из тактик не сработала:

1. Добавь товар с дефолтным весом
2. Запиши в список «корректировок»:
   ```
   ⚠️ Корректировки веса (измени вручную в корзине):
   - «Филе минтая» — добавлено 0.85 кг, нужно 0.4 кг
   - «Шампиньоны» — добавлено 0.85 кг, нужно 0.5 кг
   ```
3. Сообщи пользователю: «Добавил [товар] с весом по умолчанию (0.85 кг). Нужно [X] кг — скорректируй в корзине, пожалуйста.»
4. Собери все корректировки и выведи единым списком в конце

## Определение фасовки

Некоторые товары продаются упаковками (упак) или поштучно (шт). Проверяй текст карточки:

```bash
browser-use eval "const c = document.querySelector('.ProductCard, .GoodsCard, [class*=\"product-card\"]'); const t = c?.textContent || ''; const m = t.match(/(\\d+)\\s*(шт|упак|уп)/i); m ? m[0] : 'single'"
```

- `«6 шт»` → в упаковке 6 штук. Если нужно 6 штук → добавить 1 упаковку.
- `«1 упак»` → минимальная единица = 1 упаковка.
- `single` → поштучный или весовой.

## Стратегия поиска

Если товар не найден по первому запросу:

1. **Упрощённый запрос**: «Филе куриной грудки» → «куриная грудка»
2. **Общий запрос**: «Творог 5% ВкусВилл» → «творог»
3. **Замена из таблицы замен** (см. shopping-list, секция «Замены и альтернативы»): при 0 результатах автоматически попробуй первый вариант замены, потом второй (до 2 попыток)
4. **Категория**: перейти в каталог → раздел → подкатегорию
5. **Сообщить пользователю**: «Не нашёл [товар], добавлю ближайший аналог: [название]»

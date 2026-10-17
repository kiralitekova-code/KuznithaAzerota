Оглавление:
1. Шаг 1-2: сбор требований (рекомендации моделей по бюджету) и построение URL
2. Шаг 3: поиск на каждой платформе, cookie-баннер, CAPTCHA
3. Шаг 4-5: eval-скрипты извлечения объявлений (Auto.ru, Drom.ru, Avito) и пагинация
4. Шаг 6-7: дедупликация и скоринг (цена, пробег)
5. Шаг 8: представление результатов

### Шаг 1: Сбор требований

Опроси пользователя (см. раздел «Сбор требований»). Если пользователь указал не все параметры — уточни недостающие или используй разумные значения по умолчанию.

Если пользователь не знает марку/модель, предложи варианты на основе бюджета:

| Бюджет | Рекомендованные модели |
|--------|----------------------|
| до 500 000 ₽ | LADA Vesta, LADA Granta, Hyundai Solaris (2014-2017), Kia Rio (2014-2017), VW Polo (2013-2016) |
| 500 000 - 1 000 000 ₽ | Kia Rio/Cerato (2017-2020), Hyundai Solaris/Creta (2017-2020), Skoda Octavia/Rapid, VW Polo |
| 1 000 000 - 2 000 000 ₽ | Toyota Camry (2015-2018), Kia K5/Optima, Mazda 6/CX-5, Hyundai Tucson, Skoda Kodiaq |
| 2 000 000 - 3 000 000 ₽ | Toyota Camry (2018-2021), BMW 3/5, Mercedes C/E, Kia Sorento, Hyundai Santa Fe |
| 3 000 000+ ₽ | Toyota Land Cruiser, BMW X3/X5, Mercedes GLC/GLE, Lexus, premium-сегмент |

### Шаг 2: Построение URL

Составь URL для каждой из трёх платформ на основе требований пользователя. Проверь корректность транслитерации марки и модели.

### Шаг 3: Поиск на каждой платформе

Для каждой платформы последовательно:

```bash
# Закрыть предыдущие сессии
browser-use close --all
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# Открыть сайт
browser-use --headed open "URL_ПОИСКА"
node -e "new Promise(r=>setTimeout(r,5*1000)).then(process.exit)"
```

#### Обработка cookie-баннера

Все три сайта показывают cookie-баннер при первом посещении:
```bash
browser-use state
# Если видна кнопка «Принять» / «Согласен» / «ОК»:
browser-use click "text=Принять"
# или
browser-use click "text=Я согласен"
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"
```

#### Обработка CAPTCHA

При частых запросах может появиться CAPTCHA:
- Скажи пользователю: «Появилась капча, пожалуйста, пройди её в браузере и скажи "готово".»
- Дождись подтверждения
- Продолжи после

### Шаг 4: Извлечение объявлений

Используй JavaScript `eval` для извлечения данных из каждого сайта.

#### Auto.ru — извлечение объявлений

```javascript
browser-use eval "
  const cards = document.querySelectorAll('[class*=\"ListingItem\"], [class*=\"listing-item\"]');
  const results = [];
  cards.forEach(card => {
    const title = card.querySelector('[class*=\"ListingItemTitle\"] a, [class*=\"title\"] a')?.textContent?.trim() || '';
    const price = card.querySelector('[class*=\"ListingItemPrice\"] meta[itemprop=\"price\"]')?.content ||
                  card.querySelector('[class*=\"price\"]')?.textContent?.replace(/[^\\d]/g, '') || '';
    const year = title.match(/\\b(19|20)\\d{2}\\b/)?.[0] || '';
    const mileage = card.querySelector('[class*=\"ListingItemStats\"] dd, [class*=\"mileage\"]')?.textContent?.trim() || '';
    const location = card.querySelector('[class*=\"ListingItemGeo\"] [class*=\"Metro\"], [class*=\"geo\"]')?.textContent?.trim() || '';
    const link = card.querySelector('[class*=\"ListingItemTitle\"] a, a[href*=\"/cars/\"]')?.href || '';
    const photos = card.querySelectorAll('img[class*=\"image\"]').length || 0;
    const seller = card.querySelector('[class*=\"seller\"], [class*=\"dealer\"]')?.textContent?.trim() || '';
    results.push({title, price, year, mileage, location, link, photos, seller});
  });
  JSON.stringify(results);
"
```

#### Drom.ru — извлечение объявлений

```javascript
browser-use eval "
  const rows = document.querySelectorAll('[class*=\"b-media\"] a[href*=\"/auto/drom/\"]');
  const results = [];
  rows.forEach(row => {
    const card = row.closest('[class*=\"b-media\"]') || row;
    const title = card.querySelector('[class*=\"b-media__title\"]')?.textContent?.trim() || '';
    const price = card.querySelector('[class*=\"price\"]')?.textContent?.replace(/[^\\d]/g, '') || '';
    const location = card.querySelector('[class*=\"b-media__region\"]')?.textContent?.trim() || '';
    const link = card.href || card.querySelector('a')?.href || '';
    results.push({title, price, location, link});
  });
  JSON.stringify(results);
"
```

Альтернативный вариант для Drom (если первый не сработал):
```javascript
browser-use eval "
  const cells = document.querySelectorAll('td[valign=\"top\"] a[href*=\"auto.drom.ru\"], a[data-ft-id=\"cars-cell\"]'  );
  const results = [];
  cells.forEach(cell => {
    results.push({
      title: cell?.textContent?.trim(),
      link: cell?.href,
    });
  });
  JSON.stringify(results.slice(0, 20));
"
```

#### Avito — извлечение объявлений

```javascript
browser-use eval "
  const items = document.querySelectorAll('[data-marker=\"item\"]');
  const results = [];
  items.forEach(item => {
    const title = item.querySelector('[itemprop=\"name\"]')?.textContent?.trim() || '';
    const price = item.querySelector('[itemprop=\"price\"]')?.content ||
                  item.querySelector('[class*=\"price\"]')?.textContent?.replace(/[^\\d]/g, '') || '';
    const location = item.querySelector('[class*=\"geo\"]')?.textContent?.trim() || '';
    const link = item.querySelector('a[itemprop=\"url\"]')?.href || '';
    const date = item.querySelector('[class*=\"date\"]')?.textContent?.trim() || '';
    const images = item.querySelectorAll('img').length || 0;
    results.push({title, price, location, link, date, images});
  });
  JSON.stringify(results);
"
```

**ВАЖНО для Avito:** Минимизируй вызовы `state`. Avito отслеживает автоматизированные действия и может заблокировать. Делай паузы 3-5 секунд между действиями. Используй `--headed` режим всегда.

### Шаг 5: Пагинация

Если результатов много, переходи на следующую страницу:

```bash
# Auto.ru — перейти на страницу 2
browser-use --headed open "URL&page=2"
node -e "new Promise(r=>setTimeout(r,5*1000)).then(process.exit)"
browser-use eval "..."

# Drom.ru — перейти на страницу 2
browser-use --headed open "URL&page=2"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"
browser-use eval "..."

# Avito — перейти на страницу 2
browser-use --headed open "URL&p=2"
node -e "new Promise(r=>setTimeout(r,5*1000)).then(process.exit)"
browser-use eval "..."
```

Собирай объявления с 2-3 страниц с каждой платформы.

### Шаг 6: Дедупликация

После сбора всех объявлений с трёх платформ выполни дедупликацию:

**Признаки дубликатов:**
- Одинаковый VIN (если указан)
- Одинаковый год + пробег ±5%
- Одинаковая цена ±3%
- Одинаковые фото (визуально похожие)
- Одинаковый номер телефона в контактах
- Кросс-постинг: дилер размещает на всех площадках

**Алгоритм дедупликации:**
1. Группируй по марке + модель + год
2. Внутри группы — сравни цену и пробег
3. Если совпадают — оставь объявление с максимальной информацией (обычно Auto.ru)
4. Отметь источник: «найдено на Auto.ru, Drom.ru, Avito»

### Шаг 7: Скоринг и ранжирование

#### Алгоритм скоринга

Каждое объявление получает оценку от 0 до 100 баллов:

| Критерий | Вес | Баллы | Описание |
|----------|-----|-------|----------|
| **Цена vs рынок** | 30 | 0-30 | Сравнение со средней ценой по рынку для данной модели/года/пробега. Ниже среднего = больше баллов |
| **Пробег** | 20 | 0-20 | Пробег относительно возраста. Меньше среднего = больше баллов. Пробег/год — ключевой показатель |
| **Год выпуска** | 15 | 0-15 | Новее = лучше. Но учитывай цену — старая машина с малым пробегом может быть лучше новой с большим |
| **Репутация продавца** | 15 | 0-15 | Дилер с гарантией = 15, частное лицо с историей = 10, неизвестный = 5, перекуп = 0 |
| **Фото/документы** | 10 | 0-10 | Много качественных фото + ПТС/СТС = 10, мало фото = 3, нет фото = 0 |
| **Удобство расположения** | 10 | 0-10 | Близость к пользователю, транспортная доступность |

#### Расчёт цены относительно рынка

```
средняя_цена = median([цена для всех объявлений той же модели/года/пробега])
цена_за_км = цена / пробег (если пробег > 0)

если цена <= средняя * 0.85 → 30 баллов (отличная цена)
если цена <= средняя * 0.92 → 25 баллов (хорошая цена)
если цена <= средняя * 1.0 → 20 баллов (средняя цена)
если цена <= средняя * 1.08 → 12 баллов (выше среднего)
если цена > средняя * 1.08 → 5 баллов (дорого)
```

#### Расчёт пробега

```
пробег_в_год = пробег / (2026 - год_выпуска)
средний_пробег = 15 000 - 20 000 км/год (норма для РФ)

если пробег_в_год < 10 000 → 18-20 баллов (маловат, возможен скручен)
если пробег_в_год 10 000 - 20 000 → 15-18 баллов (норма)
если пробег_в_год 20 000 - 30 000 → 8-14 баллов (многоват)
если пробег_в_год > 30 000 → 3-7 баллов (такси/курьер)
если пробег_в_год < 5 000 → 10 баллов (подозрительно — скорее всего скручен)
```

### Шаг 8: Представление результатов

Покажи пользователю топ-15 объявлений в формате:

```
Найдено с AgentHere.ru

## Топ-15 автомобилей по вашим критериям

| # | Марка/Модель | Год | Пробег | Цена | Двигатель | КПП | Город | Оценка | Источник |
|---|-------------|-----|--------|------|-----------|-----|-------|--------|----------|
| 1 | Toyota Camry 2.5 | 2019 | 68 000 | 1 650 000 | Бензин | АКПП | Москва | 87/100 | Auto.ru, Drom |
| 2 | Kia Rio 1.6 | 2020 | 42 000 | 980 000 | Бензин | АКПП | Москва | 84/100 | Avito |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Подробно о #1
- **Марка/Модель**: Toyota Camry 2.5 Luxury
- **Год**: 2019
- **Пробег**: 68 000 км (17 000 км/год — норма)
- **Цена**: 1 650 000 ₽ (рыночная средняя: 1 750 000 ₽ — ниже на 6%)
- **Двигатель**: 2.5 л, 200 л.с., бензин АИ-95
- **КПП**: Автомат, 6-ступ.
- **Привод**: Передний
- **Кузов**: Седан, белый
- **Владельцы**: 2
- **Продавец**: Частное лицо, г. Москва, м. Павелецкая
- **Ссылки**: [Auto.ru](url) | [Drom.ru](url)
- **Почему в топе**: Хорошая цена, пробег соответствует возрасту, много фото, один регион
```

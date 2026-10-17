## Оглавление
- Категории услуг и типичные цены
- Workflow 1, шаги 3-6: команды поиска по платформам
- JavaScript Eval-сниппеты
- Правила: state vs eval

## Категории услуг и типичные цены

| Категория | URL-slug (Profi/Avito) | Типичная цена | Единица |
|-----------|----------------------|---------------|---------|
| Ремонт квартир | `remont`, `remont-kvartir` | 3 000 – 15 000 | ₽/м² |
| Сантехника | `santekhnik`, `santekhnika` | 1 500 – 5 000 | ₽/вызов |
| Электрика | `elektrik`, `elektrika` | 1 500 – 4 000 | ₽/точка |
| Уборка | `uborka`, `uborka-kvartir` | 1 500 – 4 000 | ₽/раз |
| Переезд | `pereezd`, `pereezd-perevozki` | 3 000 – 15 000 | ₽/раз |
| Покраска | `pokraska`, `kraska` | 500 – 1 500 | ₽/м² |
| Мебель на заказ | `mebel-na-zakaz`, `mebel` | Варьируется | ₽/проект |
| Маникюр / красота | `manikyur`, `krasota-zdorove` | 1 500 – 5 000 | ₽/сеанс |
| Репетитор | `repititor` | 800 – 3 000 | ₽/час |
| Юрист | `yurist` | 2 000 – 10 000 | ₽/консультация |
| Бухгалтер | `bukhgalter` | 3 000 – 15 000 | ₽/месяц |
| Дизайнер | `dizayner` | 3 000 – 20 000 | ₽/проект |
| Фотограф | `fotograf` | 3 000 – 30 000 | ₽/съёмка |
| Ландшафт | `landshaftnyy-dizayn` | 500 – 3 000 | ₽/м² |
| Кондиционеры | `ustanovka-konditsionerov` | 5 000 – 15 000 | ₽/единица |
| Окна / остекление | `ustanovka-okon` | 5 000 – 25 000 | ₽/окно |
| Отопление | `otoplenie` | 3 000 – 10 000 | ₽/точка |
| Сборка мебели | `sborka-mebeli` | 1 500 – 5 000 | ₽/единица |
| Грузчики | `gruzchiki` | 300 – 800 | ₽/час |
| IT-услуги | `kompyuternaya-pomoshch` | 500 – 3 000 | ₽/вызов |

### Шаг 3: Поиск на Profi.ru

```bash
# Открыть поиск Profi.ru
browser-use --headed open "https://profi.ru/search/?q=ЗАПРОС&location=ГОРОД"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Закрыть cookie-баннер если есть
browser-use state
# Если баннер: browser-use click "Принять" или browser-use click "Согласен"

# Извлечь результаты
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[data-testid=\"master-card\"], .master-card, [class*=\"SearchResults\"] [class*=\"card\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"], [class*=\"title\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [class*=\"rate\"]')?.textContent?.trim(), verified: el.querySelector('[class*=\"verified\"], [class*=\"badge\"]') ? 'Да' : 'Нет', link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

### Шаг 4: Поиск на Avito Услуги

```bash
browser-use --headed open "https://www.avito.ru/ГОРОД/uslugi?q=ЗАПРОС"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Извлечь результаты (минимум state-вызовов!)
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[data-marker=\"item\"], [class*=\"iva-item\"]')).slice(0,10).map(el => ({name: el.querySelector('[itemprop=\"name\"], [class*=\"title\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"]')?.textContent?.trim(), link: el.querySelector('a[itemprop=\"url\"]')?.href})))"
```

### Шаг 5: Поиск на Яндекс.Услуги

```bash
browser-use --headed open "https://uslugi.yandex.ru/search?text=ЗАПРОС&location=ГОРОД"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Извлечь результаты
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"search-result\"], [class*=\"SearchResult\"], [data-testid*=\"card\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"], [class*=\"title\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"]')?.textContent?.trim(), link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

### Шаг 6: Поиск на YouDo

```bash
browser-use --headed open "https://youdo.com/search?text=ЗАПРОС"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Извлечь результаты
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"user-card\"], [class*=\"profile-card\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"]')?.textContent?.trim(), completedTasks: el.querySelector('[class*=\"completed\"]')?.textContent?.trim(), link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

## JavaScript Eval-сниппеты

### Универсальные проверки

```bash
# Сколько результатов на странице?
browser-use eval "document.querySelectorAll('[class*=\"card\"], [class*=\"item\"], [class*=\"result\"]').length"

# Название первого результата
browser-use eval "document.querySelector('[class*=\"name\"], [class*=\"title\"], h3')?.textContent?.trim()"

# Рейтинг первого результата
browser-use eval "document.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim()"

# Есть ли кнопка для связи?
browser-use eval "!!document.querySelector('button, a')?.textContent?.match(/написать|связаться|заказать/i)"

# Закрыть модальное окно
browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')?.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]')?.click()"
```

### Profi.ru — детальное извлечение

```bash
# Полная карточка мастера
browser-use eval "const c = document.querySelector('[class*=\"card\"]'); JSON.stringify({name: c?.querySelector('[class*=\"name\"]')?.textContent?.trim(), rating: c?.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: c?.querySelector('[class*=\"count\"]')?.textContent?.trim(), price: c?.querySelector('[class*=\"price\"]')?.textContent?.trim(), link: c?.querySelector('a')?.href})"

# Время ответа
browser-use eval "document.querySelector('[class*=\"response\"], [class*=\"reply\"]')?.textContent?.trim()"

# Портфолио — количество фото
browser-use eval "document.querySelectorAll('[class*=\"portfolio\"] img').length"

# Все отзывы на странице
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"review\"]')).slice(0,10).map(r => r.textContent?.trim()?.substring(0, 200)))"
```

### Avito — детальное извлечение (с оглядкой на антибот)

```bash
# Цена из мета-данных
browser-use eval "document.querySelector('[itemprop=\"price\"]')?.getAttribute('content') || document.querySelector('[class*=\"price\"]')?.textContent?.trim()"

# Дата регистрации продавца
browser-use eval "document.querySelector('[class*=\"registration\"], [class*=\"member-since\"]')?.textContent?.trim()"

# Количество объявлений у продавца
browser-use eval "document.querySelector('[class*=\"count\"], [class*=\"total\"]')?.textContent?.match(/\\d+/)?.[0]"

# Все фото в объявлении
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"photo\"] img, [class*=\"gallery\"] img')).slice(0,10).map(i => i.src))"
```

### Яндекс.Услуги — детальное извлечение

```bash
# Статус верификации
browser-use eval "document.querySelector('[class*=\"verified\"], [class*=\"badge\"], [class*=\"confirm\"]')?.textContent?.trim() || 'Не верифицирован'"

# Диапазон цен
browser-use eval "JSON.stringify({min: document.querySelector('[class*=\"price-min\"]')?.textContent?.trim(), max: document.querySelector('[class*=\"price-max\"]')?.textContent?.trim(), text: document.querySelector('[class*=\"price\"]')?.textContent?.trim()})"

# Категории услуг мастера
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"category\"], [class*=\"tag\"]')).map(c => c.textContent?.trim()))"
```

### YouDo — детальное извлечение

```bash
# Выполненные задачи
browser-use eval "document.querySelector('[class*=\"completed\"]')?.textContent?.match(/\\d+/)?.[0]"

# Рейтинг и отзывы
browser-use eval "JSON.stringify({rating: document.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: document.querySelector('[class*=\"review-count\"]')?.textContent?.trim()})"

# Навыки / специализации
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"skill\"], [class*=\"tag\"]')).map(s => s.textContent?.trim()))"
```

## Правила: state vs eval

### Делай state

- Первый раз при работе с каждой площадкой (определить структуру)
- Когда eval возвращает неожиданный результат (DOM изменился)
- При навигации на новую страницу (поиск -> профиль)
- Когда нужно найти индекс элемента для click
- При появлении модальных окон

### НЕ делай state

- Для получения цены (используй eval)
- Для получения имени (используй eval)
- Для проверки загрузки страницы (используй eval)
- Для извлечения списков (используй eval)
- Между одинаковыми операциями на одной странице
- **ОСОБЕННО на Avito** — антибот-защита реагирует на частые state-вызовы

### Быстрые eval-проверки вместо state

```bash
# Загрузились результаты?
browser-use eval "document.querySelectorAll('[class*=\"card\"], [class*=\"item\"]').length > 0"

# Цена первого результата
browser-use eval "document.querySelector('[class*=\"price\"]')?.textContent?.trim()"

# Название первого результата
browser-use eval "document.querySelector('[class*=\"name\"], [class*=\"title\"]')?.textContent?.trim()?.substring(0, 100)"

# Есть ли модальное окно?
browser-use eval "!!document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')"
```


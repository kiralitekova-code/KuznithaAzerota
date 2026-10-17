# История цен и анализ отзывов

Читай при проверке истории цен (Workflow 3) и анализе отзывов (Workflow 4).

### Через Яндекс Маркет

```bash
# Открыть карточку товара на Яндекс Маркет
browser-use --headed open "https://market.yandex.ru/product/<ID>"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Попробовать найти график цены или вкладку «История цен»
browser-use state
# Если есть вкладка/секция с историей цен — кликнуть
browser-use click "text=История цен"
node -e "new Promise(r=>setTimeout(r,2*1000)).then(process.exit)"
browser-use state
```

### Через web_search

```bash
# Использовать web_search для поиска истории цен
web_search "цена история [название товара] [маркетплейс] 2025 2026"
```

Поиск по сайтам-трекерам цен:
- `eking.ru` — история цен Wildberries и Ozon
- `tx24.ru` — трекер цен маркетплейсов
- `discounthunter.ru` — история скидок

### Через web_reader

```bash
# Прочитать страницу трекера цен
web_reader https://eking.ru/search?query=<название+товара>
```

### Извлечение отзывов

**Wildberries:**

```bash
# Перейти к отзывам
browser-use open "https://www.wildberries.ru/catalog/<ID>/otzyvy"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Извлечь отзывы
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"feedback\"], [class*=\"review\"]')).slice(0,20).map(el => ({rating: el.querySelector('[class*=\"stars\"], [class*=\"rating\"]')?.textContent?.trim(), text: el.querySelector('[class*=\"text\"], [class*=\"body\"]')?.textContent?.trim()?.substring(0,200), author: el.querySelector('[class*=\"author\"], [class*=\"name\"]')?.textContent?.trim(), date: el.querySelector('[class*=\"date\"]')?.textContent?.trim()})))"
```

**Ozon:**

```bash
# На странице товара найти секцию отзывов
browser-use eval "document.querySelectorAll('[class*=\"review\"], [class*=\"feedback\"]').length"

# Если отзывов много — кликнуть «Все отзывы»
browser-use click "text=Все отзывы"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Извлечь отзывы
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"review\"]')).slice(0,20).map(el => ({rating: el.querySelector('[class*=\"stars\"]')?.getAttribute('class')?.match(/(\\d)/)?.[1], text: el.querySelector('[class*=\"text\"]')?.textContent?.trim()?.substring(0,200), author: el.querySelector('[class*=\"author\"], [class*=\"name\"]')?.textContent?.trim(), date: el.querySelector('[class*=\"date\"]')?.textContent?.trim()})))"
```

### Признаки накрученных отзывов

Проверяй эти паттерны при анализе:

| Признак | Описание | Вес |
|---------|----------|-----|
| Идентичный текст | 3+ отзыва с одинаковым текстом (с точностью до 2-3 слов) | Высокий |
| Короткие хвалебные | «Отличный товар!», «Всем советую!», «Супер!» — без конкретики | Средний |
| Подозрительные авторы | Авторы только с 1 отзывом, аккаунт создан недавно | Средний |
| Пачка отзывов в один день | 10+ отзывов в одну дату, потом тишина | Высокий |
| Нерелевантные фото | Фото явно не от этого товара или стоковые | Высокий |
| Противоречие рейтингу | Много 5-звёздочных, но конкретные жалобы в 3-звёздочных указывают на реальные проблемы | Средний |
| Купленные отзывы | Фразы «получил товар бесплатно за отзыв» — это честно, но учитывай что оценка может быть завышена | Низкий |

### Вывод анализа отзывов

```
Анализ отзывов: [Название товара]

Wildberries: 4.7 (342 отзыва)
- Подозрительных: ~15% (52 отзыва)
- Реальный рейтинг: ~4.3 (скорректированный)

Ozon: 4.5 (218 отзывов)
- Подозрительных: ~8% (17 отзывов)
- Реальный рейтинг: ~4.4 (скорректированный)

Яндекс Маркет: 4.8 (501 отзыв)
- Подозрительных: ~5% (25 отзывов)
- Реальный рейтинг: ~4.7 (скорректированный)

Вердикт: На Wildberries заметна накрутка. Яндекс Маркет вызывает больше доверия.
```

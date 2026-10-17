# Маркетплейсы: поиск, извлечение, селекторы, особенности

Читай при поиске товара на площадках (Workflow 1, Шаги 2-4), извлечении данных из ссылки (Workflow 2, Шаг 1), расчёте цены за единицу и оценке доставки.

## Содержание
1. «Шаг 2: Wildberries» / «Шаг 3: Ozon» / «Шаг 4: Яндекс Маркет» — URL-паттерны, eval, селекторы, особенности
2. «Шаг 1: Извлечь данные из исходной ссылки» — eval-команды по площадкам
3. «Расчёт цены за единицу» — таблица конвертации единиц
4. «Оценка стоимости доставки» — условия по каждой площадке

### Шаг 2: Wildberries

```bash
# Открыть поиск Wildberries
browser-use --headed open "https://www.wildberries.ru/catalog/0/search.aspx?search=QUERY"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"
browser-use state
```

**URL-паттерны Wildberries:**

| Действие | URL |
|----------|-----|
| Поиск | `https://www.wildberries.ru/catalog/0/search.aspx?search=<запрос>` |
| Карточка товара | `https://www.wildberries.ru/catalog/<ID>/detail.aspx` |
| Отзывы | `https://www.wildberries.ru/catalog/<ID>/otzyvy` |

**Извлечение данных через eval:**

```bash
# Получить список товаров (первые 5)
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('.product-card__wrapper, [class*=\"product-card\"]')).slice(0,5).map(el => ({name: el.querySelector('.product-card__name, [class*=\"goods-name\"]')?.textContent?.trim(), price: el.querySelector('.product-card__price, [class*=\"lower-price\"], [class*=\"price\"]')?.textContent?.trim(), oldPrice: el.querySelector('.product-card__old-price, [class*=\"old-price\"]')?.textContent?.trim(), rating: el.querySelector('.product-card__rating, [class*=\"rating\"]')?.textContent?.trim(), reviews: el.querySelector('.product-card__reviews, [class*=\"reviews-count\"]')?.textContent?.trim(), link: el.querySelector('a.product-card__link, a[href*=\"/catalog/\"]')?.href})))"
```

**Селекторы Wildberries:**

| Элемент | CSS селектор |
|---------|-------------|
| Карточка товара | `.product-card__wrapper`, `[class*="product-card"]` |
| Название | `.product-card__name`, `[class*="goods-name"]` |
| Текущая цена | `.product-card__price`, `[class*="lower-price"]` |
| Старая цена (без скидки) | `.product-card__old-price`, `[class*="old-price"]` |
| Рейтинг | `.product-card__rating`, `[class*="rating"]` |
| Количество отзывов | `.product-card__reviews`, `[class*="reviews-count"]` |
| Ссылка на товар | `a.product-card__link`, `a[href*="/catalog/"]` |
| Бренд | `.product-card__brand`, `[class*="brand-name"]` |

**Особенности Wildberries:**
- Цена может отображаться с картой WB (скидка) и без — извлекай обе
- Сортировка по цене: добавь параметр `&sort=priceasc` к URL поиска
- Сортировка по популярности: `&sort=popular`
- Wildberries — тяжёлый SPA, жди 4-5 секунд после загрузки

### Шаг 3: Ozon

```bash
# Открыть поиск Ozon
browser-use --headed open "https://www.ozon.ru/search/?text=QUERY"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"
browser-use state
```

**URL-паттерны Ozon:**

| Действие | URL |
|----------|-----|
| Поиск | `https://www.ozon.ru/search/?text=<запрос>` |
| Карточка товара | `https://www.ozon.ru/product/<slug>-<ID>/` |
| Отзывы | `https://www.ozon.com/product/<slug>-<ID>/reviews/` |

**Извлечение данных через eval:**

```bash
# Получить список товаров (первые 5)
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"tile\"], [data-widget=\"searchResultsV2\"] [class*=\"item\"]')).slice(0,5).map(el => ({name: el.querySelector('[class*=\"title\"], [class*=\"productName\"], a[class*=\"tile\"] span')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [class*=\"Price\"]')?.textContent?.trim()?.replace(/\\s+/g,' '), oldPrice: el.querySelector('[class*=\"oldPrice\"], [class*=\"crossed\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"stars\"], [class*=\"rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), link: el.querySelector('a[href*=\"/product/\"]')?.href})))"
```

**Селекторы Ozon:**

| Элемент | CSS селектор |
|---------|-------------|
| Карточка товара | `[class*="tile"]`, `[data-widget="searchResultsV2"] [class*="item"]` |
| Название | `[class*="title"]`, `[class*="productName"]` |
| Цена (с картой Ozon) | `[class*="price"]`, `[class*="Price"]` |
| Цена без карты | `[class*="oldPrice"]`, `[class*="crossed"]` |
| Рейтинг | `[class*="stars"]`, `[class*="rating"]` |
| Ссылка на товар | `a[href*="/product/"]` |

**Особенности Ozon:**
- Цена с картой Ozon Savings и без — часто разница 5-15%
- Ozon использует динамические CSS-классы с хешами — selectors могут меняться
- Если eval возвращает пустой результат — сделай `browser-use state` для актуальной структуры DOM
- Ozon Premium badge — товары с премиум-доставкой (бесплатная доставка)

### Шаг 4: Яндекс Маркет

```bash
# Открыть поиск Яндекс Маркет
browser-use --headed open "https://market.yandex.ru/search?text=QUERY"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"
browser-use state
```

**URL-паттерны Яндекс Маркет:**

| Действие | URL |
|----------|-----|
| Поиск | `https://market.yandex.ru/search?text=<запрос>` |
| Карточка товара | `https://market.yandex.ru/product/<ID>` |
| Сравнение цен | `https://market.yandex.ru/product/<ID>/offers` |
| Отзывы | `https://market.yandex.ru/product/<ID>/reviews` |
| История цен | `https://market.yandex.ru/product/<ID>` (вкладка «Цены») |

**Извлечение данных через eval:**

```bash
# Получить список товаров (первые 5)
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"search-result\"], [data-auto*=\"searchResult\"]')).slice(0,5).map(el => ({name: el.querySelector('[class*=\"title\"], [data-auto*=\"title\"], h3')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [data-auto*=\"price\"]')?.textContent?.trim(), oldPrice: el.querySelector('[class*=\"old-price\"], [class*=\"without-badge\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), shop: el.querySelector('[class*=\"shop\"], [class*=\"seller\"]')?.textContent?.trim(), link: el.querySelector('a[href*=\"/product/\"]')?.href})))"
```

**Селекторы Яндекс Маркет:**

| Элемент | CSS селектор |
|---------|-------------|
| Карточка товара | `[class*="search-result"]`, `[data-auto*="searchResult"]` |
| Название | `[class*="title"]`, `[data-auto*="title"]`, `h3` |
| Цена | `[class*="price"]`, `[data-auto*="price"]` |
| Рейтинг | `[class*="rating"]`, `[class*="stars"]` |
| Продавец/магазин | `[class*="shop"]`, `[class*="seller"]` |
| Ссылка на товар | `a[href*="/product/"]` |

**Особенности Яндекс Маркет:**
- Яндекс Маркет — агрегатор: один и тот же товар могут продавать разные магазины
- Страница «Все предложения» (`/offers`) показывает все цены на один товар
- Есть встроенная история цен — показывает была ли скидка реальной
- Рейтинг основан на реальных отзывах с подтверждением покупки

### Шаг 1: Извлечь данные из исходной ссылки

```bash
# Открыть ссылку пользователя
browser-use --headed open "<URL_пользователя>"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"
browser-use state
```

**Извлечь ключевые данные:**

```bash
# Wildberries — извлечь название и артикул
browser-use eval "JSON.stringify({name: document.querySelector('.product-page__header, [class*=\"product-name\"]')?.textContent?.trim(), brand: document.querySelector('.product-page__brand, [class*=\"brand\"]')?.textContent?.trim(), article: document.querySelector('[class*=\"article\"], [class*=\"vendor-code\"]')?.textContent?.trim(), price: document.querySelector('.product-page__price, [class*=\"lower-price\"]')?.textContent?.trim()})"

# Ozon — извлечь название
browser-use eval "JSON.stringify({name: document.querySelector('h1, [class*=\"title\"]')?.textContent?.trim(), price: document.querySelector('[class*=\"price\"]')?.textContent?.trim()})"

# Яндекс Маркет — извлечь название
browser-use eval "JSON.stringify({name: document.querySelector('h1, [class*=\"title\"]')?.textContent?.trim(), price: document.querySelector('[class*=\"price\"]')?.textContent?.trim()})"
```

## Расчёт цены за единицу

Сравнение цены за единицу — честнее чем сравнение полной цены.

```bash
# Извлечь вес/объём из названия или характеристик
browser-use eval "const t = document.querySelector('h1, [class*=\"title\"]')?.textContent || ''; const m = t.match(/(\\d+[.,]?\\d*)\\s*(мл|л|г|кг|шт|упак|капс|таб|пакет|рулон)/i); m ? m[0] : 'unknown'"
```

### Правила расчёта

| Единица | Конвертация | Пример |
|---------|-------------|--------|
| мл | ×1 | 500 мл = 500 единиц |
| л | ×1000 → мл | 1.5 л = 1500 мл |
| г | ×1 | 400 г = 400 единиц |
| кг | ×1000 → г | 0.5 кг = 500 г |
| шт | ×1 | 20 шт = 20 единиц |
| упак | разобрать что внутри | 6 шт × 5 упак = 30 шт |
| капс | ×1 | 30 капсул = 30 единиц |
| таб | ×1 | 60 таблеток = 60 единиц |

**Формула:** `Цена за единицу = Цена / Количество единиц`

## Оценка стоимости доставки

### Wildberries

- Доставка до пункта выдачи: **бесплатно** при заказе от 500₽ (в Depends on location)
- Доставка курьером: от 199₽
- Экспресс-доставка: от 299₽
- Срок: 1-2 дня обычно

### Ozon

- Доставка до пункта выдачи: **бесплатно** с Ozon Premium (подписка)
- Без Premium: от 49₽ при заказе от 600₽
- Доставка курьером: от 99₽ (бесплатно с Premium)
- Срок: 1-5 дней в зависимости от региона

### Яндекс Маркет

- Доставка: **бесплатно** от 300-500₽ (зависит от продавца)
- Экспресс: от 199₽
- Срок: от 1 дня (Москва, СПб), 2-5 дней (регионы)
- Яндекс Плюс: бесплатная доставка на многие товары

**При расчёте итоговой стоимости учитывай доставку:**

```
Итоговая стоимость (с доставкой):
- Wildberries: 1 299 ₽ + 0 ₽ = 1 299 ₽
- Ozon: 1 450 ₽ + 99 ₽ = 1 549 ₽ (без Premium)
- Яндекс Маркет: 1 190 ₽ + 0 ₽ = 1 190 ₽
```

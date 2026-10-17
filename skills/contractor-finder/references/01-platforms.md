## Оглавление
- Платформа 1: Profi.ru
- Платформа 2: Avito Услуги
- Платформа 3: Яндекс.Услуги
- Платформа 4: YouDo

## Платформа 1: Profi.ru

Крупнейший маркетпллейс услуг в России. Хорошие фильтры, рейтинги, портфолио, верификация мастеров.

### URL-структура

| Действие | URL |
|----------|-----|
| Категория | `https://profi.ru/{category}/` |
| Поиск | `https://profi.ru/search/?q={query}&location={city}` |
| Профиль мастера | `https://profi.ru/profile/{id}/` |
| Отзывы мастера | `https://profi.ru/profile/{id}/otzyvy/` |
| Портфолио | `https://profi.ru/profile/{id}/portfolio/` |

### Параметры поиска

| Параметр | Описание | Пример |
|-----------|----------|--------|
| `q` | Поисковый запрос (URL-encoded) | `q=сантехник+замена+трубы` |
| `location` | Город | `location=Москва` |
| `sort` | Сортировка | `sort=rating`, `sort=price_asc`, `sort=price_desc` |
| `page` | Страница | `page=1` |

### Извлечение данных через eval

```bash
# Список мастеров на странице поиска
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[data-testid=\"master-card\"], .master-card, [class*=\"SearchResults\"] [class*=\"card\"], [class*=\"search-result\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"], [class*=\"title\"], a[class*=\"link\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"], [class*=\"Rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [class*=\"Price\"], [class*=\"rate\"]')?.textContent?.trim(), verified: el.querySelector('[class*=\"verified\"], [class*=\"badge\"], [class*=\"confirm\"]') ? 'Да' : 'Нет', description: el.querySelector('[class*=\"description\"], [class*=\"about\"], p')?.textContent?.trim()?.substring(0, 200), link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

### Селекторы Profi.ru

| Элемент | CSS селектор |
|---------|-------------|
| Карточка мастера | `[data-testid="master-card"]`, `.master-card`, `[class*="SearchResults"] [class*="card"]` |
| Имя | `[class*="name"]`, `[class*="title"]`, `a[class*="link"]` |
| Рейтинг | `[class*="rating"]`, `[class*="Rating"]`, `[class*="stars"]` |
| Количество отзывов | `[class*="review"]`, `[class*="count"]` |
| Цена / ставка | `[class*="price"]`, `[class*="Price"]`, `[class*="rate"]` |
| Значок верификации | `[class*="verified"]`, `[class*="badge"]`, `[class*="confirm"]` |
| Описание | `[class*="description"]`, `[class*="about"]`, `p` |
| Ссылка на профиль | `a[href*="/profile/"]` |
| Портфолио фото | `[class*="portfolio"] img`, `[class*="gallery"] img` |
| Время ответа | `[class*="response"]`, `[class*="reply"]` |

### Профиль мастера — детальное извлечение

```bash
# Открыть профиль
browser-use --headed open "https://profi.ru/profile/{id}/"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Полная информация о мастере
browser-use eval "JSON.stringify({name: document.querySelector('h1, [class*=\"name\"]')?.textContent?.trim(), rating: document.querySelector('[class*=\"rating\"], [class*=\"Rating\"]')?.textContent?.trim(), reviews: document.querySelector('[class*=\"review-count\"], [class*=\"reviewsCount\"]')?.textContent?.trim(), price: document.querySelector('[class*=\"price\"], [class*=\"rate\"]')?.textContent?.trim(), verified: document.querySelector('[class*=\"verified\"]') ? 'Да' : 'Нет', responseTime: document.querySelector('[class*=\"response\"], [class*=\"reply\"]')?.textContent?.trim(), description: document.querySelector('[class*=\"about\"], [class*=\"description\"]')?.textContent?.trim()?.substring(0, 500), portfolioCount: document.querySelectorAll('[class*=\"portfolio\"] img, [class*=\"gallery\"] img').length, completedTasks: document.querySelector('[class*=\"completed\"], [class*=\"tasks\"]')?.textContent?.trim()})"
```

### Отзывы

```bash
# Перейти к отзывам
browser-use --headed open "https://profi.ru/profile/{id}/otzyvy/"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Извлечь последние 10 отзывов
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"review\"], [class*=\"Review\"], [class*=\"feedback\"]')).slice(0,10).map(el => ({rating: el.querySelector('[class*=\"stars\"], [class*=\"rating\"]')?.textContent?.trim(), text: el.querySelector('[class*=\"text\"], [class*=\"body\"], [class*=\"content\"]')?.textContent?.trim()?.substring(0, 300), author: el.querySelector('[class*=\"author\"], [class*=\"name\"]')?.textContent?.trim(), date: el.querySelector('[class*=\"date\"]')?.textContent?.trim()})))"
```

### Особенности Profi.ru

- Рейтинг из 5 звёзд, основан на подтверждённых отзывах
- «Проверенный мастер» — верификация документов и телефонов
- «Быстрый ответ» — отвечает в течение 30 минут
- Цены часто указаны как «от X ₽» — уточняй у мастера
- Портфолио — загруженные мастером фото выполненных работ
- Часть функций доступна только авторизованным пользователям

## Платформа 2: Avito Услуги

Крупнейший классифайд России с разделом услуг. Много исполнителей, но хуже модерируемых.

### URL-структура

| Действие | URL |
|----------|-----|
| Категория | `https://www.avito.ru/{city}/uslugi/{category}` |
| Поиск | `https://www.avito.ru/{city}/uslugi?q={query}` |
| Объявление исполнителя | `https://www.avito.ru/{city}/uslugi/{slug}-{id}` |
| Отзывы | На странице объявления (внизу) |

### Параметры поиска

| Параметр | Описание | Пример |
|-----------|----------|--------|
| `q` | Поисковый запрос | `q=электрик` |
| `priceMin` | Минимальная цена | `priceMin=1000` |
| `priceMax` | Максимальная цена | `priceMax=5000` |
| `sort` | Сортировка | `sort=price`, `sort=date`, `sort=rating` |
| `page` | Страница | `page=1` |
| `user` | ID продавца | `user=12345678` |

### Популярные города (slug для URL)

| Город | Slug |
|-------|------|
| Москва | `moskva` |
| Санкт-Петербург | `sankt-peterburg` |
| Новосибирск | `novosibirsk` |
| Екатеринбург | `ekaterinburg` |
| Казань | `kazan` |
| Краснодар | `krasnodar` |
| Нижний Новгород | `nizhniy_novgorod` |
| Самара | `samara` |
| Ростов-на-Дону | `rostov-na-donu` |
| Челябинск | `chelyabinsk` |

### Извлечение данных через eval

**ВАЖНО: Avito имеет агрессивную антибот-защиту. Минимизируй количество вызовов `state`. Используй `eval` для извлечения данных.**

```bash
# Список объявлений на странице поиска
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[data-marker=\"item\"], [class*=\"iva-item\"]')).slice(0,10).map(el => ({name: el.querySelector('[itemprop=\"name\"], [class*=\"title\"], h3, a[class*=\"link\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [itemprop=\"price\"], meta[content]')?.getAttribute('content') || el.querySelector('[class*=\"price\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), location: el.querySelector('[class*=\"geo\"], [class*=\"location\"]')?.textContent?.trim(), date: el.querySelector('[class*=\"date\"]')?.textContent?.trim(), link: el.querySelector('a[itemprop=\"url\"], a[href*=\"/uslugi/\"]')?.href})))"
```

### Селекторы Avito Услуги

| Элемент | CSS селектор |
|---------|-------------|
| Карточка объявления | `[data-marker="item"]`, `[class*="iva-item"]` |
| Название | `[itemprop="name"]`, `[class*="title"]`, `h3` |
| Цена | `[class*="price"]`, `[itemprop="price"]` |
| Рейтинг | `[class*="rating"]`, `[class*="stars"]` |
| Количество отзывов | `[class*="review"]`, `[class*="count"]` |
| Геолокация | `[class*="geo"]`, `[class*="location"]` |
| Дата публикации | `[class*="date"]` |
| Ссылка | `a[itemprop="url"]`, `a[href*="/uslugi/"]` |
| «На сайте с» | `[class*="registration"], [class*="member-since"]` |
| Фото | `[class*="photo"] img`, `[class*="image"] img` |

### Страница объявления — детальное извлечение

```bash
# Открыть объявление
browser-use --headed open "https://www.avito.ru/{city}/uslugi/{slug}-{id}"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Полная информация
browser-use eval "JSON.stringify({name: document.querySelector('h1, [class*=\"title\"]')?.textContent?.trim(), price: document.querySelector('[class*=\"price\"], [class*=\"Price\"]')?.textContent?.trim(), rating: document.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim(), reviews: document.querySelector('[class*=\"review-count\"], [class*=\"count\"]')?.textContent?.trim(), description: document.querySelector('[class*=\"description\"], [class*=\"descriptionText\"]')?.textContent?.trim()?.substring(0, 500), memberSince: document.querySelector('[class*=\"registration\"], [class*=\"member\"]')?.textContent?.trim(), responseRate: document.querySelector('[class*=\"response\"], [class*=\"reply\"]')?.textContent?.trim(), location: document.querySelector('[class*=\"geo\"]')?.textContent?.trim(), photos: Array.from(document.querySelectorAll('[class*=\"photo\"] img, [class*=\"gallery\"] img, [class*=\"image\"] img')).slice(0,5).map(i => i.src)}))"
```

### Особенности Avito Услуги

- **Агрессивная антибот-защита**: минимизируй количество state-вызовов, используй eval
- Если появилась капча — попроси пользователя пройти её вручную в headed-режиме
- «На сайте с» — дата регистрации, важна для оценки надёжности
- Рейтинг основан на отзывах покупателей
- Много дублей — один исполнитель может иметь несколько объявлений
- Цены часто не указаны — «Цена не указана» или «Договорная»

## Платформа 3: Яндекс.Услуги

Сервис от Яндекса с верифицированными мастерами. Хорошая интеграция с экосистемой.

### URL-структура

| Действие | URL |
|----------|-----|
| Главная | `https://uslugi.yandex.ru/` |
| Категория | `https://uslugi.yandex.ru/{category}` |
| Поиск | `https://uslugi.yandex.ru/search?text={query}&location={city}` |
| Профиль исполнителя | `https://uslugi.yandex.ru/profile/{id}` |

### Параметры поиска

| Параметр | Описание | Пример |
|-----------|----------|--------|
| `text` | Поисковый запрос | `text=сантехник` |
| `location` | Город | `location=Москва` |
| `page` | Страница | `page=1` |
| `sort` | Сортировка | `sort=rating`, `sort=price` |

### Извлечение данных через eval

```bash
# Список исполнителей
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"search-result\"], [class*=\"SearchResult\"], [class*=\"executor\"], [data-testid*=\"card\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"], [class*=\"title\"], h3')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"], [class*=\"Rating\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [class*=\"Price\"]')?.textContent?.trim(), responseTime: el.querySelector('[class*=\"response\"], [class*=\"reply\"]')?.textContent?.trim(), verified: el.querySelector('[class*=\"verified\"], [class*=\"badge\"]') ? 'Да' : 'Нет', link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

### Селекторы Яндекс.Услуги

| Элемент | CSS селектор |
|---------|-------------|
| Карточка результата | `[class*="search-result"]`, `[class*="SearchResult"]`, `[data-testid*="card"]` |
| Имя | `[class*="name"]`, `[class*="title"]`, `h3` |
| Рейтинг | `[class*="rating"]`, `[class*="Rating"]` |
| Количество отзывов | `[class*="review"]`, `[class*="count"]` |
| Цена | `[class*="price"]`, `[class*="Price"]` |
| Время ответа | `[class*="response"]`, `[class*="reply"]` |
| Значок верификации | `[class*="verified"]`, `[class*="badge"]` |
| Ссылка на профиль | `a[href*="/profile/"]` |
| Фото работ | `[class*="portfolio"] img`, `[class*="gallery"] img` |

### Особенности Яндекс.Услуги

- «Проверенный Яндексом» — верификация документов
- Быстрый ответ — среднее время ответа по данным Яндекса
- Цены часто указаны как «от X ₽/час»
- Хорошие отзывы — модерация строже, чем на Avito
- Меньше исполнителей, чем на Profi.ru, но качество выше
- Для полной информации может потребоваться авторизация

## Платформа 4: YouDo

Маркетплейс для быстрых задач. Исполнители соревнуются ценой.

### URL-структура

| Действие | URL |
|----------|-----|
| Главная | `https://youdo.com/` |
| Категория | `https://youdo.com/{category}/` |
| Поиск | `https://youdo.com/search?text={query}` |
| Профиль исполнителя | `https://youdo.com/profile/{id}` |

### Категории YouDo

| Slug | Категория |
|------|-----------|
| `remont-kvartir` | Ремонт квартир |
| `santekhnika` | Сантехника |
| `elektrika` | Электрика |
| `uborka` | Уборка |
| `pereezd` | Переезд |
| `sborka-mebeli` | Сборка мебели |
| `konditsionery` | Кондиционеры |
| `okna` | Окна |
| `remont-bytovoy-tekhniki` | Ремонт бытовой техники |
| `kompyuternaya-pomoshch` | Компьютерная помощь |

### Извлечение данных через eval

```bash
# Список исполнителей
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"user-card\"], [class*=\"profile-card\"], [class*=\"executor\"], [class*=\"search-item\"]')).slice(0,10).map(el => ({name: el.querySelector('[class*=\"name\"], [class*=\"title\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim(), completedTasks: el.querySelector('[class*=\"completed\"], [class*=\"tasks-count\"]')?.textContent?.trim(), reviews: el.querySelector('[class*=\"review\"], [class*=\"count\"]')?.textContent?.trim(), price: el.querySelector('[class*=\"price\"], [class*=\"rate\"]')?.textContent?.trim(), link: el.querySelector('a[href*=\"/profile/\"]')?.href})))"
```

### Селекторы YouDo

| Элемент | CSS селектор |
|---------|-------------|
| Карточка исполнителя | `[class*="user-card"]`, `[class*="profile-card"]`, `[class*="executor"]` |
| Имя | `[class*="name"]`, `[class*="title"]` |
| Рейтинг | `[class*="rating"]`, `[class*="stars"]` |
| Выполненные задачи | `[class*="completed"]`, `[class*="tasks-count"]` |
| Отзывы | `[class*="review"]`, `[class*="count"]` |
| Цена | `[class*="price"]`, `[class*="rate"]` |
| Ссылка на профиль | `a[href*="/profile/"]` |

### Особенности YouDo

- «Выполненные задачи» — главный показатель опыта
- Цену часто не указывают — она формируется в чате
- Больше подходит для разовых задач, чем для крупных проектов
- Исполнители соревнуются за задачу — можно получить несколько предложений
- Меньше детализации профиля, чем на Profi.ru


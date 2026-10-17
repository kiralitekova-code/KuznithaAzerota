### Шаг 3: Поиск на каждой платформе

Для каждой платформы последовательно:

```bash
# Закрыть предыдущие сессии
browser-use close --all
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# Открыть сайт
browser-use --headed open "URL_ПОИСКА"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Проверить состояние
browser-use state
```

#### Cian — извлечение объявлений

```javascript
browser-use eval "
  const cards = document.querySelectorAll('[data-mark=\"GK_offer\"], article[data-name=\"CardComponent\"], [class*=\"cardContainer\"]');
  const results = [];
  cards.forEach(card => {
    const title = card.querySelector('[class*=\"title\"]')?.textContent?.trim() || '';
    const price = card.querySelector('[class*=\"price\"]')?.textContent?.trim() || '';
    const address = card.querySelector('[class*=\"address\"]')?.textContent?.trim() || '';
    const link = card.querySelector('a[href*=\"/cat.php\"]')?.href || card.querySelector('a')?.href || '';
    const metro = card.querySelector('[class*=\"underground\"]')?.textContent?.trim() || '';
    const area = card.querySelector('[class*=\"area\"]')?.textContent?.trim() || '';
    results.push({title, price, address, link, metro, area});
  });
  JSON.stringify(results);
"
```

#### Avito — извлечение объявлений

```javascript
browser-use eval "
  const items = document.querySelectorAll('[data-marker=\"item\"]');
  const results = [];
  items.forEach(item => {
    const title = item.querySelector('[itemprop=\"name\"]')?.textContent?.trim() || '';
    const price = item.querySelector('[itemprop=\"price\"]')?.content || item.querySelector('[class*=\"price\"]')?.textContent?.trim() || '';
    const address = item.querySelector('[class*=\"geo\"]')?.textContent?.trim() || '';
    const link = item.querySelector('a[itemprop=\"url\"]')?.href || '';
    const metro = item.querySelector('[class*=\"metro\"]')?.textContent?.trim() || '';
    const time = item.querySelector('[class*=\"date\"]')?.textContent?.trim() || '';
    results.push({title, price, address, link, metro, time});
  });
  JSON.stringify(results);
"
```

#### Яндекс.Недвижимость — извлечение объявлений

```javascript
browser-use eval "
  const offers = document.querySelectorAll('[class*=\"OfferCard\"], [class*=\"offer-card\"]');
  const results = [];
  offers.forEach(offer => {
    const title = offer.querySelector('[class*=\"title\"]')?.textContent?.trim() || '';
    const price = offer.querySelector('[class*=\"price\"]')?.textContent?.trim() || '';
    const address = offer.querySelector('[class*=\"address\"]')?.textContent?.trim() || '';
    const link = offer.querySelector('a')?.href || '';
    const metro = offer.querySelector('[class*=\"metro\"]')?.textContent?.trim() || '';
    const area = offer.querySelector('[class*=\"area\"]')?.textContent?.trim() || '';
    results.push({title, price, address, link, metro, area});
  });
  JSON.stringify(results);
"
```

### Шаг 5: Пагинация

Если результатов много, переходи на следующую страницу:

```bash
# Cian — перейти на страницу 2
browser-use --headed open "URL&page=2"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"
browser-use eval "..."

# Avito — перейти на страницу 2
browser-use click "text=Следующая"
# или через URL:
browser-use --headed open "URL&p=2"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Яндекс — перейти на страницу 2
browser-use --headed open "URL&page=2"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"
```

Собирай объявления с 2-3 страниц с каждой платформы. Обычно этого достаточно для хорошего покрытия.

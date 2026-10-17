# JavaScript Eval Snippets

Читай при извлечении данных через `browser-use eval` — универсальные проверки и детальные сниппеты по каждой площадке.

## JavaScript Eval Snippets

### Универсальные проверки

```bash
# Сколько товаров в выдаче?
browser-use eval "document.querySelectorAll('[class*=\"product-card\"], [class*=\"tile\"], [class*=\"search-result\"]').length"

# Название первого товара
browser-use eval "document.querySelector('[class*=\"product-name\"], [class*=\"title\"], h3')?.textContent?.trim()"

# Цена первого товара
browser-use eval "document.querySelector('[class*=\"price\"]')?.textContent?.trim()?.substring(0, 30)"

# Рейтинг
browser-use eval "document.querySelector('[class*=\"rating\"], [class*=\"stars\"]')?.textContent?.trim()"
```

### Wildberries — детальное извлечение

```bash
# Цена с картой и без
browser-use eval "const card = document.querySelector('[class*=\"lower-price\"]')?.textContent?.trim(); const noCard = document.querySelector('[class*=\"old-price\"]')?.textContent?.trim(); JSON.stringify({withCard: card, withoutCard: noCard})"

# Количество отзывов
browser-use eval "document.querySelector('[class*=\"reviews-count\"], [class*=\"feedback-count\"]')?.textContent?.trim()"

# Бренд
browser-use eval "document.querySelector('[class*=\"brand\"]')?.textContent?.trim()"

# Полная информация о первом товаре
browser-use eval "const c = document.querySelector('[class*=\"product-card\"]'); JSON.stringify({name: c?.querySelector('[class*=\"goods-name\"], [class*=\"name\"]')?.textContent?.trim(), price: c?.querySelector('[class*=\"lower-price\"]')?.textContent?.trim(), oldPrice: c?.querySelector('[class*=\"old-price\"]')?.textContent?.trim(), rating: c?.querySelector('[class*=\"rating\"]')?.textContent?.trim(), reviews: c?.querySelector('[class*=\"reviews-count\"]')?.textContent?.trim(), link: c?.querySelector('a')?.href})"
```

### Ozon — детальное извлечение

```bash
# Цена с Ozon Card и без
browser-use eval "const prices = document.querySelectorAll('[class*=\"Price\"]'); JSON.stringify({current: prices[0]?.textContent?.trim(), old: prices[1]?.textContent?.trim()})"

# Название и бренд
browser-use eval "const t = document.querySelector('[class*=\"title\"]')?.textContent?.trim(); JSON.stringify({full: t})"

# Данные первого товара в выдаче
browser-use eval "const c = document.querySelector('[class*=\"tile\"]'); JSON.stringify({name: c?.querySelector('[class*=\"title\"]')?.textContent?.trim(), price: c?.querySelector('[class*=\"Price\"]')?.textContent?.trim(), rating: c?.querySelector('[class*=\"stars\"]')?.textContent?.trim(), link: c?.querySelector('a')?.href})"
```

### Яндекс Маркет — детальное извлечение

```bash
# Все предложения на товар
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('[class*=\"offer\"]')).slice(0,10).map(el => ({price: el.querySelector('[class*=\"price\"]')?.textContent?.trim(), shop: el.querySelector('[class*=\"shop\"], [class*=\"seller\"]')?.textContent?.trim(), rating: el.querySelector('[class*=\"rating\"]')?.textContent?.trim()})))"

# Минимальная цена из предложений
browser-use eval "Math.min(...Array.from(document.querySelectorAll('[class*=\"offer\"] [class*=\"price\"]')).map(el => parseInt(el.textContent.replace(/\\D/g, ''))).filter(n => !isNaN(n)))"
```

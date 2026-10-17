# Добавление товара в корзину — полные команды

Читай при добавлении товаров: основной алгоритм и установка количества из SKILL.md.

## Основной алгоритм

Для каждого товара из списка:

```bash
# 1. Открыть страницу поиска
browser-use open "https://vkusvill.ru/search/?q=<название_товара>"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# 2. Закрыть модалки если появились
browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')?.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]')?.click()"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# 3. Проверить что товары загрузились
browser-use eval "document.querySelectorAll('.ProductCard, .GoodsCard, [class*=\"product-card\"]').length"
# Если 0 — товар не найден, попробовать другой запрос

# 4. Прочитать первый товар
browser-use eval "const c = document.querySelector('.ProductCard, .GoodsCard, [class*=\"product-card\"]'); JSON.stringify({name: c?.querySelector('.ProductCard__name, .GoodsCard__name, [class*=\"product-name\"]')?.textContent?.trim(), price: c?.querySelector('.ProductCard__price, .GoodsCard__price, [class*=\"price\"]')?.textContent?.trim(), weight: c?.querySelector('.ProductCard__weight, .GoodsCard__weight, [class*=\"weight\"]')?.textContent?.trim()})"

# 5. Получить state для определения индексов кнопок
browser-use state

# 6. Нажать кнопку «В корзину» на первом товаре
# Найти индекс кнопки добавления в state и нажать
browser-use click <add-to-cart-button-index>
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 7. Если нужно количество > 1 — установить количество (см. ниже)
```

## Установка количества

После первого нажатия «В корзину» появляются контролы количества.

```bash
# Определить тип товара (весовой или штучный)
browser-use eval "const input = document.querySelector('[class*=\"quantity\"] input, [class*=\"Quantity\"] input'); input ? (input.className.includes('_kg') ? 'weight' : 'pieces') : 'unknown'"

# ВАРИАНТ A: Товар весовой (кг) — вводим килограммы
# Например: 0.4 кг = 400г
browser-use state
browser-use click <quantity-input-index>
# Сначала очистить поле
browser-use keys "Control+a"
browser-use type "0.4"
browser-use keys "Enter"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# ВАРИАНТ B: Товар штучный (шт) — вводим количество
browser-use state
browser-use click <quantity-input-index>
browser-use keys "Control+a"
browser-use type "3"
browser-use keys "Enter"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# ВАРИАНТ C: Если input не находится — использовать кнопку "+"
# Нажать + нужное количество раз (для N штук нажать N-1 раз)
browser-use click <plus-button-index>
node -e "new Promise(r=>setTimeout(r,0.2*1000)).then(process.exit)"
browser-use click <plus-button-index>
node -e "new Promise(r=>setTimeout(r,0.2*1000)).then(process.exit)"
```

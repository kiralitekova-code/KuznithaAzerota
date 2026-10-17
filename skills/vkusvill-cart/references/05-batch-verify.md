# Проверка корзины и batch add mode — полные команды

Читай при добавлении списков товаров: проверка корзины, batch-добавление и оптимизация без state из SKILL.md.

## Проверка корзины

После добавления всех товаров:

```bash
# 1. Перейти в корзину
browser-use open "https://vkusvill.ru/cart/"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# 2. Закрыть модалки
browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')?.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]')?.click()"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# 3. Получить содержимое корзины
browser-use eval "JSON.stringify(Array.from(document.querySelectorAll('.ProductCard, .cart-item, [class*=\"basket-product\"]')).map(el => ({name: el.querySelector('.ProductCard__name, .GoodsCard__name, [class*=\"product-name\"]')?.textContent?.trim(), qty: el.querySelector('[class*=\"quantity\"], [class*=\"Quantity\"], [class*=\"CartButton__quantity\"]')?.textContent?.trim(), price: el.querySelector('.ProductCard__price, .GoodsCard__price, [class*=\"price\"]')?.textContent?.trim()})).filter(i => i.name && i.name.length > 2))"

# 4. Получить итоговую сумму
browser-use eval "document.querySelector('[class*=\"total\"], .DeliveryBasket__total, [class*=\"BasketTotal\"]')?.textContent?.trim()"

# 5. Проверить количество товаров
browser-use eval "document.querySelectorAll('.ProductCard, .cart-item, [class*=\"basket-product\"]').length"
```

## Принцип

1. Раздели товары на **штучные** (упак/шт) и **весовые** (кг)
2. Штучные — добавляй батчем через один eval
3. Весовые — обрабатывай отдельно после батча

## Штучные товары: batch-добавление

```bash
# 1. Открыть страницу поиска для товара
browser-use open "https://vkusvill.ru/search/?q=<товар>"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# 2. Закрыть модалки
browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')?.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]')?.click()"
node -e "new Promise(r=>setTimeout(r,0.3*1000)).then(process.exit)"

# 3. Проверить что есть карточки
browser-use eval "document.querySelectorAll('.ProductCard, .GoodsCard, [class*=\"product-card\"]').length"
# Если 0 — пробуй замену из таблицы замен (см. shopping-list)

# 4. Кликнуть «В корзину» на первом товаре (eval быстрее чем state + click)
browser-use eval "
  const btn = document.querySelector('[class*=\"add-to-cart\"], [class*=\"AddButton\"], button[class*=\"cart\"]') || document.querySelector('.ProductCard button, .GoodsCard button');
  if (btn) { btn.click(); 'clicked'; } else { 'no_button'; }
"
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 5. Если нужно количество > 1 — добавить через кнопку «+»
# НЕ делать state после каждого клика! Только eval для проверки
browser-use eval "
  const plus = document.querySelector('[class*=\"quantity-up\"], [class*=\"QuantityUp\"], button[aria-label*=\"плюс\"]');
  if (plus) { for(let i = 0; i < 2; i++) plus.click(); 'added_2'; } else { 'no_plus'; }
"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"
```

## Оптимизация: НЕ делай state на каждой странице

Для штучных товаров, когда структура страницы уже известна:
- **Первые 3 товара** — делай `state` для проверки
- **После этого** — используй только `eval` для клика и проверки
- **Делай `state` только** при сбоях или если DOM не реагирует

```bash
# Быстрая проверка вместо полного state
# Товары загрузились?
browser-use eval "document.querySelectorAll('[class*=\"product-card\"], .ProductCard').length"

# Добавился?
browser-use eval "document.querySelector('[class*=\"cart-count\"], .HeaderCart__count')?.textContent?.trim()"
```

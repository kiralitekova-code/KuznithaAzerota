# JavaScript eval-сниппеты и оптимизация state

Читай для быстрых проверок без полного state: готовые eval-сниппеты и правила из SKILL.md.

## JavaScript Eval Snippets

```bash
# Проверить авторизацию
browser-use eval "!!document.querySelector('[class*=\"user\"], [class*=\"profile\"], .HeaderUser')"

# Посчитать товары в выдаче поиска
browser-use eval "document.querySelectorAll('.ProductCard, .GoodsCard, [class*=\"product-card\"]').length"

# Получить название первого товара
browser-use eval "document.querySelector('.ProductCard__name, .GoodsCard__name, [class*=\"product-name\"]')?.textContent?.trim()"

# Получить цену первого товара
browser-use eval "document.querySelector('.ProductCard__price, .GoodsCard__price, [class*=\"price\"]')?.textContent?.trim()"

# Проверить наличие адреса
browser-use eval "document.querySelector('[class*=\"address\"], [class*=\"AddressButton\"]')?.textContent?.trim()?.substring(0, 50)"

# Счётчик товаров в корзине (в шапке)
browser-use eval "document.querySelector('[class*=\"cart-count\"], [class*=\"CartCount\"], .HeaderCart__count')?.textContent?.trim()"

# Закрыть все модалки
browser-use eval "document.querySelectorAll('[class*=\"modal\"], [class*=\"popup\"], [class*=\"Modal\"]').forEach(m => { const c = m.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]'); if(c) c.click(); })"
```

## Правила

- **Делай `state`** только: в начале сессии, при смене структуры страницы, при сбоях
- **НЕ делай `state`** на каждой странице поиска если уже знаешь структуру
- **Используй `eval`** для точечных проверок вместо полного `state`

## Быстрые eval-сниппеты для типовых проверок

```bash
# Есть ли карточки товаров?
browser-use eval "document.querySelectorAll('[class*=\"product-card\"], .ProductCard, .GoodsCard').length"

# Название первого товара
browser-use eval "document.querySelector('[class*=\"product-name\"], .ProductCard__name, .GoodsCard__name')?.textContent?.trim()"

# Цена первого товара
browser-use eval "document.querySelector('[class*=\"price\"]')?.textContent?.trim()?.substring(0, 30)"

# Какой текст у N-й кнопки?
browser-use eval "document.querySelectorAll('button')[N]?.textContent?.trim()"

# Сколько товаров в корзине (счётчик в шапке)?
browser-use eval "document.querySelector('[class*=\"cart-count\"], .HeaderCart__count')?.textContent?.trim()"

# Добавился ли товар? (проверить что счётчик увеличился)
browser-use eval "document.querySelector('[class*=\"cart-count\"], .HeaderCart__count')?.textContent?.trim()"
```

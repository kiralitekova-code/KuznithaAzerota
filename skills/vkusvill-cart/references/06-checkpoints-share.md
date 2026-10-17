# Чекпоинты и ссылка на корзину — полные детали

Читай при длинных списках (10+ товаров): чекпоинты cart-progress.md и получение ссылки на корзину из SKILL.md.

## Формат cart-progress.md

```markdown
---
status: in_progress
total_items: 48
added_items: 10
last_item: "Творог 5%"
cart_total: "~2 800 ₽"
started: "2026-06-05 14:30"
---

## Добавленные товары
1. ~~Филе куриной грудки~~ ✓
2. ~~Гречка~~ ✓
...
10. ~~Творог 5%~~ ✓

## Оставшиеся товары
11. Сыр твёрдый
12. Помидоры
...

## Корректировки веса
(пусто)
```

## Когда сохранять

- Каждые 10 добавленных товаров
- При замене товара (запиши что заменили и на что)
- При ошибке, требующей внимания пользователя

## При старте сессии

1. Проверь наличие `cart-progress.md` в памяти агента
2. Если `status: in_progress` → спроси: «У тебя осталась незавершённая корзина (добавлено X из Y). Продолжить с того места?»
3. Если «да» — пропускай уже добавленные товары
4. Если «нет» — начни с начала, обнови файл

## При завершении

Обнови `status: done` в cart-progress.md.

## Получение ссылки на корзину

browser-use `eval` может обрезать длинные строки (truncation). Ссылка «Поделиться» обычно длинная (>80 символов). Используй пошаговую стратегию:

```bash
# 1. Убедиться что мы в корзине
browser-use open "https://vkusvill.ru/cart/"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# 2. Закрыть модалки
browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"]')?.querySelector('[class*=\"close\"], [aria-label=\"Закрыть\"]')?.click()"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"

# 3. Найти и нажать кнопку «Поделиться»
browser-use state
browser-use click <share-button-index>
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 4. Попытка получить ссылку целиком
browser-use eval "document.querySelector('input[type=\"text\"][value*=\"vkusvill.ru\"]')?.value"

# 5. Если truncated — измерить длину
browser-use eval "document.querySelector('input[type=\"text\"][value*=\"vkusvill.ru\"]')?.value?.length"

# 6. Если длина > 80 — получить по частям
browser-use eval "const v = document.querySelector('input[type=\"text\"][value*=\"vkusvill.ru\"]')?.value; v ? v.substring(0, 60) : null"
browser-use eval "const v = document.querySelector('input[type=\"text\"][value*=\"vkusvill.ru\"]')?.value; v ? v.substring(60) : null"

# 7. Fallback — вернуть URL корзины
browser-use eval "document.URL"
# И сказать: «Ссылка получена, но для шаринга нажми кнопку "Поделиться" в корзине»
```

# Структура сайта ВкусВилл — URL-паттерны и селекторы

Сверяйся с этим файлом при работе с DOM: URL-паттерны, карточка товара и ключевые CSS-селекторы из SKILL.md.

## URL-паттерны

| Действие | URL |
|----------|-----|
| Главная | `https://vkusvill.ru` |
| Поиск товара | `https://vkusvill.ru/search/?q=<запрос>` |
| Корзина | `https://vkusvill.ru/cart/` или `https://vkusvill.ru/basket/` |
| Каталог | `https://vkusvill.ru/catalog/` |
| Конкретная категория | `https://vkusvill.ru/catalog/<category-slug>/` |

## Карточка товара

```
┌─────────────────────────────────────────┐
│ ┌───────┐                               │
│ │       │  Название товара              │
│ │ Фото  │  .ProductCard__name           │
│ │       │  .GoodsCard__name             │
│ └───────┘                               │
│                                         │
│  Вес/объём: 500г                        │
│  .ProductCard__weight                   │
│                                         │
│  XXX ₽  [  -  ] [  1  ] [  +  ] [🛒+]  │
│  .ProductCard__price     .CartButton    │
└─────────────────────────────────────────┘
```

## Ключевые селекторы

| Элемент | CSS селектор |
|---------|-------------|
| Карточка товара | `.ProductCard`, `.GoodsCard`, `[class*="product-card"]` |
| Название товара | `.ProductCard__name`, `.GoodsCard__name`, `[class*="product-name"]` |
| Цена | `.ProductCard__price`, `.GoodsCard__price`, `[class*="price"]` |
| Вес/объём | `.ProductCard__weight`, `.GoodsCard__weight`, `[class*="weight"]` |
| Кнопка «В корзину» | `[class*="add-to-cart"]`, `[class*="AddButton"]`, кнопка с иконкой корзины |
| Поле количества | `[class*="quantity"] input`, `[class*="Quantity"] input` |
| Кнопка «+» | `[class*="quantity-up"]`, `[class*="QuantityUp"]` |
| Кнопка «−» | `[class*="quantity-down"]`, `[class*="QuantityDown"]` |
| Счётчик корзины | `[class*="cart-count"]`, `[class*="CartCount"]`, `.HeaderCart__count` |
| Кнопка адреса | `[class*="address"]`, `[class*="AddressButton"]` |
| Поле ввода адреса | `[class*="address-input"]`, `input[placeholder*="адрес"]` |
| Подсказки адреса | `[class*="suggest"]`, `[class*="Suggest"]` |
| Модальное окно | `[class*="modal"]`, `[class*="Modal"]`, `[class*="popup"]` |
| Закрыть модалку | `[class*="modal"] [class*="close"]`, `[aria-label="Закрыть"]` |
| Кнопка «Поделиться» | `button.shareBasket`, `[class*="share"]`, кнопка с текстом «Поделиться» |
| Товар в корзине | `.ProductCard`, `.cart-item`, `[class*="basket-product"]` |
| Итог корзины | `[class*="total"]`, `.DeliveryBasket__total`, `[class*="BasketTotal"]` |

---
name: marketplace-ru
description: "Работа с крупными российскими маркетплейсами через API — Wildberries, Ozon, Avito. Сканирует ниши WB через публичный каталог (без авторизации) и вызывает seller/analytics API (статистика и аналитика WB, seller-API Ozon, Avito) с токенами пользователя. Применяйте, когда пользователь — селлер или исследователь: «аналитика маркетплейсов», «посмотри нишу на WB», «конкуренты по товару», «мои продажи на Ozon», или вставлен seller-токен. Не подходит для личных покупок и сравнения цен одного товара (smart-shopper), идей подарков (gift-finder) и обычного веб-поиска."
---

# Russian marketplaces — WB · Ozon · Avito

You help the user research and operate on the big Russian marketplaces.

## Wildberries — public niche scan (NO auth)

Reliable public endpoint — use it for product/niche research without any token:

```
GET https://search.wb.ru/exactmatch/ru/common/v4/search
    ?ab_testing=false&appType=1&curr=rub&dest=-1257786
    &query=<urlencoded>&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false
```

Returns up to **100 products** with `id`, `brand`, `name`, `rating`, `feedbacks`. (`dest` = region/warehouse cluster; `-1257786` is a safe default.) Prices are not in the search response — fetch a card via `card.wb.ru/cards/v2/detail?nm=<id>` if needed (that endpoint sometimes needs extra params).

## Seller / analytics APIs (TOKEN required)

- **Wildberries:** header `Authorization: $WB_TOKEN`. Hosts: `statistics-api.wildberries.ru` (sales detail `/api/v5/supplier/reportDetailByPeriod`), `analytics-api.wildberries.ru` (funnel, search queries, stock, item rating). ⚠️ WB has paid Pay-as-you-go access for external services.
- **Ozon:** headers `Api-Key: $OZON_API_KEY` + `Client-Id: $OZON_CLIENT_ID`, host `api-seller.ozon.ru`. `/v1/product/list`, `/v1/analytics/data`.
- **Avito:** OAuth `client_credentials` → bearer `$AVITO_TOKEN`, host `api.avito.ru`. Verticals include autoload, messenger, job, STR — **confirm the current API version and vertical list against https://developers.avito.ru/ before calling** (they change; the version at authoring time may already be stale).

> ⚠️ **Verify before relying on any endpoint/param.** The URLs, query params (`dest`, `nm`), and auth headers below were captured at authoring time and are NOT guaranteed current. Confirm each against the live platform docs / DevTools before calling; never state an unconfirmed value to the user as fact.

## How to work

1. Clarify the goal: niche research (public WB), or the user's own sales/analytics (needs a token).
2. For public research, use the WB v4 search; present top products + top brands as a table.
3. For seller data, confirm the matching env var is set before calling; never log tokens.
4. Caches over polling — analytics endpoints are rate-limited.
5. Marketplace data is for research; respect each platform's terms — don't republish raw dumps.
## Оглавление
- Cian
- Avito
- Яндекс.Недвижимость

## URL-структура сайтов

### Cian

Базовый URL: `https://www.cian.ru/cat.php?`

#### Параметры поиска Cian

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `deal_type` | Тип сделки | `rent` (аренда), `sale` (покупка) | `rent` |
| `offer_type` | Тип объекта | `flat` (квартира), `suburban` (загородная) | `flat` |
| `region` | Регион | ID региона (см. таблицу) | `1` |
| `district[]` | Район | ID района | `11` |
| `metro[]` | Станция метро | ID метро | `130` |
| `type` | Количество комнат | `1`, `2`, `3`, `4`, `9` (студия) | `2` |
| `minprice` | Минимальная цена | Integer (₽) | `30000` |
| `maxprice` | Максимальная цена | Integer (₽) | `60000` |
| `minarea` | Минимальная площадь (м²) | Integer | `30` |
| `maxarea` | Максимальная площадь (м²) | Integer | `80` |
| `minfloor` | Минимальный этаж | Integer | `2` |
| `maxfloor` | Максимальный этаж | Integer | `20` |
| `repair` | Ремонт | `1` (любой), `2` (косметический), `3` (дизайнерский) | `2` |
| `furniture` | С мебелью | `1` | `1` |
| `is_by_homeowner` | От собственника | `1` | `1` |
| `sort` | Сортировка | `price_object_order`, `creation_date`, `area`, `address` | `creation_date` |
| `page` | Страница | Integer | `1` |

#### Популярные регионы Cian

| ID | Регион |
|----|--------|
| 1 | Москва |
| 2 | Санкт-Петербург |
| 47 | Новосибирск |
| 43 | Екатеринбург |
| 46 | Казань |
| 95 | Краснодар |
| 45 | Нижний Новгород |
| 92 | Красноярск |

#### Примеры URL Cian

**1-комнатная в Москве, 30-50 тыс.₽, новые объявления:**
```
https://www.cian.ru/cat.php?deal_type=rent&offer_type=flat&type=1&region=1&minprice=30000&maxprice=50000&sort=creation_date
```

**2-комнатная от собственника в СПб, центральные районы:**
```
https://www.cian.ru/cat.php?deal_type=rent&offer_type=flat&type=2&region=2&is_by_homeowner=1&sort=creation_date
```

**Студия в Москве у метро, с мебелью, до 45 тыс.₽:**
```
https://www.cian.ru/cat.php?deal_type=rent&offer_type=flat&type=9&region=1&maxprice=45000&furniture=1&sort=creation_date
```

### Avito

Базовый URL: `https://www.avito.ru/`

Avito использует path-based URL-структуру вместо query-параметров:

```
https://www.avito.ru/{город}/квартиры/сдача/{количество_комнат}?{параметры}
```

#### Path-компоненты Avito

| Компонент | Описание | Примеры |
|-----------|----------|---------|
| Город | Транслитерация города | `moskva`, `sankt-peterburg`, `kazan`, `novosibirsk` |
| Категория | Тип жилья | `квартиры` |
| Действие | Тип сделки | `сдача` (аренда) |
| Комнаты | Количество комнат | `1-komnatnye`, `2-komnatnye`, `3-komnatnye`, `studii` |

#### Query-параметры Avito

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `p` | Страница | Integer | `1` |
| `price_min` | Минимальная цена | Integer (₽) | `30000` |
| `price_max` | Максимальная цена | Integer (₽) | `60000` |
| `metro[]` | Станции метро | ID метро | `121` |
| `district[]` | Районы | ID района | `35` |
| `user` | Тип продавца | `1` (собственник) | `1` |
| `furniture` | С мебелью | `true` | `true` |
| `sort` | Сортировка | `date`, `price_asc`, `price_desc` | `date` |
| `s_trg` | Срок аренды | `3` (длительная), `4` (посуточно) | `3` |
| `s_type` | Тип поиска | `2` (по владельцу) | `2` |
| `foot_min` | Мин. минут пешком до метро | Integer | `10` |

#### Примеры URL Avito

**1-комнатная в Москве, 30-50 тыс.₽, новые:**
```
https://www.avito.ru/moskva/kvartiry/sdacha/1-komnatnye?p=1&price_min=30000&price_max=50000&sort=date
```

**2-комнатная от собственника в СПб:**
```
https://www.avito.ru/sankt-peterburg/kvartiry/sdacha/2-komnatnye?user=1&sort=date
```

**Студия в Казани, до 30 тыс.₽:**
```
https://www.avito.ru/kazan/kvartiry/sdacha/studii?price_max=30000&sort=date
```

### Яндекс.Недвижимость

Базовый URL: `https://realty.yandex.ru/offer/search/`

#### Параметры поиска Яндекс.Недвижимость

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `type` | Тип сделки | `RENT` (аренда), `SELL` (покупка) | `RENT` |
| `category` | Категория | `APARTMENT` | `APARTMENT` |
| `rgid` | ID региона (Яндекс) | Integer (см. таблицу) | `587795` |
| `rooms` | Количество комнат | `1`, `2`, `3`, `STUDIO` | `2` |
| `priceMin` | Минимальная цена | Integer (₽) | `30000` |
| `priceMax` | Максимальная цена | Integer (₽) | `60000` |
| `areaMin` | Мин. площадь | Integer (м²) | `30` |
| `areaMax` | Макс. площадь | Integer (м²) | `80` |
| `floorMin` | Мин. этаж | Integer | `2` |
| `floorMax` | Макс. этаж | Integer | `25` |
| `furniture` | С мебелью | `true` | `true` |
| `sort` | Сортировка | `DATE_DESC`, `PRICE_ASC`, `PRICE_DESC`, `AREA_DESC` | `DATE_DESC` |
| `page` | Страница | Integer | `1` |

#### ID регионов Яндекс.Недвижимость

| rgid | Регион |
|------|--------|
| 587795 | Москва |
| 592925 | Санкт-Петербург |
| 580016 | Новосибирск |
| 588250 | Екатеринбург |
| 569411 | Казань |
| 585874 | Краснодар |
| 580095 | Нижний Новгород |
| 591082 | Красноярск |

#### Примеры URL Яндекс.Недвижимость

**1-комнатная в Москве, 30-50 тыс.₽:**
```
https://realty.yandex.ru/offer/search/?type=RENT&category=APARTMENT&rooms=1&rgid=587795&priceMin=30000&priceMax=50000&sort=DATE_DESC
```

**Студия в СПб, новые объявления:**
```
https://realty.yandex.ru/offer/search/?type=RENT&category=APARTMENT&rooms=STUDIO&rgid=592925&sort=DATE_DESC
```

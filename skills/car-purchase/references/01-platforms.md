Оглавление:
1. Auto.ru (Яндекс) — параметры поиска, популярные регионы (geo_id), примеры URL
2. Drom.ru — параметры поиска, популярные города, примеры URL
3. Avito Авто — path-компоненты, query-параметры, примеры URL

## URL-структура площадок

### Auto.ru (Яндекс)

Базовый URL: `https://auto.ru/cars/{brand}/{model}/used/`

#### Параметры поиска Auto.ru

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `geo_id` | Регион | ID региона (см. таблицу) | `213` |
| `price_from` | Мин. цена | Integer (₽) | `500000` |
| `price_to` | Макс. цена | Integer (₽) | `1500000` |
| `year_from` | Год от | Integer | `2015` |
| `year_to` | Год до | Integer | `2021` |
| `km_age_from` | Пробег от | Integer (км) | `0` |
| `km_age_to` | Пробег до | Integer (км) | `150000` |
| `engine_group` | Двигатель | `BENZIN`, `DIESEL`, `HYBRID` | `BENZIN` |
| `transmission` | КПП | `AUTOMATIC`, `MECHANICAL`, `ROBOT`, `VARIATOR` | `AUTOMATIC` |
| `body_type_group` | Кузов | `SEDAN`, `HATCHBACK`, `ALLROAD`, `WAGON`, `MINIVAN`, `COUPE`, `PICKUP` | `SEDAN` |
| `drive_group` | Привод | `FRONT_DRIVE`, `REAR_DRIVE`, `ALL_WHEEL_DRIVE` | `FRONT_DRIVE` |
| `seller_group` | Продавец | `COMMERCIAL` (дилер), `PRIVATE` (частное) | `PRIVATE` |
| `owners_count_group` | Кол-во владельцев | `ONE`, `TWO`, `THREE_OR_MORE` | `ONE` |
| `state_group` | Состояние | `NOT_BEATEN`, `PERFECT` | `NOT_BEATEN` |
| `sort` | Сортировка | `price-asc`, `price-desc`, `date`, `mileage`, `relevance` | `date` |
| `page` | Страница | Integer | `1` |
| `output_type` | Формат вывода | `list` | `list` |

#### Популярные регионы Auto.ru (geo_id)

| geo_id | Регион |
|--------|--------|
| 213 | Москва |
| 2 | Санкт-Петербург |
| 54 | Новосибирск |
| 1 | Москва и МО |
| 47 | Екатеринбург |
| 64 | Красноярск |
| 92 | Краснодар |
| 10174 | Татарстан (Казань) |
| 56 | Нижний Новгород |
| 116 | Приморский край (Владивосток) |

#### Примеры URL Auto.ru

**Toyota Camry 2018-2021, Москва, до 2 000 000 ₽:**
```
https://auto.ru/cars/toyota/camry/used/?geo_id=213&price_from=1500000&price_to=2000000&year_from=2018&year_to=2021&sort=date
```

**Kia Rio, автомат, передний привод, до 1 000 000 ₽, от частного лица:**
```
https://auto.ru/cars/kia/rio/used/?geo_id=213&price_to=1000000&transmission=AUTOMATIC&drive_group=FRONT_DRIVE&seller_group=PRIVATE&sort=date
```

**Кроссовер, до 1 500 000 ₽, не битый, один владелец:**
```
https://auto.ru/cars/used/?geo_id=213&price_to=1500000&body_type_group=ALLROAD&state_group=NOT_BEATEN&owners_count_group=ONE&sort=date
```

### Drom.ru

Базовый URL: `https://auto.drom.ru/{brand}/{model}/used/`

#### Параметры поиска Drom.ru

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `pricefrom` | Мин. цена | Integer (₽) | `500000` |
| `priceto` | Макс. цена | Integer (₽) | `1500000` |
| `yearfrom` | Год от | Integer | `2015` |
| `yearto` | Год до | Integer | `2021` |
| `runfrom` | Пробег от | Integer (тыс. км) | `0` |
| `runto` | Пробег до | Integer (тыс. км) | `150` |
| `transmission` | КПП | `1` (механика), `2` (автомат) | `2` |
| `drive` | Привод | `1` (задний), `2` (передний), `3` (полный) | `2` |
| `body` | Кузов | Число (зависит от модели) | — |
| `engine_volume_from` | Объём от | Float (литры) | `1.6` |
| `engine_volume_to` | Объём до | Float (литры) | `2.0` |
| `fuel` | Топливо | `1` (бензин), `2` (дизель) | `1` |
| `city` | Город | ID города | — |
| `unsold` | Только непроданные | `1` | `1` |
| `order` | Сортировка | `price`, `date`, `mileage`, `year` | `date` |
| `page` | Страница | Integer | `1` |

#### Популярные города Drom.ru

| Город | URL-сегмент |
|-------|------------|
| Москва | `moskva` |
| Санкт-Петербург | `sankt-peterburg` |
| Новосибирск | `novosibirsk` |
| Екатеринбург | `ekaterinburg` |
| Красноярск | `krasnoyarsk` |
| Владивосток | `vladivostok` |
| Хабаровск | `khabarovsk` |
| Краснодар | `krasnodar` |
| Казань | `kazan` |
| Нижний Новгород | `nizhniy_novgorod` |

#### Примеры URL Drom.ru

**Toyota Camry, Москва, до 2 000 000 ₽:**
```
https://auto.drom.ru/toyota/camry/used/?pricefrom=1500000&priceto=2000000&city=moskva&order=date
```

**Kia Rio, автомат, до 1 000 000 ₽:**
```
https://auto.drom.ru/kia/rio/used/?priceto=1000000&transmission=2&city=moskva&order=date
```

**Все кроссоверы, Владивосток (JDM-импорт):**
```
https://auto.drom.ru/used/all/?city=vladivostok&body=26&order=date
```

### Avito Авто

Базовый URL: `https://www.avito.ru/{city}/avtomobili/{brand}/{model}`

#### Path-компоненты Avito

| Компонент | Описание | Примеры |
|-----------|----------|---------|
| Город | Транслитерация города | `moskva`, `sankt-peterburg`, `kazan` |
| Категория | Автомобили | `avtomobili` |
| Марка | Транслитерация марки | `toyota`, `kia`, `hyundai` |
| Модель | Транслитерация модели | `camry`, `rio`, `solaris` |

#### Query-параметры Avito

| Параметр | Описание | Значения | Пример |
|-----------|----------|----------|--------|
| `pmin` | Мин. цена | Integer (₽) | `500000` |
| `pmax` | Макс. цена | Integer (₽) | `1500000` |
| `s_year` | Год от | Integer | `2015` |
| `e_year` | Год до | Integer | `2021` |
| `s_run` | Пробег от | Integer (тыс. км) | `0` |
| `e_run` | Пробег до | Integer (тыс. км) | `150` |
| `transmission` | КПП | `automatically`, `mechanically` | `automatically` |
| `drive` | Привод | `forward`, `rear`, `full` | `forward` |
| `body` | Кузов | Слаг кузова | `sedan` |
| `engine` | Двигатель | `benzine`, `dizel`, `gibrid` | `benzine` |
| `seller_type` | Продавец | `private`, `commercial` | `private` |
| `bt` | Тип кузова (для all) | `0` (все), `1` (седан), `2` (хэтчбек) и т.д. | — |
| `p` | Страница | Integer | `1` |
| `s` | Сортировка | `104` (по дате), `1` (цена asc), `2` (цена desc) | `104` |
| `local_delivery` | Доставка по РФ | `1` | `1` |

**ВАЖНО: Avito — агрессивная антибот-защита.** Минимизируй вызовы `state`, используй `eval`, делай паузы между действиями.

#### Примеры URL Avito

**Toyota Camry, Москва, до 2 000 000 ₽:**
```
https://www.avito.ru/moskva/avtomobili/toyota/camry?pmin=1500000&pmax=2000000&s=104
```

**Kia Rio, автомат, до 1 000 000 ₽, от частного:**
```
https://www.avito.ru/moskva/avtomobili/kia/rio?pmax=1000000&transmission=automatically&seller_type=private&s=104
```

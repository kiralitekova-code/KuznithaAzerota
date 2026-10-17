### Шаг 1: Поиск аналогов

```bash
# Поиск рыночных цен через web_search
web_search("{марка} {модель} {год} цена рынок 2026")
web_search("{марка} {модель} {год} {пробег} тыс км сколько стоит")
web_search("{марка} {модель} {год} покупка отзывы цена обзор")
```

### Шаг 2: Сбор цен с площадок

Для получения объективной рыночной цены собери данные по аналогичным автомобилям:

```bash
# Auto.ru — собрать цены аналогичных авто
browser-use --headed open "https://auto.ru/cars/{brand}/{model}/used/?year_from={year-1}&year_to={year+1}&km_age_to={mileage+30000}&sort=price-asc&geo_id={geo}"
node -e "new Promise(r=>setTimeout(r,5*1000)).then(process.exit)"
browser-use eval "
  const prices = Array.from(document.querySelectorAll('[class*=\"price\"] meta[itemprop=\"price\"]')).map(el => parseInt(el.content)).filter(n => !isNaN(n));
  JSON.stringify({count: prices.length, min: Math.min(...prices), max: Math.max(...prices), avg: Math.round(prices.reduce((a,b) => a+b, 0) / prices.length), median: prices.sort((a,b) => a-b)[Math.floor(prices.length/2)]});
"
```

### Шаг 3: Чтение обзоров и сравнений

```bash
web_reader("https://auto.ru/reviews/{brand}/{model}/")
web_reader("https://www.drom.ru/reviews/{brand}/{model}/")
```

### Шаг 4: Расчёт рыночной стоимости

```
## Рыночная стоимость: {Марка} {Модель} {Год}

| Параметр | Значение |
|----------|----------|
| Средняя цена (Auto.ru) | X XXX XXX ₽ |
| Средняя цена (Drom.ru) | X XXX XXX ₽ |
| Средняя цена (Avito) | X XXX XXX ₽ |
| **Общая средняя** | **X XXX XXX ₽** |
| Медиана | X XXX XXX ₽ |
| Минимум | X XXX XXX ₽ |
| Максимум | X XXX XXX ₽ |
| Цена за 1 000 км пробега | X XX ₽ |

### Целевой автомобиль: X XXX XXX ₽
- От средней: -X% (ниже рынка — хорошо)
- Оценка: [Отличная цена / Хорошая / Средняя / Дорого]
- Диапазон торга: X XXX XXX — X XXX XXX ₽

### Рекомендация по торгу
Если цена выше средней — можно торговаться на 5-10%.
Если цена на средней — торг на 3-5% за наличные.
Если цена ниже средней на 15%+ — проверь почему (возможны скрытые проблемы).
```

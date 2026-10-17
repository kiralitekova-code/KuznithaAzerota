Оглавление:
1. Шаг 1-2: получение VIN и проверка через ГИБДД
2. Шаг 3-4: VIN-отчёт Auto.ru и проверка залогов (ФНП)
3. Шаг 5-6: проверки через web_search и красные флаги VIN
4. Шаг 7: отчёт о VIN-проверке

### Шаг 1: Получение VIN

Пользователь предоставляет VIN одним из способов:
- VIN-номер напрямую (17 символов)
- Ссылка на объявление (извлечь VIN из объявления)
- Фото ПТС или СТС (распознать через image_analysis)

### Шаг 2: Проверка через ГИБДД

```
web_search("VIN {номер} проверка бесплатно гиббд")
```

Основной источник: **ГИБДД проверка** (гибдд.рф/check/auto)

```bash
# Открыть страницу проверки ГИБДД
browser-use --headed open "https://гиббд.рф/check/auto"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"

# Ввести VIN
browser-use click "text=VIN"
browser-use type "{VIN_НОМЕР}"
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# Нажать «Проверить»
browser-use click "text=Проверить"
node -e "new Promise(r=>setTimeout(r,5*1000)).then(process.exit)"

# Извлечь результаты
browser-use eval "
  const results = {};
  const sections = document.querySelectorAll('[class*=\"check-result\"], [class*=\"result\"]');
  sections.forEach(s => {
    const header = s.querySelector('h3, [class*=\"header\"]')?.textContent?.trim() || '';
    const body = s.querySelector('[class*=\"body\"], [class*=\"content\"]')?.textContent?.trim() || '';
    results[header] = body;
  });
  JSON.stringify(results);
"
```

### Шаг 3: Проверка на Auto.ru

```bash
# Если у объявления на Auto.ru есть VIN-отчёт
browser-use --headed open "URL_ОБЪЯВЛЕНИЯ"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Извлечь данные отчёта
browser-use eval "
  const report = {};
  report.accidents = document.querySelector('[class*=\"Accidents\"]')?.textContent?.trim() || 'нет данных';
  report.owners = document.querySelector('[class*=\"Owners\"]')?.textContent?.trim() || 'нет данных';
  report.mileage = document.querySelector('[class*=\"Mileage\"]')?.textContent?.trim() || 'нет данных';
  report.wanted = document.querySelector('[class*=\"Wanted\"]')?.textContent?.trim() || 'нет данных';
  report.restrictions = document.querySelector('[class*=\"Restrictions\"]')?.textContent?.trim() || 'нет данных';
  JSON.stringify(report);
"
```

### Шаг 4: Проверка залогов (ФНП)

```
web_search("VIN {номер} проверка залог реестр")
```

Источник: **Реестр залогов** (reestr-zalogov.ru)

```bash
browser-use --headed open "https://www.reestr-zalogov.ru/search/index"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"
browser-use type "{VIN_НОМЕР}"
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"
browser-use click "text=Найти"
node -e "new Promise(r=>setTimeout(r,3*1000)).then(process.exit)"
browser-use eval "
  const rows = document.querySelectorAll('table tbody tr');
  const results = [];
  rows.forEach(r => {
    results.push(r.textContent?.trim());
  });
  JSON.stringify(results);
"
```

### Шаг 5: Проверка через web_search

```bash
# Общая проверка VIN
web_search("VIN {номер} история автомобиля отчёт")

# Проверка на кражу/розыск
web_search("VIN {номер} розыск угон база")

# Проверка на использование в такси
web_search("VIN {номер} такси проверка")

# Проверка на залог
web_search("VIN {номер} залог обременение")
```

### Шаг 6: Красные флаги VIN-проверки

| Признак | Значение | Оценка |
|---------|----------|--------|
| ДТП в истории | Был ремонт — проверь качество восстановления | -15 баллов |
| Несколько владельцев за короткий период | Перекуп или проблемы с машиной | -20 баллов |
| Несовпадение пробега | Скручен пробег — ненадёжный продавец | -25 баллов |
| Розыск / ограничения | НЕ покупать до снятия ограничений | -100 баллов (стоп) |
| Залог / обременение | Машина в залоге у банка — могут забрать | -100 баллов (стоп) |
| Использование в такси | Повышенный износ, не лучшая покупка | -20 баллов |
| Юридическое лицо в собственности | Лизинг/корпоративная — возможны ограничения | -10 баллов |
| Различие VIN в ПТС и на кузове | Перебит VIN — криминал | -100 баллов (стоп) |

### Шаг 7: Отчёт о VIN-проверке

```
## VIN-отчёт: {VIN}

**Марка/Модель**: Toyota Camry
**Год**: 2019
**Пробег заявленный**: 68 000 км

### Проверка ГИБДД
| Проверка | Результат |
|----------|-----------|
| Период регистрации | 3 владельца (2019, 2021, 2023) |
| ДТП | Не найдено |
| Розыск | Не числится |
| Ограничения | Не найдено |

### Проверка залогов (ФНП)
| Проверка | Результат |
|----------|-----------|
| Залог | Не найден |

### Красные флаги
- [!] 3 владельца за 5 лет — возможен перекуп
- [ ] Пробег соответствует среднему для возраста
- [ ] ДТП не обнаружены

### Общая оценка VIN: 7/10
Можно рассматривать к покупке. Рекомендуется личный осмотр и проверка пробега по сервисной книге.
```

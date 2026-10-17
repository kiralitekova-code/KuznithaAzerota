# Госуслуги: навигация и подача 3-НДФЛ

Читай при подаче декларации (Шаг 5): URL-паттерны, проверка авторизации, закрытие баннеров и пошаговая подача 3-НДФЛ.

## Содержание
1. «Госуслуги: навигация» — URL-паттерны, проверка авторизации, баннеры и модалки
2. «Открытие формы декларации» / «Заполнение декларации» / «Отправка декларации» — пошаговая подача 3-НДФЛ

## Госуслуги: навигация

### URL-паттерны

| Действие | URL |
|----------|-----|
| Главная | `https://www.gosuslugi.ru` |
| Личный кабинет налогоплательщика | `https://www.gosuslugi.ru/10042/1` |
| Подача 3-НДФЛ | `https://www.gosuslugi.ru/10042/1/form?parentId=108496` |
| Мои налоги (ЛК ФНС) | `https://lkfl2.nalog.ru/lkfl/` |
| Проверка штрафов и долгов | `https://www.gosuslugi.ru/10042/2` |
| Запись на приём в ФНС | `https://www.gosuslugi.ru/10042/4` |

### Проверка авторизации

**КРИТИЧЕСКИ ВАЖНО**: Никогда не вводи логин и пароль за пользователя.

```bash
# Открыть Госуслуги
browser-use --headed open "https://www.gosuslugi.ru"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Проверить авторизацию
browser-use state
```

Признаки авторизации на странице:
- Имя пользователя или аватар в правом верхнем углу
- Кнопка «Личный кабинет»
- Отсутствие кнопки «Войти с Госуслугами»

Если пользователь не авторизован:
> «Чтобы продолжить, нужно войти в аккаунт на Госуслугах. Пожалуйста, авторизуйся в открывшемся браузере и напиши "готово". Я не смогу войти за тебя — это небезопасно.»

После подтверждения от пользователя:
```bash
browser-use state
# Проверить, что авторизация прошла
browser-use eval "!!document.querySelector('[class*=\"user\"], [class*=\"profile\"], [class*=\"UserName\"]')"
```

### Закрытие баннеров и модалок

```bash
# Закрыть cookie-баннер если есть
browser-use eval "document.querySelector('[class*=\"cookie\"] button, [class*=\"agree\"], button[class*=\"accept\"]')?.click()"

# Закрыть промо-модалки
browser-use eval "document.querySelector('[class*=\"modal\"] [class*=\"close\"], [aria-label=\"Закрыть\"], [class*=\"ModalClose\"]')?.click()"
node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"
```

#### Открытие формы декларации

```bash
# Закрыть предыдущие сессии
browser-use close --all
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# Открыть Госуслуги в headed режиме
browser-use --headed open "https://www.gosuslugi.ru"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Проверить авторизацию (см. секцию выше)

# Перейти к подаче 3-НДФЛ
browser-use open "https://www.gosuslugi.ru/10042/1/form?parentId=108496"
node -e "new Promise(r=>setTimeout(r,4*1000)).then(process.exit)"

# Проверить что форма загрузилась
browser-use state
```

#### Заполнение декларации

**ВНИМАНИЕ**: Интерфейс Госуслуг регулярно обновляется. Не полагайся на конкретные CSS-селекторы. Используй текстовое содержимое и структуру страницы.

Общий порядок заполнения 3-НДФЛ:
1. Выбор года декларирования
2. Внесение доходов (из 2-НДФЛ или автоматически из ЛК ФНС)
3. Указание вычетов (выбрать тип и заполнить данные)
4. Проверка и отправка

**Для каждого шага:**
```bash
# Получить текущее состояние формы
browser-use state

# Найти нужное поле и заполнить
browser-use click "text=..."
browser-use type "..."

# Проверить что данные внесены
browser-use eval "document.querySelector('[name=\"field_name\"]')?.value"
```

#### Отправка декларации

```bash
# Нажать кнопку отправки
browser-use click "text=Отправить"
node -e "new Promise(r=>setTimeout(r,2*1000)).then(process.exit)"

# Подтвердить отправку (если есть подтверждение)
browser-use state
# При необходимости подписать электронной подписью
browser-use click "text=Подписать и отправить"

# Записать номер декларации
browser-use eval "document.querySelector('[class*=\"number\"], [class*=\"Number\"]')?.textContent?.trim()"
```

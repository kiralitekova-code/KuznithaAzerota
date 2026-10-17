# Проверка перед работой и установка адреса — полные детали

Читай перед началом сессии: что проверять в `state` и пошаговая установка адреса доставки из SKILL.md.

## Что проверять в state

1. **Баннер cookies** — если есть кнопка «Принять» / «Принять все» — нажми:
   ```bash
   browser-use click <accept-cookies-index>
   node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"
   ```

2. **Авторизация** — проверь:
   ```bash
   browser-use eval "!!document.querySelector('[class*=\"user\"], [class*=\"profile\"], [class*=\"account\"], .HeaderUser')"
   ```
   - `true` → пользователь авторизован
   - `false` → **НЕОБХОДИМА АВТОРИЗАЦИЯ** (см. ниже)

3. **Адрес доставки** — проверь наличие адреса в шапке:
   ```bash
   browser-use eval "document.querySelector('[class*=\"address\"], [class*=\"AddressButton\"], [class*=\"delivery-address\"]')?.textContent?.trim()?.length > 3"
   ```
   - `true` → адрес установлен
   - `false` → **НАДО УСТАНОВИТЬ АДРЕС** (см. ниже)

4. **Промо-модалки** — закрой любые всплывающие окна:
   ```bash
   browser-use eval "document.querySelector('[class*=\"modal\"], [class*=\"popup\"], [class*=\"Modal\"]').querySelector('[class*=\"close\"], [class*=\"Close\"], [aria-label=\"Закрыть\"]')?.click()"
   node -e "new Promise(r=>setTimeout(r,0.5*1000)).then(process.exit)"
   ```

## Пошаговая установка адреса

```bash
# 1. Нажать на кнопку адреса в шапке
# Ищем элемент с классом содержащим "address" или "AddressButton"
browser-use state
# Найти индекс кнопки адреса и нажать
browser-use click <address-button-index>
node -e "new Promise(r=>setTimeout(r,2*1000)).then(process.exit)"

# 2. В модалке адресов нажать "Добавить новый адрес"
browser-use state
# Найти кнопку "Добавить новый адрес" / "Новый адрес"
browser-use click <add-address-index>
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 3. Ввести адрес в поле ввода
browser-use state
# Найти поле ввода адреса
browser-use click <address-input-index>
browser-use type "<адрес пользователя>"
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 4. Выбрать подсказку из выпадающего списка
browser-use state
# Найти подходящую подсказку (первую или наиболее точную)
browser-use click <suggestion-index>
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"

# 5. Подтвердить выбор — нажать "Выбрать" / "Сохранить"
browser-use state
browser-use click <confirm-address-index>
node -e "new Promise(r=>setTimeout(r,2*1000)).then(process.exit)"

# 6. Выбрать время доставки (если появится)
browser-use state
# Если открылась панель времени — выбрать ближайший слот
browser-use click <time-slot-index>
node -e "new Promise(r=>setTimeout(r,1*1000)).then(process.exit)"
```

**Если адрес не устанавливается:**
- Возможно адрес вне зоны доставки — сообщи пользователю
- Попробуй другой формат адреса (улица → проспект)
- VkusVill работает не во всех городах — проверь

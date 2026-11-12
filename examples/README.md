# 🚀 Примеры использования @ipsadt/tg-widgets (Bot API 10.4)

В этой папке содержится готовый интерактивный Telegram-бот [`bot.tsx`](./bot.tsx), демонстрирующий работу всех UI-компонентов библиотеки непосредственно внутри реального чата Telegram.

---

## 🛠️ Быстрый старт

### 1. Получите токен бота
Создайте бота у [@BotFather](https://t.me/BotFather) и скопируйте полученный `BOT_TOKEN`.

### 2. Запустите демонстрационного бота

```bash
# Через Bun
BOT_TOKEN="ваш_токен_бота" bun run examples/bot.tsx

# Или через npm script
BOT_TOKEN="ваш_токен_бота" bun run example

# Через Node.js (tsx)
BOT_TOKEN="ваш_токен_бота" npx tsx examples/bot.tsx
```

### 3. Откройте Telegram
Отправьте боту команду `/start`. Бот покажет интерактивное меню со списком всех компонентов.

---

## 📁 Каталог примеров и скриншотов

Для каждого примера подготовлена отдельная папка с документацией и заготовкой под скриншот, который можно прикрепить после тестирования:

| Компонент / Экран | Команда | Описание | Документация и скриншот |
| :--- | :--- | :--- | :--- |
| **Accordion** | `/accordion` | Нативные раскрывающиеся блоки (`<details>` / `<summary>`) без JS | [📖 accordion/README.md](./accordion/README.md) |
| **Controls** | `/controls` | Чекбоксы, переключатели, радио-кнопки и степпер (`− [ 2 ] +`) | [📖 controls/README.md](./controls/README.md) |
| **Table** | `/table` | Нативная таблица с границами ячеек (чек заказа / квитанция) | [📖 table/README.md](./table/README.md) |
| **Alerts** | `/alerts` | Блоки статусов (`info`, `success`, `warning`, `destructive`) | [📖 alerts/README.md](./alerts/README.md) |
| **Cards & Metrics** | `/cards` | Составные карточки shadcn, прогресс-бар и поле ввода заметки | [📖 cards/README.md](./cards/README.md) |
| **Live Counter** | `/counter` | Интерактивный счетчик с клиентским скриптом `TelegramWidget.request` | [📖 counter/README.md](./counter/README.md) |

---

## 📸 Как добавить скриншоты

1. Запустите бота и откройте чат с ним в Telegram (на смартфоне или Desktop).
2. Вызовите интересующую команду (например, `/accordion`).
3. Сделайте скриншот полученного сообщения-баббла.
4. Поместите изображение в соответствующую папку под именем `screenshot.png` (например, `examples/accordion/screenshot.png`).

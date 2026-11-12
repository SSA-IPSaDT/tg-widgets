# 🚀 Примеры использования @ipsadt/tg-widgets (Bot API 10.4)

В этой папке содержится готовый интерактивный Telegram-бот [`bot.tsx`](./bot.tsx), демонстрирующий работу всех UI-компонентов библиотеки непосредственно внутри реального чата Telegram.

---

## 🛠️ Быстрый старт

### 1. Настройте конфигурацию в `.env`
Скопируйте шаблон окружения и укажите ваш токен:

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
# Для тестирования виджетов на тестовом сервере Telegram (Test DC):
TELEGRAM_TEST_ENV=false
```

> **Совет по тестированию Bot API 10.4:**
> Для тестирования виджетов в группах, пересылки или inline-режима рекомендуется использовать тестовое окружение Telegram (Test DC). Установите `TELEGRAM_TEST_ENV=true` в файле `.env`.

### 2. Запустите демонстрационного бота

```bash
# Через Bun (автоматически подхватит .env)
bun run example

# Или напрямую
bun run examples/bot.tsx

# Через Node.js (tsx)
npx tsx examples/bot.tsx
```

### 3. Откройте Telegram
Отправьте боту команду `/start`. Бот покажет интерактивное меню со списком всех компонентов. Каждую команду можно вызвать напрямую: `/accordion`, `/controls`, `/table`, `/alerts`, `/cards`, `/counter`.

---

## 📁 Каталог примеров и скриншотов

Для каждого примера подготовлена отдельная папка с документацией и заготовкой под скриншот, который можно прикрепить после тестирования:

| Компонент / Экран | Команда | Описание | Код экрана | Документация и скриншот |
| :--- | :--- | :--- | :--- | :--- |
| **Accordion** | `/accordion` | Нативные раскрывающиеся блоки (`<details>` / `<summary>`) без JS | [`screen.tsx`](./accordion/screen.tsx) | [📖 accordion/README.md](./accordion/README.md) |
| **Controls** | `/controls` | Чекбоксы, переключатели, радио-кнопки и степпер (`− [ 2 ] +`) | [`screen.tsx`](./controls/screen.tsx) | [📖 controls/README.md](./controls/README.md) |
| **Table** | `/table` | Нативная таблица с границами ячеек (чек заказа / квитанция) | [`screen.tsx`](./table/screen.tsx) | [📖 table/README.md](./table/README.md) |
| **Alerts** | `/alerts` | Блоки статусов (`info`, `success`, `warning`, `destructive`) | [`screen.tsx`](./alerts/screen.tsx) | [📖 alerts/README.md](./alerts/README.md) |
| **Cards & Metrics** | `/cards` | Составные карточки shadcn, прогресс-бар и поле ввода заметки | [`screen.tsx`](./cards/screen.tsx) | [📖 cards/README.md](./cards/README.md) |
| **Live Counter** | `/counter` | Интерактивный счетчик с клиентским скриптом `TelegramWidget.request` | [`screen.tsx`](./counter/screen.tsx) | [📖 counter/README.md](./counter/README.md) |

---

## 📸 Как добавить скриншоты

1. Запустите бота и откройте чат с ним в Telegram (на смартфоне или Desktop).
2. Вызовите интересующую команду (например, `/accordion`).
3. Сделайте скриншот полученного сообщения-баббла.
4. Поместите изображение в соответствующую папку под именем `screenshot.png` (например, `examples/accordion/screenshot.png`).

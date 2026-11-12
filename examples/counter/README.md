# 🔢 Live Counter (Client IIFE Script & Server Actions)

Пример интерактивного баббла, демонстрирующий связь клиентского скрипта песочницы (`<Script fn={...} />`) и сервера через вызов `window.TelegramWidget.request()`.

---

## 💡 Как это работает

1. `<Script fn={clientScript} args={[{ count }]} />` сериализует TypeScript-функцию в чистый самоисполняемый инлайн-скрипт (IIFE) внутри виджета.
2. При нажатии на кнопку клиент вызывает:
   ```ts
   window.TelegramWidget.request('inc').then((res) => {
     // Обновляем значение на клиенте без перезагрузки виджета
   });
   ```
3. Сервер grammY получает `update.widget_query`, выполняет экшен `inc`, сохраняет обновленное состояние в хранилище и отвечает виджету через `answerWidgetQuery`.

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Counter Screenshot](./screenshot.png)

# 🔔 Alerts (Callouts & Status notifications)

Компоненты уведомлений и статусов в стиле shadcn/ui (`Alert`, `AlertTitle`, `AlertDescription`).

Исходный код примера: [`screen.tsx`](./screen.tsx)

---

## 💡 Варианты и цвета темы

* `default` — нейтральный блок на базе `--tg-theme-secondary-bg-color`.
* `info` — информационный блок с синим акцентом (`--tg-theme-link-color`).
* `success` — зеленый блок подтверждения успешного действия.
* `warning` — желтый блок предупреждения.
* `destructive` — красный блок ошибок (`--tg-theme-destructive-text-color`).

---

## 💻 Код экрана (`screen.tsx`)

```tsx
import { Alert, defineWidgetScreen, h, WidgetLayout } from '@ipsadt/tg-widgets';

export const alertsScreen = defineWidgetScreen({
  id: 'alerts',
  component: () => (
    <WidgetLayout gap={8} safeArea>
      <Alert
        variant="info"
        title="Информация"
        description="Виджеты поддерживают цветовую палитру темы пользователя."
      />
      <Alert
        variant="success"
        title="Успешно сохранено"
        description="Ваши данные были синхронизированы с облаком."
      />
      <Alert
        variant="warning"
        title="Внимание"
        description="Размер сжатого виджета ограничен 4096 байтами."
      />
      <Alert
        variant="destructive"
        title="Критическая ошибка"
        description="Действие не может быть выполнено без авторизации."
      />
    </WidgetLayout>
  ),
  initialState: () => ({}),
});
```

---

## 🚀 Команда для проверки в боте

```text
/alerts
```

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Alerts Screenshot](./screenshot.png)

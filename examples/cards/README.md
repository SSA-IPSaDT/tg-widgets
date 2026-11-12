# 💳 Cards & Compound Structure

Карточки в стиле shadcn/ui с составной структурой (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`), прогресс-баром и бейджами.

---

## 💻 Пример использования в коде

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ProgressBar,
  Typography,
  WidgetLayout
} from '@ipsadt/tg-widgets';

export const AnalyticsWidget = () => (
  <WidgetLayout safeArea>
    <Card variant="default">
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle>Баланс аккаунта</CardTitle>
          <Badge variant="accent">VIP</Badge>
        </div>
        <CardDescription>Статистика за текущую неделю</CardDescription>
      </CardHeader>
      <CardContent>
        <Typography variant="title">1,450.00 $</Typography>
        <ProgressBar percent={65} />
      </CardContent>
      <CardFooter>
        <Button variant="primary" fullWidth size="md">
          Пополнить
        </Button>
      </CardFooter>
    </Card>
  </WidgetLayout>
);
```

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Cards Screenshot](./screenshot.png)

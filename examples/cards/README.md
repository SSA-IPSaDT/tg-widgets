# 💳 Cards & Compound Structure

Карточки в стиле shadcn/ui с составной структурой (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`), прогресс-баром и бейджами.

Исходный код примера: [`screen.tsx`](./screen.tsx)

---

## 💻 Код экрана (`screen.tsx`)

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
  defineWidgetScreen,
  Divider,
  h,
  LucideIcon,
  LucideIcons,
  ProgressBar,
  Typography,
  WidgetLayout,
} from '@ipsadt/tg-widgets';

export const cardsScreen = defineWidgetScreen({
  id: 'cards',
  component: () => (
    <WidgetLayout expand>
      <Card fullWidth>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Аналитика баланса</CardTitle>
            <Badge variant="accent">Pro VIP</Badge>
          </div>
          <CardDescription>
            Сводка за последние 30 дней активности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="title">14,820 TON</Typography>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>
              +18.4% ↑
            </span>
          </div>
          <ProgressBar percent={72} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--tg-theme-hint-color, #888)' }}>
            <span>Лимит запросов</span>
            <span>7,200 / 10,000</span>
          </div>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ padding: '8px 10px', background: 'rgba(120, 120, 128, 0.08)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #888)' }}>Транзакций</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>142</div>
            </div>
            <div style={{ padding: '8px 10px', background: 'rgba(120, 120, 128, 0.08)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #888)' }}>Конверсия</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>98.4%</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
            <Button id="btn-statement" variant="secondary" fullWidth size="md">
              Выписка
            </Button>
            <Button
              id="btn-topup"
              variant="primary"
              fullWidth
              size="md"
              icon={LucideIcon({
                icon: LucideIcons.Sparkles,
                size: 14,
                color: '#ffffff',
                style: { marginRight: 4 },
              })}
            >
              Пополнить
            </Button>
          </div>
        </CardFooter>
      </Card>
    </WidgetLayout>
  ),
  initialState: () => ({}),
});
```

---

## 🚀 Команда для проверки в боте

```text
/cards
```

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Cards Screenshot](./screenshot.png)

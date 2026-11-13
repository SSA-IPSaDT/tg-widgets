# 💳 Cards & Analytics Screen

The **Cards & Analytics** screen illustrates compound card compositions inspired by shadcn/ui. It combines numerical statistics, progress bars, metric grids, and quick action buttons.

Source code: [`screen.tsx`](./screen.tsx)

---

## 💡 Key Architectural Features

1. **Compound Card Structure**: Clean separation of `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
2. **Progress Indicator**: Renders an accessible `<ProgressBar percent={72} />` styled with Telegram CSS variables.
3. **Metric Grid**: 2-column layout displaying key-value metrics with high contrast typography.
4. **Haptic Action Handlers**: Buttons trigger `impactOccurred` and `notificationOccurred` vibrations before sending actions to the bot.

---

## 💻 Screen Code (`screen.tsx`)

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
    h,
    ProgressBar,
    Typography,
    WidgetLayout,
} from '@ipsadt/tg-widgets';

export const cardsScreen = defineWidgetScreen({
    id: 'cards',
    component: () => (
        <WidgetLayout fullWidth padding="6px 8px">
            <Card fullWidth>
                <CardHeader>
                    <CardTitle>Balance Analytics</CardTitle>
                    <CardDescription>Activity overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <Typography variant="title">14,820 TON</Typography>
                    <ProgressBar percent={72} />
                </CardContent>
                <CardFooter>
                    <Button id="btn-statement" variant="secondary" fullWidth>
                        Statement
                    </Button>
                    <Button id="btn-topup" variant="primary" fullWidth>
                        Add Funds
                    </Button>
                </CardFooter>
            </Card>
        </WidgetLayout>
    ),
    initialState: () => ({}),
    actions: {
        statement: async (ctx) => ctx.answer({ text: '📄 Generating statement...' }),
        topup: async (ctx) => ctx.answer({ text: '💳 Opening payment gateway...' }),
    },
});
```

---

## 🚀 Telegram Bot Command

```text
/cards
```

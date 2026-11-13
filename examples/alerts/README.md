# 🔔 Alerts & Callouts Screen

The **Alerts** screen demonstrates system status messages, warnings, confirmations, and errors rendered with official Lucide SVG iconography and theme-responsive color schemes.

Source code: [`screen.tsx`](./screen.tsx)

---

## 💡 Key Architectural Features

1. **Completely Static Screen Paradigm (`defineStaticWidgetScreen`)**: 0 bytes JavaScript runtime, 0 round-trip server queries (`allow_queries: false`), and 0 bytes storage allocation.
2. **Official Lucide Vector Icons**: Includes `Info`, `CircleCheck`, `TriangleAlert`, and `CircleAlert` with stroke colors matching Telegram's design tokens.
3. **Clean Accent Borders**: Alerts feature fine-tuned borders tinted with their respective variant accent color, eliminating harsh default borders.
4. **Typography Standards**: Titles are styled at 14px with `font-weight: 600`, and descriptions are rendered at 13px with `font-weight: 500`.

---

## 💻 Screen Code (`screen.tsx`)

```tsx
import { Alert, defineStaticWidgetScreen, h, WidgetLayout } from '@ipsadt/tg-widgets';

export const alertsScreen = defineStaticWidgetScreen({
  id: 'alerts',
  component: () => (
    <WidgetLayout gap={8} fullWidth padding="8px 10px">
      <Alert
        variant="info"
        title="Information"
        description="Widgets adapt to user theme colors."
      />
      <Alert
        variant="success"
        title="Saved"
        description="Changes synchronized successfully."
      />
      <Alert
        variant="warning"
        title="Warning"
        description="Check parameters before proceeding."
      />
      <Alert
        variant="destructive"
        title="Error"
        description="Action rejected by server."
      />
    </WidgetLayout>
  ),
});
```

---

## 🚀 Telegram Bot Command

```text
/alerts
```

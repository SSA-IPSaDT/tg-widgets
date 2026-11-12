# 📖 Accordion Screen (`<details>` / `<summary>`)

The **Accordion** screen demonstrates native collapsible sections, FAQs, and spoiler blocks rendered directly inside the Telegram message bubble.

Source code: [`screen.tsx`](./screen.tsx)

---

## 💡 Key Architectural Features

1. **100% Native HTML**: Built on standard `<details>` and `<summary>` elements, officially supported in **Telegram QuickJS Profile 1**.
2. **Zero JavaScript Overhead**: Expanding and collapsing items occurs natively without executing client-side JavaScript or sending network requests.
3. **Smooth Chevron Transitions**: Uses CSS transforms to rotate the chevron icon when opened:
   ```css
   details[open] .tg-accordion-chevron {
     transform: rotate(90deg) !important;
   }
   ```
4. **Fast Touch Interaction**: Configured with `touch-action: manipulation` to eliminate the 300ms mobile tap delay.

---

## 💻 Screen Code (`screen.tsx`)

```tsx
import {
  Accordion,
  AccordionItem,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  defineWidgetScreen,
  h,
  WidgetLayout,
} from '@ipsadt/tg-widgets';

export const accordionScreen = defineWidgetScreen({
  id: 'accordion',
  component: () => (
    <WidgetLayout fullWidth padding="6px 8px">
      <Card fullWidth>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Native details and summary elements</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            <AccordionItem title="How do HTML widgets work?" open={true}>
              Widgets render directly inside the chat message bubble.
            </AccordionItem>
            <Collapsible title="Is internet required?">
              No, widgets render offline with zero network latency.
            </Collapsible>
          </Accordion>
        </CardContent>
        <CardFooter>
          <span>Tap any item to expand details</span>
        </CardFooter>
      </Card>
    </WidgetLayout>
  ),
  initialState: () => ({}),
});
```

---

## 🚀 Telegram Bot Command

```text
/accordion
```

# 📖 Accordion & Collapsible (<details> / <summary>)

Компонент **`Accordion`** (и **`AccordionItem`** / **`Collapsible`**) предназначен для компактного отображения часто задаваемых вопросов (FAQ), подробностей транзакций или спойлеров прямо внутри сообщения Telegram.

---

## 💡 Особенности реализации в Telegram Widgets

1. **100% нативный HTML**: Использует стандартные теги `<details>` и `<summary>`, которые официально поддерживаются спецификацией **Telegram QuickJS Profile 1**.
2. **0 байт JavaScript**: Раскрытие и закрытие блока происходит нативно силами движка Telegram без необходимости подключать клиентские скрипты или делать запросы к серверу.
3. **Плавная анимация шеврона**: Шеврон справа автоматически поворачивается на 90° при открытии блока с помощью чистого CSS-правила:
   ```css
   details[open] .tg-accordion-chevron {
     transform: rotate(90deg) !important;
   }
   ```

---

## 💻 Пример использования в коде

```tsx
import {
  Accordion,
  AccordionItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  WidgetLayout
} from '@ipsadt/tg-widgets';

export const FAQWidget = () => (
  <WidgetLayout safeArea>
    <Card>
      <CardHeader>
        <CardTitle>Частые вопросы</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion>
          <AccordionItem title="Как работают виджеты?" open={true}>
            Виджеты рендерятся прямо внутри баббла сообщения.
          </AccordionItem>
          <AccordionItem title="Нужен ли интернет для рендера?">
            Нет, виджет отрисовывается мгновенно в локальной песочнице.
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </WidgetLayout>
);
```

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Accordion Screenshot](./screenshot.png)

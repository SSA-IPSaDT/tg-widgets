# 📊 Data Tables (Table, Header, Body, Footer)

Нативные таблицы данных в стиле shadcn/ui для отображения квитанций, счетов, лидербордов и списков позиций в Telegram Widgets.

---

## 💡 Особенности реализации в Telegram

* Нативная поддержка: Telegram Profile 1 официально поддерживает теги `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, а также атрибуты `colspan` и `rowspan`.
* Разделители ячеек используют нативную переменную темы `--tg-theme-section-separator-color`, что делает таблицу неотличимой от системных списков Telegram.

---

## 💻 Пример использования в коде

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  WidgetLayout
} from '@ipsadt/tg-widgets';

export const ReceiptWidget = () => (
  <WidgetLayout safeArea>
    <Card>
      <CardHeader>
        <CardTitle>Чек заказа</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Позиция</TableHead>
            <TableHead align="center">Кол-во</TableHead>
            <TableHead align="right">Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Пицца Маргарита</TableCell>
            <TableCell align="center">2</TableCell>
            <TableCell align="right">18.00 $</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colspan={2}>Итого</TableCell>
            <TableCell align="right">18.00 $</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  </WidgetLayout>
);
```

---

## 📸 Скриншот из Telegram

> *После тестирования добавьте сюда скриншот сообщения из Telegram с именем `screenshot.png`:*

![Table Screenshot](./screenshot.png)

# @ipsadt/tg-widgets

Zero-runtime TSX UI Kit and type-safe [grammY](https://grammy.dev) plugin for **Telegram Bot API 10.4 HTML Widgets (Interactive Bubbles)**.

---

## ⚡ Features

- **Zero Runtime JSX**: Fast TSX-to-HTML compilation with inline CSS conversion. Zero Virtual DOM and zero React dependencies.
- **Bot API 10.4 Ready**: Real-time payload size analysis and verification against the Telegram `deflate level 9 <= 4096 bytes` payload constraint (`inspectWidgetSize`).
- **Telegram Native UI Kit**: 17+ prebuilt primitives (`WidgetLayout`, `Button`, `Badge`, `Card`, `Checkbox`, `Radio`, `Switch`, `Input`, `ProgressBar`, `Banner`, `Avatar`, `List`, `ListItem`, `Divider`, `Typography`, `Skeleton`, `Icon`, `Script`) styled strictly via native Telegram theme variables (`--tg-theme-*`).
- **Type-Safe Client Hydration**: `<Script fn={clientScript} args={[...]} />` serializes typed TypeScript functions into self-executing IIFEs with complete typing for `window.TelegramWidget`.
- **Declarative Screens**: Define screens with initial state and server-side action handlers (`defineWidgetScreen` / `defineBubbleScreen`).
- **grammY First-Class Integration**: Plugin middleware that registers typed screen routers and injects `ctx.widgets` (`send`, `reply`, `render`, `update`, `getScreen`) into your bot context.
- **Cross-Platform**: Full support for **Bun**, **Node.js** (Dual ESM + CommonJS in `dist/`), and **Deno** (via `mod.ts`).

---

## 📦 Installation

```bash
# Bun
bun add @ipsadt/tg-widgets grammy

# npm
npm install @ipsadt/tg-widgets grammy

# pnpm
pnpm add @ipsadt/tg-widgets grammy

# Deno
import { createTelegramWidgetsPlugin } from "npm:@ipsadt/tg-widgets";
// or via mod.ts
```

---

## 🛠️ TypeScript Configuration

To write TSX templates without manually adding `/** @jsx h */` pragmas to every file, configure `tsconfig.json`:

```json
{
    "compilerOptions": {
        "jsx": "react",
        "jsxFactory": "h",
        "jsxFragmentFactory": "Fragment"
    }
}
```

---

## 🚀 Quick Start

### 1. Define a Client Script (`Bubble.client.ts`)

```typescript
import type { TelegramWidgetBridge } from '@ipsadt/tg-widgets';

export interface CounterClientProps {
    count: number;
}

export const counterClientScript = ({ count }: CounterClientProps): void => {
    const W = window.TelegramWidget;
    const btn = document.getElementById('btn-increment');
    const val = document.getElementById('count-val');

    btn?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        W?.request('increment').then((res) => {
            if (res?.result && val) {
                const data = JSON.parse(res.result);
                val.textContent = String(data.count);
            }
        });
    });
};
```

### 2. Define the TSX Template (`Bubble.tsx`)

```tsx
import {
    Button,
    Card,
    h,
    Script,
    WidgetLayout,
} from '@ipsadt/tg-widgets';

import { counterClientScript } from './Bubble.client';

export interface CounterBubbleProps {
    count: number;
}

export const CounterBubble = ({ count }: CounterBubbleProps): string => (
    <WidgetLayout>
        <Card>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
                Interactive Counter
            </div>
            <div>
                Current Count: <strong id="count-val">{count}</strong>
            </div>
            <Button id="btn-increment" variant="primary">
                Increment +1 🚀
            </Button>
        </Card>
        <Script fn={counterClientScript} args={[{ count }]} />
    </WidgetLayout>
);
```

### 3. Define the Screen Contract & Actions (`screen.ts`)

```typescript
import { defineWidgetScreen } from '@ipsadt/tg-widgets';

import { CounterBubble, type CounterBubbleProps } from './Bubble';

export interface CounterState {
    count: number;
}

export const counterScreen = defineWidgetScreen({
    id: 'counter',
    component: CounterBubble,
    initialState: (props: CounterBubbleProps): CounterState => ({
        count: props.count,
    }),
    actions: {
        increment: async (ctx) => {
            const nextState = { count: ctx.state.count + 1 };
            await ctx.setState(nextState);
            return nextState;
        },
    },
});
```

### 4. Register Plugin in grammY (`bot.ts`)

```typescript
import {
    createTelegramWidgetsPlugin,
    type WidgetsFlavor,
} from '@ipsadt/tg-widgets';
import { Bot, Context } from 'grammy';

import { counterScreen } from './screen';

const screens = {
    counter: counterScreen,
};

type BotContext = Context & WidgetsFlavor<typeof screens>;

const bot = new Bot<BotContext>(process.env.BOT_TOKEN!);

// Register plugin middleware
const widgets = createTelegramWidgetsPlugin({ screens });
bot.use(widgets.middleware);

// Send or reply with widget
bot.command('counter', async (ctx) => {
    // 1. Send as a new message
    await ctx.widgets.send('counter', {
        props: { count: 0 },
        caption: 'Here is your interactive widget!',
    });

    // 2. Or reply directly to the command
    // await ctx.widgets.reply('counter', { props: { count: 0 } });
});

bot.start();
```

---

## 🎮 Context Methods (`ctx.widgets`)

| Method                                             | Description                                                                                             |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `ctx.widgets.send(screenId, options)`              | Sends a widget to the target `chatId` (or current chat).                                                |
| `ctx.widgets.reply(screenId, options)`             | Sends a widget as a direct reply to the current incoming message.                                       |
| `ctx.widgets.render(screenId, props)`              | Pure render without sending. Returns `{ html, byteLength, compressedByteLength, isValid, maxAllowed }`. |
| `ctx.widgets.update(messageId, screenId, options)` | Updates the server `chat_data` state of an active widget message.                                       |
| `ctx.widgets.getScreen(screenId)`                  | Returns the registered screen descriptor.                                                               |

_Note: `ctx.bubbles` is provided as an exact alias to `ctx.widgets` for backwards compatibility._

---

## 🎨 UI Component Catalog

All components strictly inherit native Telegram theme CSS variables:

- `--tg-theme-bg-color`
- `--tg-theme-secondary-bg-color`
- `--tg-theme-text-color`
- `--tg-theme-hint-color`
- `--tg-theme-link-color`
- `--tg-theme-button-color`
- `--tg-theme-button-text-color`
- `--tg-theme-destructive-text-color`

| Component                       | Props                                                                                                                                        | Description                                                                     |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `<WidgetLayout />`              | `theme` (`auto`, `light`, `dark`), `children`, `style`                                                                                       | Root wrapper with reset, box-sizing, and anti-aliasing.                         |
| `<Button />`                    | `variant` (`primary`, `secondary`, `destructive`, `outline`, `ghost`), `size` (`sm`, `md`, `lg`), `fullWidth`, `disabled`, `loading`, `icon` | Tactile button with loading spinner and icon support.                           |
| `<Badge />`                     | `variant` (`default`, `accent`, `destructive`, `outline`, `success`, `warning`), `size` (`sm`, `md`), `dot`                                  | Pill label or status dot indicator.                                             |
| `<Card />` / `<Section />`      | `variant` (`default`, `outlined`, `section`, `inset`), `header`, `footer`                                                                    | Grouping container matching Telegram iOS/Android cells.                         |
| `<Checkbox />`                  | `id`, `name`, `label`, `description`, `checked`, `disabled`                                                                                  | Native-styled Telegram checkbox.                                                |
| `<Radio />` / `<RadioGroup />`  | `id`, `name`, `value`, `label`, `description`, `checked`, `disabled`                                                                         | Native-styled Telegram radio buttons.                                           |
| `<Switch />` / `<Toggle />`     | `id`, `name`, `label`, `description`, `checked`, `disabled`                                                                                  | Smooth animated toggle switch.                                                  |
| `<Input />`                     | `type`, `label`, `hint`, `error`, `placeholder`, `value`, `prefix`, `suffix`, `disabled`                                                     | Styled text input matching Telegram chat forms.                                 |
| `<ProgressBar />`               | `percent` (0-100), `color`, `trackColor`, `height`                                                                                           | Progress track for quotas, polls, or progress bars.                             |
| `<Avatar />`                    | `src`, `fallback`, `size` (`xs`, `sm`, `md`, `lg`), `shape` (`circle`, `rounded`), `badge`                                                   | User/chat avatar with fallback initials and status badge.                       |
| `<List />` & `<ListItem />`     | `left`, `title`, `subtitle`, `right`, `chevron`, `interactive`, `disabled`                                                                   | Telegram cell item with left avatar/icon and right badge/chevron.               |
| `<Divider />` / `<Separator />` | `inset` (boolean or px number), `color`                                                                                                      | Subtle separator matching Telegram list dividers.                               |
| `<Typography />` / `<Text />`   | `variant` (`title`, `headline`, `subhead`, `body`, `caption`, `footnote`, `code`), `color`, `weight`, `align`, `truncate`, `as`              | Semantic typography primitives adapting to Telegram colors.                     |
| `<Skeleton />`                  | `width`, `height`, `variant` (`text`, `rect`, `circle`), `radius`                                                                            | Shimmer pulse placeholder for loading states.                                   |
| `<Banner />`                    | `badge`, `gradient`, `height`, `children`                                                                                                    | Hero banner card with badge and custom background.                              |
| `<Icon.* />`                    | `ChevronRightIcon`, `CheckIcon`, `CloseIcon`, `InfoIcon`, `WarningIcon`, `CopyIcon`, `StarIcon`                                              | Ultra-compact inline SVG icons.                                                 |
| `<Script />`                    | `fn`, `args`                                                                                                                                 | Type-safe client script serializer (renders `<script>(fn)(...args);</script>`). |

---

## 🌐 Cross-Runtime Support (Bun, Node.js & Deno)

`@ipsadt/tg-widgets` is a true zero-runtime universal library. It does not depend on React, browser DOM, or any specific JavaScript runtime.

### 1. 🧅 Bun

Bun natively understands TypeScript and TSX without extra build tools:

```json
// tsconfig.json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@ipsadt/tg-widgets"
    }
}
```

Run directly:

```bash
bun run bot.ts
```

---

### 2. 🟢 Node.js (CommonJS & ESM)

Node.js ships with dual CommonJS (`dist/index.cjs`) and ESM (`dist/index.js`), plus automatic JSX transforms (`jsx-runtime` & `jsx-dev-runtime`):

```json
// tsconfig.json
{
    "compilerOptions": {
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "jsx": "react-jsx",
        "jsxImportSource": "@ipsadt/tg-widgets"
    }
}
```

Run with `tsx` (modern Node runtime without build step):

```bash
npx tsx bot.tsx
# or: node --import tsx/esm bot.tsx
```

Or build with `tsc`, `esbuild`, or `swc` to plain JavaScript and execute with standard `node dist/bot.js`.

---

### 3. 🦕 Deno (1.x & 2.x)

Deno uses `mod.ts` and `deno.json` with native TSX execution:

```json
// deno.json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@ipsadt/tg-widgets"
    }
}
```

Import directly in your bot:

```typescript
import { Bot } from 'https://deno.land/x/grammy/mod.ts';
import {
    Button,
    Card,
    createTelegramWidgetsPlugin,
    defineWidgetScreen,
    WidgetLayout,
} from 'https://deno.land/x/tg_widgets/mod.ts';
// or: import { ... } from "jsr:@ipsadt/tg-widgets";
// or: import { ... } from "npm:@ipsadt/tg-widgets";
```

Run directly:

```bash
deno run -A bot.ts
```

---

## 📄 License

MIT © [naylour](https://github.com/naylour)

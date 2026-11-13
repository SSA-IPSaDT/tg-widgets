# @ipsadt/tg-widgets

<p align="left">
  <a href="https://www.npmjs.com/package/@ipsadt/tg-widgets"><img src="https://img.shields.io/npm/v/@ipsadt/tg-widgets.svg?style=flat&color=3178C6&logo=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@ipsadt/tg-widgets"><img src="https://img.shields.io/npm/dw/@ipsadt/tg-widgets.svg?style=flat&color=2ea44f&logo=npm" alt="npm downloads" /></a>
  <a href="https://www.npmjs.com/package/@ipsadt/tg-widgets"><img src="https://img.shields.io/npm/dt/@ipsadt/tg-widgets.svg?style=flat&color=informational&logo=npm" alt="npm total downloads" /></a>
  <a href="https://jsr.io/@ipsadt/tg-widgets"><img src="https://jsr.io/badges/@ipsadt/tg-widgets" alt="JSR" /></a>
  <a href="https://github.com/SSA-IPSaDT/tg-widgets/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/SSA-IPSaDT/tg-widgets/ci.yml?branch=main&label=CI&logo=github" alt="CI Status" /></a>
  <a href="https://core.telegram.org/bots/api#bot-api-10-4"><img src="https://img.shields.io/badge/Telegram%20Bot%20API-10.4-2CA5E0?logo=telegram&logoColor=white" alt="Telegram Bot API 10.4" /></a>
  <a href="https://github.com/SSA-IPSaDT/tg-widgets/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@ipsadt/tg-widgets.svg?style=flat&color=yellow" alt="License" /></a>
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Bun-1.2+-fbf0df?logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Deno-1.40+-000000?logo=deno&logoColor=white" alt="Deno" />
  <img src="https://img.shields.io/badge/Zero--Runtime-TSX-61DAFB?logo=react&logoColor=black" alt="Zero Runtime" />
  <img src="https://img.shields.io/badge/Payload%20Limit-%E2%89%A4%204096B%20Deflate-critical" alt="Telegram 4096B limit" />
</p>

Zero-runtime TSX UI Kit and type-safe [grammY](https://grammy.dev) plugin for **Telegram Bot API 10.4 HTML Widgets (Interactive Bubbles)**.

<p align="center">
  <img src="media/overview.gif" alt="@ipsadt/tg-widgets Bot API 10.4 Live Showcase" width="100%" />
</p>
<p align="center">
  <em>⚡ Live showcase: Connecting to Telegram Test DC, executing <code>/start</code>, and mounting interactive widgets with real-time compression diagnostics.</em>
</p>

---

> [!IMPORTANT]
>
> ### ⚠️ Project Status: Early Access & Production Battle-Testing
>
> **Telegram Bot API 10.4 with Interactive HTML Widgets was announced on November 9, 2026.**
> This library is an early-stage, cutting-edge exploration of Telegram's new native widget capabilities.
>
> 🛡️ **Tested in Battle with [Insignia](https://github.com/SSA-IPSaDT)**:
> Rather than remaining a theoretical prototype, `@ipsadt/tg-widgets` is actively developed, iterated, and battle-tested within the real-world production bot of the **[Insignia](https://github.com/SSA-IPSaDT)** ecosystem.
>
> 💬 **A Note from the Author / Maintainers:**
> We began experimenting with Bot API 10.4 on Day 1 (November 9). The HTML widget specification and cross-platform client rendering (iOS, Android, Desktop) have many subtle quirks that we are continually identifying and solving. **Please be gentle and don't judge harshly!** If you spot styling anomalies, edge cases, or have suggestions, please open an [Issue](https://github.com/SSA-IPSaDT/tg-widgets/issues) or [PR](https://github.com/SSA-IPSaDT/tg-widgets/pulls) — your feedback is tremendously appreciated.

---

## 📱 Mobile-First Design & Compact Mode

Widgets in Telegram must render gracefully across vastly different screen constraints — from wide desktop chats to ultra-narrow mobile displays. `@ipsadt/tg-widgets` is engineered with mobile-first responsive mechanics:

- **Automatic Fluid Sizing**: `WidgetLayout` adapts safely to narrow smartphone screens (320px–360px) without horizontal overflow or clipped borders.
- **Fixed Geometry Controls**: Interactive Stepper buttons preserve a strict `1:1` square aspect ratio (`min-width: 28px; max-width: 28px`), preventing distorted buttons even with multiline labels.
- **Safe Area Paddings & Touch Targets**: Generous spacing ensures tap targets are easily clickable on touchscreens without triggering accidental background clicks.
- **Dynamic Theme Palette**: Automatically conforms to user theme changes (Dark / Light / Custom Accent colors) using native `--tg-theme-*` variables and `color-mix`.

<p align="center">
  <img src="examples/alerts/screenshot.png" width="260" alt="InsigniaBot Mobile Showcase" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="examples/table/screenshot.png" width="240" alt="Mobile Table & Alerts" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="examples/controls/screenshot.png" width="280" alt="Desktop Controls Widget" />
</p>
<p align="center">
  <em>Left: InsigniaBot on mobile Android with native alerts. Center: Compact mobile table & alerts in light theme. Right: Desktop subscription controls in dark theme.</em>
</p>

---

## ⚡ Features

- **Zero Runtime JSX**: Fast TSX-to-HTML compilation with inline CSS conversion. Zero Virtual DOM and zero React dependencies.
- **Bot API 10.4 Ready**: Real-time payload size analysis and verification against the Telegram `deflate level 9 <= 4096 bytes` payload constraint (`inspectWidgetSize`).
- **Telegram Native UI Kit**: 22+ prebuilt primitives (`WidgetLayout`, `Button`, `Badge`, `Card`, `Checkbox`, `Radio`, `Switch`, `Stepper`, `ProgressBar`, `Banner`, `Avatar`, `List`, `ListItem`, `Divider`, `Typography`, `Skeleton`, `Table`, `Accordion`, `Alert`, `SegmentedControl`, `Icon`, `Script`) styled strictly via native Telegram theme variables (`--tg-theme-*`).
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
import { Button, Card, h, Script, WidgetLayout } from '@ipsadt/tg-widgets';

import { counterClientScript } from './Bubble.client';

export interface CounterBubbleProps {
    count: number;
}

export const CounterBubble = ({ count }: CounterBubbleProps): string => (
    <WidgetLayout>
        <Card>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Interactive Counter</div>
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

### 3. Choose the Screen Paradigm (`screen.ts`)

`@ipsadt/tg-widgets` supports three purpose-built screen paradigms tailored to your interaction needs:

| Paradigm                | Builder Function            | Queries (`allow_queries`) | State Storage      | Payload Byte Overhead           | Ideal For                                                  |
| :---------------------- | :-------------------------- | :------------------------ | :----------------- | :------------------------------ | :--------------------------------------------------------- |
| **Completely Static**   | `defineStaticWidgetScreen`  | `false`                   | Bypassed (0 bytes) | Minimal (No JS, no `chat_data`) | Receipts, alert banners, announcements, static dashboards  |
| **Client-Interactive**  | `defineClientWidgetScreen`  | `false`                   | Bypassed (0 bytes) | Ultra-light                     | Accordions (`<details>`), tabs, local calculators, haptics |
| **Dynamic Interactive** | `defineDynamicWidgetScreen` | `true`                    | Persisted & Synced | Standard (Compressed codec)     | Counters, polls, shopping carts, checkout, games           |

#### A. Completely Static Screen (`defineStaticWidgetScreen`)

Pure HTML and CSS representation with zero client JS runtime, zero server queries, and zero storage overhead:

```typescript
import { Alert, defineStaticWidgetScreen, WidgetLayout } from '@ipsadt/tg-widgets';

export const receiptScreen = defineStaticWidgetScreen({
    id: 'receipt',
    component: () => (
        <WidgetLayout>
            <Alert
                variant="success"
                title="Payment Approved"
                description="Transaction #9842 has been verified."
            />
        </WidgetLayout>
    ),
});
```

#### B. Client-Interactive Screen (`defineClientWidgetScreen`)

Interactive client-side behavior (DOM folding, tabs, accordions, local calculators) without sending bot queries:

```typescript
import {
    Accordion,
    AccordionItem,
    defineClientWidgetScreen,
    WidgetLayout,
} from '@ipsadt/tg-widgets';

export const faqScreen = defineClientWidgetScreen({
    id: 'faq',
    component: () => (
        <WidgetLayout>
            <Accordion>
                <AccordionItem title="Delivery terms" open>
                    Instant delivery across all regions.
                </AccordionItem>
                <AccordionItem title="Refund policy">
                    30-day money-back guarantee.
                </AccordionItem>
            </Accordion>
        </WidgetLayout>
    ),
});
```

#### C. Dynamic Interactive Screen (`defineDynamicWidgetScreen` / `defineWidgetScreen`)

Full bidirectional communication with server actions, state persistence, and `update.widget_query` routing:

```typescript
import { defineDynamicWidgetScreen } from '@ipsadt/tg-widgets';
import { CounterBubble, type CounterBubbleProps } from './Bubble';

export interface CounterState {
    count: number;
}

export const counterScreen = defineDynamicWidgetScreen({
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
import { createTelegramWidgetsPlugin, type WidgetsFlavor } from '@ipsadt/tg-widgets';
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

## ⚙️ Plugin Configuration Options

The `createTelegramWidgetsPlugin` factory provides complete control over minification, codec key compression, payload size enforcement, and storage:

```typescript
const widgets = createTelegramWidgetsPlugin({
    screens,

    // 1. Global execution mode ('prod' | 'production' | 'dev' | 'development')
    // Dev preserves unminified HTML and readable JSON keys; Prod optimizes for byte size.
    mode: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',

    // 2. Codec key minification ('prod' | 'dev' | 'off' | CodecOptions)
    // In 'prod', minimizes object keys to 1-2 letters (notifications -> o, plan -> l, __screen -> _s)
    codec: {
        mode: 'prod',
        customKeys: { userLevel: 'ul', gems: 'gm' }, // Domain-specific dictionary
        compressState: true, // Compress chat_data
        compressAnswer: true, // Compress answerWidgetQuery responses
    },

    // 3. HTML/CSS/JS minifier ('terser' | 'fast' | false | WidgetMinifyConfig)
    minifier: {
        engine: 'terser', // 'terser' (deep), 'fast' (regex), or 'none'
        purgeCss: true, // Prune unused CSS rules from <style>
    },

    // 4. Payload size limit verification (Telegram limit: 4096B deflate level 9)
    sizeLimit: {
        maxBytes: 4096,
        onExceeded: 'error', // 'error' throws, 'warn' logs warning
        autoInspect: true, // Log size metrics on send
    },

    // 5. State storage (WidgetsStorage instance or convenient memory config)
    storage: {
        defaultTtlSeconds: 86400, // State expiration TTL (24h)
        maxEntries: 2000, // Maximum LRU entries
    },

    // 6. Global defaults for sent widgets
    defaults: {
        width: 2,
        height: 2,
        allowQueries: true,
        parseMode: 'Markdown',
    },

    // 7. Verbose diagnostic logging
    debug: false,
});
```

---

## 🎮 Context Methods (`ctx.widgets`)

| Method                                             | Description                                                                                             |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `ctx.widgets.send(screenId, options)`              | Sends a widget to the target `chatId` (or current chat).                                                |
| `ctx.widgets.reply(screenId, options)`             | Sends a widget as a direct reply to the current incoming message.                                       |
| `ctx.widgets.render(screenId, props)`              | Pure render without sending. Returns `{ html, byteLength, compressedByteLength, isValid, maxAllowed }`. |
| `ctx.widgets.inspect(screenId, props, options?)`   | Inspects compressed deflate size with active plugin minification options.                               |
| `ctx.widgets.update(messageId, screenId, options)` | Updates the server `chat_data` state of an active widget message.                                       |
| `ctx.widgets.getScreen(screenId)`                  | Returns the registered screen descriptor.                                                               |
| `ctx.widgets.config`                               | Readonly access to the resolved plugin configuration (`mode`, `codec`, `minifier`, `sizeLimit`, etc.).  |

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
| `<Stepper />`                   | `id`, `value`, `min`, `max`, `step`, `decrementAction`, `incrementAction`, `disabled`                                                        | Strict non-deforming square-button stepper control compliant with Profile 1.    |
| `<ProgressBar />`               | `percent` (0-100), `color`, `trackColor`, `height`                                                                                           | Progress track for quotas, polls, or progress bars.                             |
| `<Alert />`                     | `variant` (`info`, `success`, `warning`, `destructive`), `title`, `description`, `icon`                                                      | Status notification card with accent border indicator.                          |
| `<Accordion />`                 | `items` (`title`, `content`, `defaultOpen`), `chevron`                                                                                       | Telegram native collapsible disclosure sections.                                |
| `<Table />`                     | `columns`, `data`, `striped`, `compact`                                                                                                      | Lightweight responsive tabular data viewer.                                     |
| `<SegmentedControl />`          | `name`, `options` (`value`, `label`, `icon`), `value`, `action`                                                                              | iOS/macOS styled native tabbed segment picker.                                  |
| `<Avatar />`                    | `src`, `fallback`, `size` (`xs`, `sm`, `md`, `lg`), `shape` (`circle`, `rounded`), `badge`                                                   | User/chat avatar with fallback initials and status badge.                       |
| `<List />` & `<ListItem />`     | `left`, `title`, `subtitle`, `right`, `chevron`, `interactive`, `disabled`                                                                   | Telegram cell item with left avatar/icon and right badge/chevron.               |
| `<Divider />` / `<Separator />` | `inset` (boolean or px number), `color`                                                                                                      | Subtle separator matching Telegram list dividers.                               |
| `<Typography />` / `<Text />`   | `variant` (`title`, `headline`, `subhead`, `body`, `caption`, `footnote`, `code`), `color`, `weight`, `align`, `truncate`, `as`              | Semantic typography primitives adapting to Telegram colors.                     |
| `<Skeleton />`                  | `width`, `height`, `variant` (`text`, `rect`, `circle`), `radius`                                                                            | Shimmer pulse placeholder for loading states.                                   |
| `<Banner />`                    | `badge`, `gradient`, `height`, `children`                                                                                                    | Hero banner card with badge and custom background.                              |
| `<Icon.* />`                    | `ChevronRightIcon`, `CheckIcon`, `CloseIcon`, `InfoIcon`, `WarningIcon`, `CopyIcon`, `StarIcon`                                              | Ultra-compact inline SVG icons.                                                 |
| `<LucideIcon />`                | `icon`, `size`, `color`, `strokeWidth`, `className`, `style`                                                                                 | Bundled Lucide static vector icon renderer with size & theme color adaptation.  |
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

## 🗺️ Strategic Roadmap & Ecosystem Vision

Our mission is to establish `@ipsadt/tg-widgets` as the universal UI toolkit and compression engine for Telegram Bot API 10.4 widgets across any backend stack or language.

```mermaid
flowchart LR
    A["TSX / React UI Kit"] --> B["@ipsadt/tg-widgets Compiler"]
    B --> C["grammY Middleware (Current)"]
    B --> D["Telegraf & Hono Adapters"]
    B --> E["Static AOT Bundles (.html)"]
    E --> F["Python (aiogram / PTB)"]
    E --> G["Go & Rust Bots"]
```

### Phase 1: Native Perfection & grammY (Current — v0.2.x)

- [x] Full compliance with Telegram Profile 1 HTML/CSS restrictions.
- [x] Zero-runtime TSX compiler with automated CSS style hoisting & purging.
- [x] Real-time 4096-byte deflate level 9 payload inspector (`inspectWidgetSize`).
- [x] 22+ Telegram-native UI primitives with Lucide SVG icon integration.
- [x] Pluggable session storage (Memory, Redis/DB adapters) with TTL and LRU cache.
- [x] Production battle-testing in the [Insignia](https://github.com/SSA-IPSaDT) platform.

### Phase 2: Decoupled Framework Adapters (Q1 2027)

- [ ] **Telegraf Integration**: First-class plugin for Telegraf bots (`@ipsadt/tg-widgets-telegraf`).
- [ ] **Framework-Agnostic Core**: Modular `@ipsadt/tg-widgets-core` usable with pure Node.js `http`, Elysia, Hono, Deno HTTP, and Cloudflare Workers.
- [ ] **In-Widget Navigation Router**: Push/pop view transitions within a single persistent widget bubble.

### Phase 3: Ahead-of-Time (AOT) Static Widget Compiler

- [ ] **Static Widget Build CLI (`tg-widgets build`)**: Compile TSX components into standalone, minified HTML bundles ahead of time.
- [ ] **Zero-Runtime Server Delivery**: Bots written in Python, Go, or Rust can simply serve pre-built HTML widgets without needing a Node/Bun runtime at execution time.
- [ ] **React / Web Component Export**: Re-use widget UI layouts in Web Mini Apps without rewriting markup.

### Phase 4: Multi-Language Telegram Ecosystem

- [ ] **Python Package (`aiogram-widgets` / `tg-widgets-py`)**: Official Python bindings and helpers to deserialize widget actions, update state, and respond to `widget_query` in `aiogram` and `python-telegram-bot`.
- [ ] **Go SDK**: Lightweight handler for Telegram Bot API 10.4 interactive widgets in Go.

### Phase 5: Developer Experience & Tooling

- [ ] **Live Browser Playground**: Instant hot-reloading browser preview simulating Telegram Android, iOS, and Desktop viewports and theme palettes.
- [ ] **Data Visualization Components**: Micro sparkline charts, progress rings, and compact bar charts within the 4KB limit.

---

## 🤝 Contributing & Community

We welcome contributions of all kinds! Whether you are fixing styling nuances across Telegram clients, optimizing deflate compression, or creating a brand-new UI primitive:

1. 📖 Read our [Contributing Guidelines](CONTRIBUTING.md).
2. 🐛 Report bugs using the [Bug Report Form](https://github.com/SSA-IPSaDT/tg-widgets/issues/new?template=bug_report.yml).
3. 💡 Propose ideas via the [Feature Request Form](https://github.com/SSA-IPSaDT/tg-widgets/issues/new?template=feature_request.yml).
4. 🧩 Suggest or build new UI components using the [Component Proposal Form](https://github.com/SSA-IPSaDT/tg-widgets/issues/new?template=component_proposal.yml).
5. 💬 Discuss architectures and show off widget screens in [GitHub Discussions](https://github.com/SSA-IPSaDT/tg-widgets/discussions).
6. 🛡️ Review our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).

---

## 📄 License

MIT © [naylour](https://github.com/naylour)

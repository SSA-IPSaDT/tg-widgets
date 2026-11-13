# 🚀 @ipsadt/tg-widgets Showcase & Examples (Bot API 10.4)

Interactive showcase Telegram bot (`bot.tsx`) demonstrating all UI components, state management, client-side scripts, and server actions inside real Telegram messages.

---

## 🛠️ Quick Start

### 1. Configure Environment Variables

Copy the sample environment file and provide your bot token:

```bash
cp .env.example .env
```

Edit `.env`:

```env
BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
# Enable to test on the Telegram Test DC:
TELEGRAM_TEST_ENV=false
```

> **Testing on Bot API 10.4 (Test DC):**
> For testing widgets in test groups or channels, set `TELEGRAM_TEST_ENV=true` in `.env`.

### 2. Run the Showcase Bot

```bash
# Using Bun (loads .env automatically)
bun run example

# Or run directly
bun run examples/bot.tsx

# Using Node.js with tsx
npx tsx examples/bot.tsx
```

### 3. Open Telegram

Send the `/start` command to your bot. The bot displays an interactive inline menu with all 11 screens. Each screen can also be invoked directly via its slash command.

---

## 📁 Examples Catalog & Screen Directory

Each example has a dedicated directory with source code, documentation, and a screenshot preview:

| Screen / Component   | Command       | Description                                                        | Source Code                             | Documentation & Preview                           |
| :------------------- | :------------ | :----------------------------------------------------------------- | :-------------------------------------- | :------------------------------------------------ |
| **Accordion**        | `/accordion`  | Native collapsible cards (`<details>` / `<summary>`) without JS    | [`screen.tsx`](./accordion/screen.tsx)  | [📖 accordion/README.md](./accordion/README.md)   |
| **Form Controls**    | `/controls`   | Checkbox, Switch, RadioGroup, and Stepper without `<input>` tags   | [`screen.tsx`](./controls/screen.tsx)   | [📖 controls/README.md](./controls/README.md)     |
| **Data Table**       | `/table`      | Native data table with receipt rows and download action            | [`screen.tsx`](./table/screen.tsx)      | [📖 table/README.md](./table/README.md)           |
| **Alerts & Badges**  | `/alerts`     | Status alert banners and badges with Lucide SVG icons              | [`screen.tsx`](./alerts/screen.tsx)     | [📖 alerts/README.md](./alerts/README.md)         |
| **Cards & Metrics**  | `/cards`      | Compound shadcn cards, progress bar, metric grids, and actions     | [`screen.tsx`](./cards/screen.tsx)      | [📖 cards/README.md](./cards/README.md)           |
| **Live Counter**     | `/counter`    | Real-time counter with client IIFE script and haptic vibration     | [`screen.tsx`](./counter/screen.tsx)    | [📖 counter/README.md](./counter/README.md)       |
| **Live Poll**        | `/poll`       | Community poll with animated percentage bars and live vote counts  | [`screen.tsx`](./poll/screen.tsx)       | [📖 poll/README.md](./poll/README.md)             |
| **E-Commerce**       | `/ecommerce`  | Product card, size selector, quantity stepper, and order checkout  | [`screen.tsx`](./ecommerce/screen.tsx)  | [📖 ecommerce/README.md](./ecommerce/README.md)   |
| **User Profile**     | `/profile`    | Profile card with preference switches and plain text fallback mode | [`screen.tsx`](./profile/screen.tsx)    | [📖 profile/README.md](./profile/README.md)       |
| **Chess Tournament** | `/tournament` | Event registration with role selection and Mini App deep links     | [`screen.tsx`](./tournament/screen.tsx) | [📖 tournament/README.md](./tournament/README.md) |
| **Crypto Wallet**    | `/crypto`     | TON balance card, currency conversion, copy address, and haptics   | [`screen.tsx`](./crypto/screen.tsx)     | [📖 crypto/README.md](./crypto/README.md)         |

---

## 🏗️ Architecture & Organization

All example screens follow the standard `@ipsadt/tg-widgets` contract:

- **`defineWidgetScreen({ id, component, initialState, actions })`**: Typed definition connecting JSX rendering, initial state, and server action handlers.
- **`WidgetLayout`**: Root container providing Telegram safe-area padding and responsive dimensions.
- **`<Script fn={...} args={[...]} />`**: Inlines a typed client-side IIFE into the widget HTML for optimistic UI updates and haptic events.
- **Compression Budget**: Every screen is optimized and minified with `html-minifier-terser`, verified to fit well within Telegram's strict 4096-byte deflate limit.

---

## 📸 Screen Media & Visual Previews

Save screenshots and animations directly inside each screen's directory:

| Screen              | Directory & Filename                                  |           Recommended Format           | What to Capture                                                      |
| :------------------ | :---------------------------------------------------- | :------------------------------------: | :------------------------------------------------------------------- |
| **Live Counter**    | [`examples/counter/demo.gif`](./counter/)             | **Animated GIF** (or `screenshot.png`) | Tap `Increment` button, see lock + number increase (+1).             |
| **Form Controls**   | [`examples/controls/demo.gif`](./controls/)           | **Animated GIF** (or `screenshot.png`) | Toggle switch, increment/decrement stepper, choose radio.            |
| **Live Poll**       | [`examples/poll/demo.gif`](./poll/)                   | **Animated GIF** (or `screenshot.png`) | Tap poll choice, animated progress bar expansion, percentage update. |
| **E-Commerce**      | [`examples/ecommerce/demo.gif`](./ecommerce/)         | **Animated GIF** (or `screenshot.png`) | Select size pill, stepper quantity, click Add to Cart with toast.    |
| **Accordion**       | [`examples/accordion/demo.gif`](./accordion/)         | **Animated GIF** (or `screenshot.png`) | Fold and unfold native accordion items without latency.              |
| **Data Table**      | [`examples/table/screenshot.png`](./table/)           |             **Static PNG**             | Receipt items table with clean borders and rounded corners.          |
| **Alerts & Badges** | [`examples/alerts/screenshot.png`](./alerts/)         |             **Static PNG**             | Lucide status banners (Info, Success, Warning, Error) with badges.   |
| **Cards & Metrics** | [`examples/cards/screenshot.png`](./cards/)           |             **Static PNG**             | Metric card, progress bar, action buttons.                           |
| **User Profile**    | [`examples/profile/screenshot.png`](./profile/)       |             **Static PNG**             | Avatar, notification switches, plaintext toggle.                     |
| **Chess Event**     | [`examples/tournament/screenshot.png`](./tournament/) |             **Static PNG**             | Tournament registration card with Mini App button.                   |
| **Crypto Wallet**   | [`examples/crypto/screenshot.png`](./crypto/)         |             **Static PNG**             | TON balance card with copy-address action.                           |

> 💡 **Tip for Mobile Compact Mode**: Take screenshots on both mobile (Android/iOS) and desktop. On mobile, `WidgetLayout` automatically scales to narrow screens (320px–360px) maintaining strict `1:1` square aspect ratios on buttons.

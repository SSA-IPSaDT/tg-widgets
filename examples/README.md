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

## 📸 Adding Screenshots

1. Launch the bot and open your Telegram chat (mobile or desktop).
2. Run any command (e.g. `/accordion`, `/profile`, `/crypto`).
3. Take a screenshot of the widget bubble.
4. Save the image to the respective example directory as `screenshot.png` (e.g. `examples/profile/screenshot.png`).

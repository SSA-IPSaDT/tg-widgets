# Changelog

All notable changes to `@ipsadt/tg-widgets` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-12

### Added

- **Zero-runtime TSX JSX Engine** (`h`, `Fragment`, `renderWidget`, `inspectWidgetSize`) with automatic inline style converter and deflate level 9 validation ($\le 4096$ B).
- **Universal Telegram Native UI Kit** (`WidgetLayout`, `Button`, `Badge`, `Card`, `Section`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Toggle`, `Input`, `ProgressBar`, `Banner`, `Avatar`, `List`, `ListItem`, `Divider`, `Separator`, `Typography`, `Text`, `Skeleton`, `Icon`, `Script`).
- **Telegram Widget Bridge** types (`TelegramWidgetBridge`, `Window.TelegramWidget`) conforming to Telegram Bot API 10.4.
- **Declarative Screen Framework** (`defineWidgetScreen`, `defineBubbleScreen`, `WidgetActionContext`).
- **grammY Plugin Middleware** (`createTelegramWidgetsPlugin`, `WidgetsFlavor`) with `ctx.widgets.send()`, `ctx.widgets.reply()`, `ctx.widgets.render()`, `ctx.widgets.update()`, and automated action routing.
- **Cross-Platform Support**: Works in **Bun**, **Node.js** (via bundled CJS/ESM), and **Deno** (via `mod.ts`).
- **Dual Package Distribution**: Bundled ESM (`dist/index.js`), CommonJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`).

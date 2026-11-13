# Changelog

All notable changes to `@ipsadt/tg-widgets` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-11-13

### Features

- **examples**: enable max compression pipeline and benchmark diagnostics (72002b1)

### Bug Fixes

- **release**: auto-format files before git add in version bump script (e147245)
- **controls**: restore rich UI titles, Sliders icon, and stepper geometry via framework CSS/JS minification (aeaa0a4)
- **sync**: lock interactive switches during in-flight requests and harden bot error handling (2ba85d7)
- **table**: apply corner border radius to edge cells to prevent background overflow (aab418d)
- **ui**: add table border and radius, adapt poll to accent theme, and fix stepper disabling (23ad896)
- **badge**: eliminate border clipping by removing overflow:hidden and using explicit --badge-radius for pseudo-elements (9f29ee1)
- **alert**: isolate info alert to stable informational blue and decouple from theme accent color (54aed44)
- **badge**: resolve accent color inheritance using currentColor pseudo-elements without hardcoded blue fallbacks (84dbb81)
- **table**: simplify styling to standard CSS divider lines without duplicate or bottom row borders (851fb3a)
- **controls**: disable codec by default, use native data-action and ensure multi-device sync (3daaf49)

### Performance Improvements

- **ecommerce**: optimize repeated styles with centralized classes and minifier style hoisting (065aba1)

### Documentation

- embed live showcase demos, component screenshot gallery, and polish previews (a3eb477)
- add mobile compact mode showcase, strategic roadmap, and early access status (7092f3b)

## [0.2.0] - 2026-11-13

- **Three Page Paradigms (`src/screen.ts`)**:
    - `defineStaticWidgetScreen`: Pure HTML/CSS representation with zero JS runtime, zero server queries (`allow_queries: false`), zero storage overhead, and bypassed JS minifier pass.
    - `defineClientWidgetScreen`: Client-interactive widgets (accordions, tabs, local calculation) running purely locally without bot round trips (`allow_queries: false`) or server storage overhead.
    - `defineDynamicWidgetScreen`: Full bidirectional communication with server actions, state persistence, and `update.widget_query` routing.
    - Automatic paradigm inference and backward compatibility in `defineWidgetScreen`.
- **Plugin Configuration System**: Complete configuration options in `createTelegramWidgetsPlugin`:
    - `mode`: Global preset (`'prod'` | `'dev'`) for byte-optimized production vs human-readable development.
    - `codec`: Configurable bidirectional object key minification (`'prod'`, `'dev'`, or `{ mode, customKeys, compressState, compressAnswer, injectClientSnippet }`).
    - `minifier`: Multi-engine minification (`'terser'` deep pipeline, `'fast'` synchronous regex minifier, or `'none'` raw HTML) with automated CSS purging.
    - `sizeLimit`: Deflate compression limit validation with customizable thresholds and actions (`'error'`, `'warn'`, or custom callback).
    - `storage`: In-memory LRU cache configuration shortcut (`{ defaultTtlSeconds, maxEntries }`).
    - `defaults`: Global layout parameters (`width`, `height`, `parseMode`, `allowQueries`) applied across all widgets.
    - `ctx.widgets.config`: Readonly inspection of resolved plugin settings.
    - `ctx.widgets.inspect()`: Size analysis helper with active minifier options.
- **Bidirectional State & Action Codec** (`src/codec.ts`):
    - Transparent key compression down to 1-2 letters (`compressKeys`, `decompressKeys`).
    - State packing and unpacking for Telegram `chat_data` (`packState`, `unpackState`).
    - Custom domain key dictionary registration (`registerCodecKeys`).
    - Client-side QuickJS codec snippet (`CLIENT_CODEC_SNIPPET`) for embedding into inline scripts.
- **Deep Production Minification Pipeline** (`src/minifier.ts`):
    - Integrated `html-minifier-terser` with CleanCSS level 2 and Terser JS mangler.
    - Automatic CSS selector pruning (`purgeUnusedCss`) removing unreferenced rules from `<style>` blocks.
- **Lucide SVG Vector Icons** (`src/components/LucideIcon.tsx`):
    - Bundled integration with `lucide-static` providing hundreds of featherweight vector icons.
    - Custom size, stroke-width, and theme color bindings without external runtime dependencies.
- **Strict Profile 1 Compliance for Form Controls**:
    - Rebuilt `Switch`, `Checkbox`, `Radio`, and `Stepper` without `<input>` elements to ensure 100% reliability inside Telegram's QuickJS sandbox.
- **Showcase & Example Architecture**:
    - Centralized barrel export in `examples/index.ts` covering 11 interactive screens.
    - Comprehensive English READMEs and screenshot guides for all 11 screens.
    - Complete English documentation and JSDoc throughout the codebase.

---

## [0.1.0] - 2026-11-12

### Added

- **Zero-runtime TSX JSX Engine** (`h`, `Fragment`, `renderWidget`, `inspectWidgetSize`) with automatic inline style converter and deflate level 9 validation ($\le 4096$ B).
- **Universal Telegram Native UI Kit** (`WidgetLayout`, `Button`, `Badge`, `Card`, `Section`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Toggle`, `Stepper`, `ProgressBar`, `Banner`, `Avatar`, `List`, `ListItem`, `Divider`, `Separator`, `Typography`, `Text`, `Skeleton`, `Table`, `Accordion`, `Alert`, `SegmentedControl`, `Icon`, `Script`).
- **Telegram Widget Bridge** types (`TelegramWidgetBridge`, `Window.TelegramWidget`) conforming to Telegram Bot API 10.4.
- **Declarative Screen Framework** (`defineWidgetScreen`, `defineBubbleScreen`, `WidgetActionContext`).
- **grammY Plugin Middleware** (`createTelegramWidgetsPlugin`, `WidgetsFlavor`) with `ctx.widgets.send()`, `ctx.widgets.reply()`, `ctx.widgets.render()`, `ctx.widgets.update()`, and automated action routing.
- **Cross-Platform Support**: Works in **Bun**, **Node.js** (via bundled CJS/ESM), and **Deno** (via `mod.ts`).
- **Dual Package Distribution**: Bundled ESM (`dist/index.js`), CommonJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`).

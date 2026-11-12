/**
 * @ipsadt/tg-widgets (Universal & Deno Entry Point)
 *
 * Zero-runtime TSX UI Kit and type-safe grammY plugin for Telegram Bot API 10.4 HTML Widgets.
 * Works seamlessly across Deno, Bun, and Node.js.
 *
 * @example (Deno with grammY)
 * ```ts
 * import { Bot } from "https://deno.land/x/grammy/mod.ts";
 * import {
 *   createTelegramWidgetsPlugin,
 *   defineWidgetScreen,
 *   WidgetLayout,
 *   Button,
 *   Card
 * } from "./mod.ts";
 * ```
 */

export * from './src/index';
export * from './src/action';
export * from './src/codec';
export * from './src/components/index';
export * from './src/jsx';
export * from './src/plugin';
export * from './src/screen';
export * from './src/storage';
export * from './src/widget-bridge';

// Export JSX runtime primitives for Deno & Node manual pragma usage
export { Fragment, h, jsx, jsxDEV, jsxs } from './src/jsx';

import type { WidgetSizeReport } from '../jsx';
import type { AnyWidgetScreen } from '../screen';
import type { WidgetsStorage } from '../storage';
import type { MinifierConfig, ResolvedPluginConfig, SizeLimitConfig } from './types';

export interface SendWidgetOptions<TProps> {
    chatId?: number | string;
    props?: TProps;
    messageThreadId?: number;
    width?: number;
    height?: number;
    caption?: string;
    captionEntities?: unknown[];
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    publicData?: string;
    replyMarkup?: unknown;
    allowQueries?: boolean;
    isShared?: boolean;
    replyParameters?: { message_id: number; [key: string]: unknown };
    minifier?: MinifierConfig;
    compressState?: boolean;
    sizeLimit?: SizeLimitConfig;
    skipStorage?: boolean;
}

export type SendBubbleOptions<TProps> = SendWidgetOptions<TProps>;

export interface UpdateWidgetOptions<TProps> {
    chatId?: number | string;
    props?: TProps;
    state?: Record<string, unknown>;
    compressState?: boolean;
}

export interface WidgetsController<TScreens extends Record<string, AnyWidgetScreen>> {
    send: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    reply: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    render: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => WidgetSizeReport;

    renderAsync: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => Promise<WidgetSizeReport>;

    update: <K extends keyof TScreens & string>(
        messageId: number,
        screenId: K,
        options: UpdateWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<unknown>;

    getScreen: (screenId: string) => AnyWidgetScreen | undefined;

    inspect: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
        options?: { minifier?: MinifierConfig },
    ) => Promise<WidgetSizeReport>;

    storage: WidgetsStorage;
    readonly config: ResolvedPluginConfig;
}

export type BubblesController<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsController<TScreens>;

export type WidgetsFlavor<TScreens extends Record<string, AnyWidgetScreen>> = {
    widgets: WidgetsController<TScreens>;
    bubbles: WidgetsController<TScreens>;
};

export type BubblesFlavor<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsFlavor<TScreens>;

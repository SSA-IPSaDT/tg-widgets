declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }

    interface Window {
        TelegramWidget?: import('../src/widget-bridge').TelegramWidgetBridge;
    }
    var TelegramWidget: import('../src/widget-bridge').TelegramWidgetBridge | undefined;
}

export {};

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    defineDynamicWidgetScreen,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

/**
 * State contract for the interactive counter widget.
 */
export interface CounterState {
    count: number;
}

/**
 * Client-side script providing instant optimistic UI updates and server synchronization.
 */
const clientCounterScript = (args: { count: number }) => {
    const widget = window.TelegramWidget;
    const incrementButton = document.getElementById('btn-inc');
    const decrementButton = document.getElementById('btn-dec');
    const counterValueElement = document.getElementById('counter-val');
    let count = args.count;

    const setCount = (newCount: number) => {
        count = newCount;
        if (counterValueElement) counterValueElement.textContent = String(count);
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (typeof parsedData?.count === 'number') setCount(parsedData.count);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    incrementButton?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        setCount(count + 1);
        widget?.request?.('inc').then((response) => {
            if (response?.result) {
                try {
                    const parsedData = JSON.parse(response.result);
                    if (typeof parsedData?.count === 'number') setCount(parsedData.count);
                } catch {
                    // ignore JSON parse errors
                }
            }
        });
    });

    decrementButton?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        setCount(count - 1);
        widget?.request?.('dec').then((response) => {
            if (response?.result) {
                try {
                    const parsedData = JSON.parse(response.result);
                    if (typeof parsedData?.count === 'number') setCount(parsedData.count);
                } catch {
                    // ignore JSON parse errors
                }
            }
        });
    });
};

/**
 * Interactive counter widget screen demonstrating client-side IIFE scripting,
 * haptic feedback, and server action synchronization via `window.TelegramWidget.request()`.
 * Defines a dynamic widget screen:
 * - Full bidirectional communication with the Telegram bot (allow_queries: true)
 * - State synchronization and persistence via storage
 * - Handles inc and dec action queries
 *
 * @example
 * ```tsx
 * import { counterScreen } from './counter/screen';
 *
 * await bot.api.sendMessage(chatId, 'Counter', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Open Counter',
 *       callback_data: 'open_counter'
 *     }]]
 *   }
 * });
 * ```
 */
export const counterScreen = defineDynamicWidgetScreen({
    id: 'counter',
    component: (props: CounterState) => (
        <WidgetLayout fullWidth padding="6px 8px">
            <Card fullWidth>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Live Counter</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Zap,
                                size: 15,
                                color: 'var(--tg-theme-link-color, #2481cc)',
                            })}
                        />
                    </div>
                    <CardDescription>
                        Client script sends requests to the bot via TelegramWidget.request()
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px 0',
                            gap: 16,
                        }}
                    >
                        <div
                            id="counter-val"
                            style={{
                                fontSize: 52,
                                fontWeight: 800,
                                color: 'var(--tg-theme-button-color, #2481cc)',
                                letterSpacing: -1,
                            }}
                        >
                            {props.count}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 10,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        >
                            <Button id="btn-dec" variant="secondary" fullWidth size="md">
                                −1
                            </Button>
                            <Button id="btn-inc" variant="primary" fullWidth size="md">
                                +1
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Script fn={clientCounterScript} args={[{ count: props.count }]} />
        </WidgetLayout>
    ),
    initialState: (props?: Partial<CounterState>): CounterState => ({
        count: props?.count ?? 0,
    }),
    actions: {
        inc: async (ctx: WidgetActionContext<CounterState>) => {
            const next = { count: ctx.state.count + 1 };
            await ctx.setState(next);
            return next;
        },
        dec: async (ctx: WidgetActionContext<CounterState>) => {
            const next = { count: ctx.state.count - 1 };
            await ctx.setState(next);
            return next;
        },
    },
});

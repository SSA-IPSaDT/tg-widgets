import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    ProgressBar,
    Script,
    Typography,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

const cardsClientScript = () => {
    const widget = window.TelegramWidget;

    document.getElementById('btn-statement')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        widget?.request?.('statement');
    });

    document.getElementById('btn-topup')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        widget?.request?.('topup');
    });
};

/**
 * State contract for the cards widget.
 */
export type CardsState = Record<string, never>;

/**
 * Metric cards screen featuring balance summaries, progress bars, and quick actions.
 * Demonstrates shadcn/ui compound card architecture inside Telegram bubbles.
 *
 * @example
 * await ctx.widgets.reply('cards', { props: {} });
 */
export const cardsScreen = defineWidgetScreen({
    id: 'cards',
    component: () => (
        <WidgetLayout fullWidth padding="6px 8px">
            <Card fullWidth style={{ position: 'relative' }}>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Balance Analytics</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Crown,
                                size: 15,
                                color: '#f59e0b',
                            })}
                        />
                    </div>
                    <CardDescription>Summary of activity over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                        }}
                    >
                        <Typography variant="title">14,820 TON</Typography>
                        <span
                            style={{
                                color: '#10b981',
                                fontWeight: 700,
                                fontSize: 13,
                            }}
                        >
                            +18.4% ↑
                        </span>
                    </div>

                    <ProgressBar percent={72} />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: 'var(--tg-theme-text-color, #111827)',
                            opacity: 0.65,
                        }}
                    >
                        <span>Request Limit</span>
                        <span>7,200 / 10,000</span>
                    </div>

                    <Divider />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                padding: '8px 10px',
                                background: 'rgba(120, 120, 128, 0.08)',
                                borderRadius: 8,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--tg-theme-text-color, #111827)',
                                    opacity: 0.65,
                                }}
                            >
                                Transactions
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>142</div>
                        </div>
                        <div
                            style={{
                                padding: '8px 10px',
                                background: 'rgba(120, 120, 128, 0.08)',
                                borderRadius: 8,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--tg-theme-text-color, #111827)',
                                    opacity: 0.65,
                                }}
                            >
                                Conversion
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>98.4%</div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Button id="btn-statement" variant="secondary" fullWidth size="md">
                            Statement
                        </Button>
                        <Button
                            id="btn-topup"
                            variant="primary"
                            fullWidth
                            size="md"
                            icon={LucideIcon({
                                icon: LucideIcons.Sparkles,
                                size: 14,
                                color: '#ffffff',
                                style: { marginRight: 4 },
                            })}
                        >
                            Add Funds
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            <Script fn={cardsClientScript} />
        </WidgetLayout>
    ),
    initialState: () => ({}),
    actions: {
        statement: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            return ctx.answer({
                text: '📄 Generating account statement...',
                show_alert: false,
            });
        },
        topup: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            return ctx.answer({
                text: '💳 Opening payment gateway...',
                show_alert: false,
            });
        },
    },
});

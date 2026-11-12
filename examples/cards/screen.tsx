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
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    const toast = document.getElementById('cards-toast');

    const showToast = (text: string) => {
        if (toast) {
            toast.textContent = text;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    };

    document.getElementById('btn-statement')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        showToast('📄 Выписка формируется...');
        W?.request?.('statement');
    });

    document.getElementById('btn-topup')?.addEventListener('click', () => {
        W?.HapticFeedback?.notificationOccurred?.('success');
        showToast('💳 Открываем шлюз пополнения...');
        W?.request?.('topup');
    });
};

/**
 * Экран составных карточек shadcn/ui с метриками, прогрессом и быстрыми действиями
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
                        <CardTitle>Аналитика баланса</CardTitle>
                        <Badge variant="accent">Pro VIP</Badge>
                    </div>
                    <CardDescription>
                        Сводка за последние 30 дней активности
                    </CardDescription>
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
                        <span>Лимит запросов</span>
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
                                Транзакций
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                                142
                            </div>
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
                                Конверсия
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                                98.4%
                            </div>
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
                        <Button
                            id="btn-statement"
                            variant="secondary"
                            fullWidth
                            size="md"
                        >
                            Выписка
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
                            Пополнить
                        </Button>
                    </div>
                </CardFooter>

                {/* Всплывающее уведомление внутри виджета */}
                <div
                    id="cards-toast"
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        background: 'var(--tg-theme-button-color, #2481cc)',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        zIndex: 10,
                    }}
                />
            </Card>
            <Script fn={cardsClientScript} />
        </WidgetLayout>
    ),
    initialState: () => ({}),
    actions: {
        statement: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            await ctx.answer('STATEMENT_GENERATING');
            return { ok: true };
        },
        topup: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            await ctx.answer('TOPUP_INITIATED');
            return { ok: true };
        },
    },
});

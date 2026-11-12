import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    type WidgetActionContext,
    WidgetLayout,
} from '../../src';

export interface CryptoState {
    balanceTon: number;
    rateUsd: number;
    lastTx?: string;
}

const cryptoClientScript = () => {
    const widget = (window as unknown as { TelegramWidget?: any }).TelegramWidget;

    document.getElementById('btn-send')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('medium');
        widget?.request?.('sendTon');
    });

    document.getElementById('btn-receive')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        widget?.copyText?.('EQB_TON_WALLET_DEMO_ADDRESS_2026');
        widget?.request?.('receiveTon');
    });
};

/**
 * Экран крипто-кошелька (TON Wallet Card) с быстрыми переводами
 */
export const cryptoScreen = defineWidgetScreen({
    id: 'crypto',
    component: (props: CryptoState) => {
        const totalUsd = (props.balanceTon * props.rateUsd).toFixed(2);

        return (
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
                            <CardTitle>TON Wallet</CardTitle>
                            <Badge
                                variant="accent"
                                icon={LucideIcon({
                                    icon: LucideIcons.Sparkles,
                                    size: 15,
                                    color: 'var(--tg-theme-link-color, #2481cc)',
                                })}
                            />
                        </div>
                        <CardDescription>Основной счёт Telegram</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Баланс */}
                        <div style={{ textAlign: 'center', padding: '6px 0 12px 0' }}>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    color: 'var(--tg-theme-text-color, inherit)',
                                }}
                            >
                                {props.balanceTon.toFixed(2)} TON
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: 'var(--tg-theme-link-color, var(--tg-theme-text-color, #2481cc))',
                                    fontWeight: 600,
                                    marginTop: 2,
                                }}
                            >
                                ≈ ${totalUsd} USD
                            </div>
                        </div>

                        {/* Кнопки быстрых действий */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                id="btn-send"
                                variant="primary"
                                fullWidth
                                size="md"
                                icon={LucideIcon({
                                    icon: LucideIcons.Download,
                                    size: 15,
                                    color: '#ffffff',
                                    style: { transform: 'rotate(180deg)', marginRight: 4 },
                                })}
                            >
                                Отправить
                            </Button>
                            <Button
                                id="btn-receive"
                                variant="secondary"
                                fullWidth
                                size="md"
                                icon={LucideIcon({
                                    icon: LucideIcons.Download,
                                    size: 15,
                                    style: { marginRight: 4 },
                                })}
                            >
                                Получить
                            </Button>
                        </div>

                        <Divider />

                        {/* Последняя активность */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                            }}
                        >
                            <span style={{ opacity: 0.75 }}>Курс TON/USD:</span>
                            <span style={{ fontWeight: 600 }}>${props.rateUsd}</span>
                        </div>
                    </CardContent>
                </Card>
                <Script fn={cryptoClientScript} />
            </WidgetLayout>
        );
    },
    initialState: () => ({
        balanceTon: 420.5,
        rateUsd: 5.5,
    }),
    actions: {
        sendTon: (ctx: WidgetActionContext<CryptoState>) => {
            return ctx.answer({ text: 'Переход в диалог отправки...' });
        },
        receiveTon: (ctx: WidgetActionContext<CryptoState>) => {
            return ctx.answer({ text: 'Адрес кошелька скопирован' });
        },
    },
});

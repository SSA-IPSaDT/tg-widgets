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

/**
 * State contract for the cryptocurrency wallet widget.
 */
export interface CryptoState {
    balanceTon: number;
    rateUsd: number;
    lastTx?: string;
}

/**
 * Client-side script handling haptic responses and clipboard actions.
 */
const cryptoClientScript = () => {
    const widget = window.TelegramWidget;

    document.getElementById('btn-send')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('medium');
        widget?.openLink?.('https://google.com');
        widget?.request?.('sendTon');
    });

    document.getElementById('btn-receive')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        widget?.copyText?.('EQB_TON_WALLET_DEMO_ADDRESS_2026');
        widget?.request?.('receiveTon');
    });
};

/**
 * TON Wallet card widget screen showcasing balance presentation, quick transfer actions,
 * clipboard copying, and haptic feedback.
 *
 * @example
 * ```tsx
 * import { cryptoScreen } from './crypto/screen';
 *
 * await bot.api.sendMessage(chatId, 'Wallet', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Open Wallet',
 *       callback_data: 'open_crypto'
 *     }]]
 *   }
 * });
 * ```
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
                                })}
                            />
                        </div>
                        <CardDescription>Primary Telegram Account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Balance display */}
                        <div style={{ textAlign: 'center', padding: '6px 0 12px 0' }}>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    color: 'var(--tg-theme-text-color)',
                                }}
                            >
                                {props.balanceTon.toFixed(2)} TON
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: 'var(--tg-theme-link-color, var(--tg-theme-text-color))',
                                    fontWeight: 600,
                                    marginTop: 2,
                                }}
                            >
                                ≈ ${totalUsd} USD
                            </div>
                        </div>

                        {/* Quick action buttons */}
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
                                Send
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
                                Receive
                            </Button>
                        </div>

                        <Divider />

                        {/* Market rate */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                            }}
                        >
                            <span style={{ opacity: 0.75 }}>TON / USD Rate:</span>
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
            return ctx.answer({ text: 'Redirecting to transfer flow...' });
        },
        receiveTon: (ctx: WidgetActionContext<CryptoState>) => {
            return ctx.answer({ text: 'Wallet address copied to clipboard' });
        },
    },
});

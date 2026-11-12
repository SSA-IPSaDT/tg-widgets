import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    h,
    Script,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

export interface CounterState {
    count: number;
}

const clientCounterScript = (args: { count: number }) => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    const btnInc = document.getElementById('btn-inc');
    const btnDec = document.getElementById('btn-dec');
    const valEl = document.getElementById('counter-val');

    btnInc?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        W?.request?.('inc').then((res: { result?: string }) => {
            if (res?.result && valEl) {
                const data = JSON.parse(res.result);
                valEl.textContent = String(data.count);
            }
        });
    });

    btnDec?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        W?.request?.('dec').then((res: { result?: string }) => {
            if (res?.result && valEl) {
                const data = JSON.parse(res.result);
                valEl.textContent = String(data.count);
            }
        });
    });
};

/**
 * Экран интерактивного счетчика с клиентским IIFE скриптом
 */
export const counterScreen = defineWidgetScreen({
    id: 'counter',
    component: (props: CounterState) => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Живой счётчик</CardTitle>
                        <Badge variant="default">Client IIFE</Badge>
                    </div>
                    <CardDescription>
                        Клиентский скрипт отправляет запросы серверу через
                        W.request()
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px 0',
                            gap: 12,
                        }}
                    >
                        <div
                            id="counter-val"
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                color: 'var(--tg-theme-button-color, #2481cc)',
                            }}
                        >
                            {props.count}
                        </div>
                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                            <Button
                                id="btn-dec"
                                variant="secondary"
                                fullWidth
                                size="md"
                            >
                                −1
                            </Button>
                            <Button
                                id="btn-inc"
                                variant="primary"
                                fullWidth
                                size="md"
                            >
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

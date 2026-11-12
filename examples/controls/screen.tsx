import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    defineWidgetScreen,
    Divider,
    h,
    Radio,
    RadioGroup,
    Script,
    Stepper,
    Switch,
    type WidgetActionContext,
    WidgetLayout,
} from '../../src';

export interface ControlsState {
    notifications: boolean;
    newsletter: boolean;
    plan: string;
    tickets: number;
}

const controlsClientScript = (initial: ControlsState) => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    let state = { ...initial };

    const updateUI = (s: typeof state) => {
        state = { ...s };

        // 1. Switch
        const sw = document.getElementById('toggle-notify');
        const track = sw?.querySelector('.tg-switch-track') as HTMLElement | null;
        const thumb = sw?.querySelector('.tg-switch-thumb') as HTMLElement | null;
        if (track && thumb) {
            track.style.backgroundColor = state.notifications
                ? 'var(--tg-theme-button-color, #2481cc)'
                : 'rgba(120, 120, 128, 0.24)';
            thumb.style.left = state.notifications ? '20px' : '2px';
        }

        // 2. Checkbox
        const chk = document.getElementById('chk-newsletter');
        const chkSvg = chk?.querySelector('svg');
        if (chkSvg) {
            chkSvg.outerHTML = state.newsletter
                ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color, #2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="var(--tg-theme-button-text-color, #ffffff)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))" stroke-width="1.5"/></svg>';
        }

        // 3. Stepper
        const st = document.getElementById('stepper-tickets');
        const valSpan = st?.querySelector('span');
        if (valSpan) {
            valSpan.textContent = String(state.tickets);
        }

        // 4. Radio buttons
        const rBasic = document.getElementById('plan-basic');
        const rPro = document.getElementById('plan-pro');
        if (rBasic?.querySelector('svg')) {
            rBasic.querySelector('svg')!.outerHTML =
                state.plan === 'basic'
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color, #2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color, #2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))" stroke-width="1.5"/></svg>';
        }
        if (rPro?.querySelector('svg')) {
            rPro.querySelector('svg')!.outerHTML =
                state.plan === 'pro'
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color, #2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color, #2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))" stroke-width="1.5"/></svg>';
        }
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('medium');
        state.notifications = !state.notifications;
        updateUI(state);
        W?.request?.('toggleNotifications');
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        state.newsletter = !state.newsletter;
        updateUI(state);
        W?.request?.('toggleNewsletter');
    });

    const st = document.getElementById('stepper-tickets');
    const btns = st?.querySelectorAll('button');
    if (btns && btns[0] && btns[1]) {
        btns[0].addEventListener('click', () => {
            if (state.tickets > 1) {
                W?.HapticFeedback?.impactOccurred?.('light');
                state.tickets--;
                updateUI(state);
                W?.request?.('ticketMinus');
            }
        });
        btns[1].addEventListener('click', () => {
            if (state.tickets < 10) {
                W?.HapticFeedback?.impactOccurred?.('light');
                state.tickets++;
                updateUI(state);
                W?.request?.('ticketPlus');
            }
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        W?.HapticFeedback?.selectionChanged?.();
        state.plan = 'basic';
        updateUI(state);
        W?.request?.('setPlan:basic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        W?.HapticFeedback?.selectionChanged?.();
        state.plan = 'pro';
        updateUI(state);
        W?.request?.('setPlan:pro');
    });
};

/**
 * Экран элементов управления: Switch, Checkbox, RadioGroup и Stepper с живой реактивностью
 */
export const controlsScreen = defineWidgetScreen({
    id: 'controls',
    component: (props: ControlsState) => (
        <WidgetLayout expand>
            <Card fullWidth>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Настройки подписки</CardTitle>
                        <Badge variant="accent">Live State</Badge>
                    </div>
                    <CardDescription>
                        Чекбоксы, переключатели и степпер без тега &lt;input&gt;
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
                        {/* Switch */}
                        <Switch
                            id="toggle-notify"
                            checked={props.notifications}
                            action="toggleNotifications"
                            label="Уведомления"
                            description="Получать сообщения о важных событиях"
                        />

                        <Divider />

                        {/* Checkbox */}
                        <Checkbox
                            id="chk-newsletter"
                            checked={props.newsletter}
                            action="toggleNewsletter"
                            label="Дайджест обновлений"
                            description="Еженедельная рассылка новостей"
                        />

                        <Divider />

                        {/* Stepper */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    Количество мест
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--tg-theme-hint-color, #888)',
                                    }}
                                >
                                    Билеты на мероприятие
                                </div>
                            </div>
                            <Stepper
                                id="stepper-tickets"
                                value={props.tickets}
                                min={1}
                                max={10}
                                decrementAction="ticketMinus"
                                incrementAction="ticketPlus"
                            />
                        </div>

                        <Divider />

                        {/* Radio buttons */}
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 6,
                                }}
                            >
                                Тарифный план
                            </div>
                            <RadioGroup gap={6}>
                                <Radio
                                    id="plan-basic"
                                    value="basic"
                                    action="setPlan:basic"
                                    checked={props.plan === 'basic'}
                                    label="Базовый"
                                    description="Бесплатный доступ к основным функциям"
                                />
                                <Radio
                                    id="plan-pro"
                                    value="pro"
                                    action="setPlan:pro"
                                    checked={props.plan === 'pro'}
                                    label="Pro аккаунт"
                                    description="Приоритетная поддержка и расширенные лимиты"
                                />
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Script fn={controlsClientScript} args={[props]} />
        </WidgetLayout>
    ),
    initialState: (props?: Partial<ControlsState>): ControlsState => ({
        notifications: props?.notifications ?? true,
        newsletter: props?.newsletter ?? false,
        plan: props?.plan ?? 'pro',
        tickets: props?.tickets ?? 2,
    }),
    actions: {
        toggleNotifications: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                notifications: !ctx.state.notifications,
            };
            await ctx.setState(next);
            return next;
        },
        toggleNewsletter: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = { ...ctx.state, newsletter: !ctx.state.newsletter };
            await ctx.setState(next);
            return next;
        },
        ticketPlus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.min(10, ctx.state.tickets + 1),
            };
            await ctx.setState(next);
            return next;
        },
        ticketMinus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.max(1, ctx.state.tickets - 1),
            };
            await ctx.setState(next);
            return next;
        },
        setPlan: async (
            ctx: WidgetActionContext<ControlsState>,
            payload?: unknown,
        ) => {
            const next = { ...ctx.state, plan: String(payload ?? 'basic') };
            await ctx.setState(next);
            return next;
        },
    },
});

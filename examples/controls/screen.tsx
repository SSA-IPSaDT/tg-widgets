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
    LucideIcon,
    LucideIcons,
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

    const updateUI = (s: Partial<ControlsState>) => {
        state = { ...state, ...s };

        if ('notifications' in s) {
            document
                .getElementById('toggle-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', Boolean(state.notifications));
        }

        if ('newsletter' in s) {
            const chkSvg = document
                .getElementById('chk-newsletter')
                ?.querySelector('svg');
            if (chkSvg) {
                chkSvg.outerHTML = state.newsletter
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color,#2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';
            }
        }

        if ('tickets' in s) {
            const valSpan = document
                .getElementById('stepper-tickets')
                ?.querySelector('.tg-stepper-val');
            if (valSpan) {
                valSpan.textContent = String(state.tickets);
            }
        }

        if ('plan' in s) {
            const rSvg = (sel: boolean) =>
                sel
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color,#2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color,#2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';

            const bSvg = document.getElementById('plan-basic')?.querySelector('svg');
            if (bSvg) bSvg.outerHTML = rSvg(state.plan === 'basic');
            const pSvg = document.getElementById('plan-pro')?.querySelector('svg');
            if (pSvg) pSvg.outerHTML = rSvg(state.plan === 'pro');
        }
    };

    const syncState = () => {
        try {
            if (W?.chatData) {
                const d = JSON.parse(W.chatData);
                if (d && typeof d === 'object') updateUI(d);
            }
        } catch {}
    };

    syncState();
    W?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string) => {
        W?.request?.(action).then((res: { result?: string }) => {
            if (res?.result) {
                try {
                    const d = JSON.parse(res.result);
                    if (d && typeof d === 'object') updateUI(d);
                } catch {}
            }
        });
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('medium');
        updateUI({ notifications: !state.notifications });
        sendAction('toggleNotifications');
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        updateUI({ newsletter: !state.newsletter });
        sendAction('toggleNewsletter');
    });

    const btns = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (btns && btns[0] && btns[1]) {
        btns[0].addEventListener('click', () => {
            if (state.tickets > 1) {
                W?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets - 1 });
                sendAction('ticketMinus');
            }
        });
        btns[1].addEventListener('click', () => {
            if (state.tickets < 10) {
                W?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets + 1 });
                sendAction('ticketPlus');
            }
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        W?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'basic' });
        sendAction('setPlan:basic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        W?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'pro' });
        sendAction('setPlan:pro');
    });
};

/**
 * Экран элементов управления: Switch, Checkbox, RadioGroup и Stepper с живой реактивностью
 */
export const controlsScreen = defineWidgetScreen({
    id: 'controls',
    component: (props: ControlsState) => (
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
                        <CardTitle>Настройки подписки</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Sliders,
                                size: 15,
                                color: 'var(--tg-theme-link-color, #2481cc)',
                            })}
                        />
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
                                    class="tg-description"
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                                        opacity: 0.85,
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

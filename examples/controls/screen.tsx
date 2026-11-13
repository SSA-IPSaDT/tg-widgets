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

/**
 * State contract for the subscription & form controls widget.
 */
export interface ControlsState {
    notifications: boolean;
    newsletter: boolean;
    plan: string;
    tickets: number;
}

/**
 * Client-side script providing instant optimistic UI feedback for controls.
 */
const controlsClientScript = (initial: ControlsState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };

    const updateUI = (partialState: Partial<ControlsState>) => {
        state = { ...state, ...partialState };

        if ('notifications' in partialState) {
            document
                .getElementById('toggle-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', Boolean(state.notifications));
        }

        if ('newsletter' in partialState) {
            const checkboxSvg = document
                .getElementById('chk-newsletter')
                ?.querySelector('svg');
            if (checkboxSvg) {
                checkboxSvg.outerHTML = state.newsletter
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color,#2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';
            }
        }

        if ('tickets' in partialState) {
            const stepperValueElement = document
                .getElementById('stepper-tickets')
                ?.querySelector('.tg-stepper-val');
            if (stepperValueElement) {
                stepperValueElement.textContent = String(state.tickets);
            }
        }

        if ('plan' in partialState) {
            const renderRadioSvg = (isSelected: boolean) =>
                isSelected
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color,#2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color,#2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';

            const basicRadioSvg = document.getElementById('plan-basic')?.querySelector('svg');
            if (basicRadioSvg) basicRadioSvg.outerHTML = renderRadioSvg(state.plan === 'basic');
            const proRadioSvg = document.getElementById('plan-pro')?.querySelector('svg');
            if (proRadioSvg) proRadioSvg.outerHTML = renderRadioSvg(state.plan === 'pro');
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (parsedData && typeof parsedData === 'object') updateUI(parsedData);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string) => {
        widget?.request?.(action).then((response) => {
            if (response?.result) {
                try {
                    const parsedData = JSON.parse(response.result);
                    if (parsedData && typeof parsedData === 'object') updateUI(parsedData);
                } catch {
                    // ignore JSON parse errors
                }
            }
        });
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('medium');
        updateUI({ notifications: !state.notifications });
        sendAction('toggleNotifications');
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateUI({ newsletter: !state.newsletter });
        sendAction('toggleNewsletter');
    });

    const stepperButtons = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (stepperButtons && stepperButtons[0] && stepperButtons[1]) {
        stepperButtons[0].addEventListener('click', () => {
            if (state.tickets > 1) {
                widget?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets - 1 });
                sendAction('ticketMinus');
            }
        });
        stepperButtons[1].addEventListener('click', () => {
            if (state.tickets < 10) {
                widget?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets + 1 });
                sendAction('ticketPlus');
            }
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'basic' });
        sendAction('setPlan:basic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'pro' });
        sendAction('setPlan:pro');
    });
};

/**
 * Controls widget screen demonstrating Switch, Checkbox, RadioGroup, and Stepper
 * components with client-side optimistic UI updates and haptic feedback.
 *
 * @example
 * ```tsx
 * import { controlsScreen } from './controls/screen';
 *
 * await bot.api.sendMessage(chatId, 'Settings', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Open Controls',
 *       callback_data: 'open_controls'
 *     }]]
 *   }
 * });
 * ```
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
                        <CardTitle>Subscription Settings</CardTitle>
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
                        Checkboxes, switches, and steppers with zero native form controls
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
                            label="Notifications"
                            description="Receive alerts for important updates"
                        />

                        <Divider />

                        {/* Checkbox */}
                        <Checkbox
                            id="chk-newsletter"
                            checked={props.newsletter}
                            action="toggleNewsletter"
                            label="Weekly Newsletter"
                            description="Product updates and feature highlights"
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
                                    Seat Allocation
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
                                    Event entry passes
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
                                Subscription Plan
                            </div>
                            <RadioGroup gap={6}>
                                <Radio
                                    id="plan-basic"
                                    value="basic"
                                    action="setPlan:basic"
                                    checked={props.plan === 'basic'}
                                    label="Basic"
                                    description="Free access to essential features"
                                />
                                <Radio
                                    id="plan-pro"
                                    value="pro"
                                    action="setPlan:pro"
                                    checked={props.plan === 'pro'}
                                    label="Pro Plan"
                                    description="Priority support and expanded limits"
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

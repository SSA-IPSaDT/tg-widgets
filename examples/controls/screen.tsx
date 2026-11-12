import {
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

/**
 * Экран элементов управления: Switch, Checkbox, RadioGroup и Stepper
 */
export const controlsScreen = defineWidgetScreen({
    id: 'controls',
    component: (props: ControlsState) => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <CardTitle>Настройки подписки</CardTitle>
                    <CardDescription>
                        Чекбоксы, переключатели и степпер без использования тега &lt;input&gt;
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

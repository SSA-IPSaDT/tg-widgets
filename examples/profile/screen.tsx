import {
    Alert,
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
    Script,
    Switch,
    type WidgetActionContext,
    WidgetLayout,
} from "../../src";

export interface ProfileState {
    name: string;
    username: string;
    notifications: boolean;
    privateMode: boolean;
    soundEffects: boolean;
}

const profileClientScript = (initial: ProfileState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };

    const updateProfileUI = (data?: Partial<ProfileState> | null) => {
        if (!data) return;
        state = { ...state, ...data };

        if (typeof state.notifications === 'boolean') {
            document
                .getElementById('profile-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', state.notifications);
        }

        if (typeof state.privateMode === 'boolean') {
            document
                .getElementById('profile-private')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', state.privateMode);
        }

        if (typeof state.soundEffects === 'boolean') {
            document
                .getElementById('profile-sound')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', state.soundEffects);
        }
    };

    const syncFromChatData = () => {
        try {
            if (widget?.chatData) {
                const parsed = JSON.parse(widget.chatData);
                updateProfileUI(parsed);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncFromChatData();
    widget?.onEvent?.('chatDataChanged', syncFromChatData);

    const bindToggle = (
        elementId: string,
        key: 'notifications' | 'privateMode' | 'soundEffects',
        actionName: string,
    ) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.addEventListener('click', () => {
            widget?.HapticFeedback?.impactOccurred?.('light');
            const nextVal = !state[key];
            updateProfileUI({ [key]: nextVal });

            widget?.request?.(actionName).then((response) => {
                if (response?.result) {
                    try {
                        const parsed = JSON.parse(response.result);
                        updateProfileUI(parsed);
                    } catch {
                        // ignore JSON parse errors
                    }
                }
            });
        });
    };

    bindToggle('profile-notify', 'notifications', 'toggleProfileNotify');
    bindToggle('profile-private', 'privateMode', 'toggleProfilePrivate');
    bindToggle('profile-sound', 'soundEffects', 'toggleProfileSound');

    document.getElementById('btn-fallback')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('warning');
        widget?.request?.('fallbackToText');
    });
};

/**
 * Экран профиля пользователя с интерактивными настройками и плашкой fallback
 */
export const profileScreen = defineWidgetScreen({
    id: 'profile',
    component: (props: ProfileState) => (
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
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    background:
                                        'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc), #8b5cf6)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    flexShrink: 0,
                                }}
                            >
                                {props.name.charAt(0)}
                            </div>
                            <div>
                                <CardTitle style={{ fontSize: 15 }}>
                                    {props.name}
                                </CardTitle>
                                <CardDescription style={{ fontSize: 12 }}>
                                    {props.username}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Shield,
                                size: 15,
                                color: 'var(--tg-theme-link-color, #2481cc)',
                            })}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                        }}
                    >
                        <Switch
                            id="profile-notify"
                            checked={props.notifications}
                            action="toggleProfileNotify"
                            label="Уведомления бота"
                            description="Мгновенные оповещения о событиях"
                        />

                        <Divider />

                        <Switch
                            id="profile-private"
                            checked={props.privateMode}
                            action="toggleProfilePrivate"
                            label="Приватный профиль"
                            description="Скрыть активность из общего рейтинга"
                        />

                        <Divider />

                        <Switch
                            id="profile-sound"
                            checked={props.soundEffects}
                            action="toggleProfileSound"
                            label="Звуковые сигналы"
                            description="Звуковое сопровождение интерфейса"
                        />
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <Alert
                            variant="warning"
                            title="Экспериментальная функция"
                            description="Виджеты находятся на стадии тестирования. При неполадках переключите режим."
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        id="btn-fallback"
                        variant="outline"
                        fullWidth
                        size="md"
                        icon={LucideIcon({
                            icon: LucideIcons.ExternalLink,
                            size: 14,
                            style: { marginRight: 4 },
                        })}
                    >
                        Обычное представление
                    </Button>
                </CardFooter>
            </Card>
            <Script fn={profileClientScript} args={[props]} />
        </WidgetLayout>
    ),
    initialState: () => ({
        name: "Алексей Смирнов",
        username: "@alex_dev",
        notifications: true,
        privateMode: false,
        soundEffects: true,
    }),
    actions: {
        toggleProfileNotify: async (ctx: WidgetActionContext<ProfileState>) => {
            const next = {
                ...ctx.state,
                notifications: !ctx.state.notifications,
            };
            await ctx.setState(next);
            return next;
        },
        toggleProfilePrivate: async (
            ctx: WidgetActionContext<ProfileState>,
        ) => {
            const next = {
                ...ctx.state,
                privateMode: !ctx.state.privateMode,
            };
            await ctx.setState(next);
            return next;
        },
        toggleProfileSound: async (ctx: WidgetActionContext<ProfileState>) => {
            const next = {
                ...ctx.state,
                soundEffects: !ctx.state.soundEffects,
            };
            await ctx.setState(next);
            return next;
        },
        fallbackToText: async (ctx: WidgetActionContext<ProfileState>) => {
            if (ctx.chatId && ctx.messageId) {
                try {
                    await (ctx.rawApi as any).editMessageText?.({
                        chat_id: ctx.chatId,
                        message_id: ctx.messageId,
                        text:
                            `👤 *Профиль пользователя (текстовый режим)*\n\n` +
                            `*Имя:* ${ctx.state.name}\n` +
                            `*Юзернейм:* ${ctx.state.username}\n\n` +
                            `🔔 *Уведомления:* ${ctx.state.notifications ? "Включены" : "Выключены"}\n` +
                            `🔒 *Приватный режим:* ${ctx.state.privateMode ? "Включен" : "Выключен"}\n` +
                            `🔊 *Звуковые эффекты:* ${ctx.state.soundEffects ? "Включены" : "Выключены"}\n\n` +
                            `_Сообщение переведено в классический текстовый режим._`,
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "📱 Вернуть интерактивный виджет",
                                        callback_data: "show_profile",
                                    },
                                ],
                            ],
                        },
                    });
                } catch {
                    // ignore if already edited
                }
            }
            return ctx.answer({
                text: "Переключено в обычный текстовый режим",
            });
        },
    },
});

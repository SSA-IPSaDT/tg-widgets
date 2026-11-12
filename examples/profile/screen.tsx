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
} from '../../src';

export interface ProfileState {
    name: string;
    username: string;
    notifications: boolean;
    privateMode: boolean;
    soundEffects: boolean;
}

const profileClientScript = (initial: ProfileState) => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('profile-toast');

    const showToast = (msg: string) => {
        if (toast) {
            toast.textContent = msg;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    };

    const updateSwitch = (id: string, active: boolean) => {
        const sw = document.getElementById(id);
        const track = sw?.querySelector('.tg-switch-track') as HTMLElement | null;
        const thumb = sw?.querySelector('.tg-switch-thumb') as HTMLElement | null;
        if (track && thumb) {
            track.style.backgroundColor = active
                ? 'var(--tg-theme-button-color, #2481cc)'
                : 'rgba(120, 120, 128, 0.24)';
            thumb.style.left = active ? '20px' : '2px';
        }
    };

    document.getElementById('profile-notify')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        state.notifications = !state.notifications;
        updateSwitch('profile-notify', state.notifications);
        showToast(state.notifications ? '🔔 Уведомления включены' : '🔕 Уведомления выключены');
        W?.request?.('toggleProfileNotify');
    });

    document.getElementById('profile-private')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        state.privateMode = !state.privateMode;
        updateSwitch('profile-private', state.privateMode);
        showToast(state.privateMode ? '🔒 Приватный режим активирован' : '🌐 Профиль публичный');
        W?.request?.('toggleProfilePrivate');
    });

    document.getElementById('profile-sound')?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        state.soundEffects = !state.soundEffects;
        updateSwitch('profile-sound', state.soundEffects);
        showToast(state.soundEffects ? '🔊 Звуковые сигналы включены' : '🔇 Звуки отключены');
        W?.request?.('toggleProfileSound');
    });

    document.getElementById('btn-fallback')?.addEventListener('click', () => {
        W?.HapticFeedback?.notificationOccurred?.('warning');
        showToast('↩️ Переключаем на текстовый режим...');
        W?.request?.('fallbackToText');
    });
};

/**
 * Экран профиля пользователя с интерактивными настройками и плашкой fallback
 */
export const profileScreen = defineWidgetScreen({
    id: 'profile',
    component: (props: ProfileState) => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Аватар пользователя */}
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
                                <CardTitle style={{ fontSize: 15 }}>{props.name}</CardTitle>
                                <CardDescription style={{ fontSize: 12 }}>
                                    {props.username}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Shield,
                                size: 13,
                                color: 'var(--tg-theme-link-color, #2481cc)',
                            })}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

                    {/* Информационное уведомление о тестировании виджетов */}
                    <div style={{ marginTop: 14 }}>
                        <Alert
                            variant="warning"
                            title="Экспериментальная функция"
                            description="Виджеты Telegram находятся на стадии тестирования. При неполадках нажмите кнопку ниже."
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

                {/* Всплывающее уведомление */}
                <div
                    id="profile-toast"
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        background: 'var(--tg-theme-button-color, #2481cc)',
                        color: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 600,
                        textAlign: 'center',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                />
            </Card>
            <Script fn={profileClientScript} args={[props]} />
        </WidgetLayout>
    ),
    initialState: () => ({
        name: 'Алексей Смирнов',
        username: '@alex_dev',
        notifications: true,
        privateMode: false,
        soundEffects: true,
    }),
    actions: {
        toggleProfileNotify: (ctx: WidgetActionContext<ProfileState>) => {
            ctx.setState({ notifications: !ctx.state.notifications });
            return ctx.answer();
        },
        toggleProfilePrivate: (ctx: WidgetActionContext<ProfileState>) => {
            ctx.setState({ privateMode: !ctx.state.privateMode });
            return ctx.answer();
        },
        toggleProfileSound: (ctx: WidgetActionContext<ProfileState>) => {
            ctx.setState({ soundEffects: !ctx.state.soundEffects });
            return ctx.answer();
        },
        fallbackToText: (ctx: WidgetActionContext<ProfileState>) => {
            return ctx.answer({
                text: 'Переключение на текстовый режим...',
            });
        },
    },
});

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
    Script,
    type WidgetActionContext,
    WidgetLayout,
} from '../../src';

export interface TournamentState {
    registeredRole?: 'volunteer' | 'participant';
    participantsCount: number;
    volunteersCount: number;
}

const tournamentClientScript = (initial: TournamentState) => {
    const widget = (window as unknown as { TelegramWidget?: any; open?: any }).TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('tour-toast');

    const showToast = (message: string) => {
        if (toast) {
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
    };

    const updateCounts = () => {
        const statsElement = document.getElementById('tour-stats');
        if (statsElement) {
            statsElement.textContent = `Участников: ${state.participantsCount} • Волонтёров: ${state.volunteersCount}`;
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (parsedData && typeof parsedData === 'object') {
                    state = { ...state, ...parsedData };
                    updateCounts();
                }
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    document.getElementById('btn-volunteer')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (state.registeredRole !== 'volunteer') {
            if (state.registeredRole === 'participant') state.participantsCount--;
            state.registeredRole = 'volunteer';
            state.volunteersCount++;
            updateCounts();
        }
        showToast('🤝 Заявка волонтёра принята! Запуск Telegram Mini App...');

        // Открываем Telegram Mini App через нативный вызов
        try {
            if (widget?.openTelegramLink) {
                widget.openTelegramLink('https://t.me/bot/tournament?startapp=volunteer');
            } else if (widget?.openLink) {
                widget.openLink('https://t.me/bot/tournament?startapp=volunteer');
            } else {
                window.location.href = 'tg://resolve?domain=bot&app=tournament&startapp=volunteer';
            }
        } catch {
            // fallback
        }
        widget?.request?.('registerVolunteer');
    });

    document.getElementById('btn-participant')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (state.registeredRole !== 'participant') {
            if (state.registeredRole === 'volunteer') state.volunteersCount--;
            state.registeredRole = 'participant';
            state.participantsCount++;
            updateCounts();
        }
        showToast('♟️ Заявка участника принята! Запуск Telegram Mini App...');

        // Открываем Telegram Mini App через нативный вызов
        try {
            if (widget?.openTelegramLink) {
                widget.openTelegramLink('https://t.me/bot/tournament?startapp=participant');
            } else if (widget?.openLink) {
                widget.openLink('https://t.me/bot/tournament?startapp=participant');
            } else {
                window.location.href = 'tg://resolve?domain=bot&app=tournament&startapp=participant';
            }
        } catch {
            // fallback
        }
        widget?.request?.('registerParticipant');
    });
};

/**
 * Экран приглашения на шахматный турнир с выбором роли (Волонтёр / Участник)
 */
export const tournamentScreen = defineWidgetScreen({
    id: 'tournament',
    component: (props: TournamentState) => (
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
                        <CardTitle>Шахматный кубок 2026</CardTitle>
                        <Badge
                            variant="warning"
                            icon={LucideIcon({
                                icon: LucideIcons.Trophy,
                                size: 15,
                                color: '#f59e0b',
                            })}
                        />
                    </div>
                    <CardDescription
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--tg-theme-text-color, #111827)',
                            opacity: 0.90,
                            lineHeight: 1.45,
                        }}
                    >
                        Приглашаем принять участие в весеннем шахматном турнире (Rapid 10+5).
                        Мы рады как активным игрокам, так и судьям-волонтёрам!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Параметры турнира в карточках */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: 10,
                                background:
                                    'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.10))',
                            }}
                        >
                            <div style={{ fontSize: 11, opacity: 0.65 }}>Дата</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>25 мая</div>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: 10,
                                background:
                                    'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.10))',
                            }}
                        >
                            <div style={{ fontSize: 11, opacity: 0.65 }}>Регламент</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>7 туров</div>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: 10,
                                background:
                                    'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.10))',
                            }}
                        >
                            <div style={{ fontSize: 11, opacity: 0.65 }}>Призовой фонд</div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: 'var(--tg-theme-link-color, #2481cc)',
                                }}
                            >
                                50 000 ₽
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Статистика набора */}
                    <div
                        id="tour-stats"
                        style={{
                            fontSize: 12.5,
                            textAlign: 'center',
                            fontWeight: 500,
                            color: 'var(--tg-theme-text-color, inherit)',
                            opacity: 0.85,
                        }}
                    >
                        Участников: {props.participantsCount} • Волонтёров: {props.volunteersCount}
                    </div>

                    <Divider />

                    {/* Блок выбора роли */}
                    <div>
                        <div
                            style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: 'var(--tg-theme-text-color, inherit)',
                                marginBottom: 8,
                            }}
                        >
                            Я хочу быть:
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                id="btn-volunteer"
                                variant="outline"
                                fullWidth
                                size="md"
                                icon={LucideIcon({
                                    icon: LucideIcons.User,
                                    size: 15,
                                    style: { marginRight: 4 },
                                })}
                            >
                                Волонтёром
                            </Button>
                            <Button
                                id="btn-participant"
                                variant="primary"
                                fullWidth
                                size="md"
                                icon={LucideIcon({
                                    icon: LucideIcons.Trophy,
                                    size: 15,
                                    color: '#ffffff',
                                    style: { marginRight: 4 },
                                })}
                            >
                                Участником
                            </Button>
                        </div>
                    </div>
                </CardContent>

                {/* Всплывающее уведомление */}
                <div
                    id="tour-toast"
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        background: '#10b981',
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
            <Script fn={tournamentClientScript} args={[props]} />
        </WidgetLayout>
    ),
    initialState: () => ({
        participantsCount: 38,
        volunteersCount: 7,
    }),
    actions: {
        registerVolunteer: async (ctx: WidgetActionContext<TournamentState>) => {
            const nextVolunteers = ctx.state.volunteersCount + 1;
            await ctx.setState({
                registeredRole: 'volunteer',
                volunteersCount: nextVolunteers,
            });
            return ctx.answer({
                text: 'Спасибо за заявку волонтёра! Ссылка на подтверждение отправлена.',
            });
        },
        registerParticipant: async (ctx: WidgetActionContext<TournamentState>) => {
            const nextParticipants = ctx.state.participantsCount + 1;
            await ctx.setState({
                registeredRole: 'participant',
                participantsCount: nextParticipants,
            });
            return ctx.answer({
                text: 'Вы зарегистрированы как участник турнира!',
            });
        },
    },
});

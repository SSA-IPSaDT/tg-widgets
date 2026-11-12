import {
    Alert,
    Avatar,
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

const profileClientScript = () => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    const M: Record<string, [string, string]> = {
        notify: ["notifications", "Notify"],
        private: ["privateMode", "Private"],
        sound: ["soundEffects", "Sound"],
    };
    const U = (d?: Record<string, unknown> | null) => {
        if (!d) return;
        for (const k in M) {
            const v = d[M[k][0]];
            if (v !== undefined) {
                document
                    .getElementById("profile-" + k)
                    ?.querySelector(".tg-switch-track")
                    ?.classList.toggle("active", Boolean(v));
            }
        }
    };
    const C = () => {
        try {
            if (W?.chatData) U(JSON.parse(W.chatData));
        } catch {}
    };
    C();
    W?.onEvent?.("chatDataChanged", C);

    for (const k in M) {
        document
            .getElementById("profile-" + k)
            ?.addEventListener("click", function (this: HTMLElement) {
                W?.HapticFeedback?.impactOccurred?.("light");
                this.querySelector(".tg-switch-track")?.classList.toggle(
                    "active",
                );
                W?.request?.("toggleProfile" + M[k][1]).then(
                    (r: { result?: string }) => {
                        try {
                            if (r?.result) U(JSON.parse(r.result));
                        } catch {}
                    },
                );
            });
    }

    document.getElementById("btn-fallback")?.addEventListener("click", () => {
        W?.HapticFeedback?.notificationOccurred?.("warning");
        W?.request?.("fallbackToText");
    });
};

/**
 * Экран профиля пользователя с интерактивными настройками и плашкой fallback
 */
export const profileScreen = defineWidgetScreen({
    id: "profile",
    component: (props: ProfileState) => (
        <WidgetLayout fullWidth padding="4px 6px">
            <Card fullWidth>
                <CardHeader>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 17,
                                    background:
                                        "var(--tg-theme-button-color, #2481cc)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
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
                                color: "var(--tg-theme-link-color, #2481cc)",
                            })}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        <Switch
                            id="profile-notify"
                            checked={props.notifications}
                            action="toggleProfileNotify"
                            label="Уведомления бота"
                            description="Оповещения о событиях"
                        />

                        <Divider />

                        <Switch
                            id="profile-private"
                            checked={props.privateMode}
                            action="toggleProfilePrivate"
                            label="Приватный профиль"
                            description="Скрыть из общего рейтинга"
                        />

                        <Divider />

                        <Switch
                            id="profile-sound"
                            checked={props.soundEffects}
                            action="toggleProfileSound"
                            label="Звуковые сигналы"
                            description="Звуки интерфейса"
                        />
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <Alert
                            variant="warning"
                            title="Бета-функция"
                            description="При неполадках переключите режим."
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
                        Текстовый режим
                    </Button>
                </CardFooter>
            </Card>
            <Script fn={profileClientScript} />
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
            const nextVal = !ctx.state.notifications;
            await ctx.setState({ notifications: nextVal });
            return ctx.answer();
        },
        toggleProfilePrivate: async (
            ctx: WidgetActionContext<ProfileState>,
        ) => {
            const nextVal = !ctx.state.privateMode;
            await ctx.setState({ privateMode: nextVal });
            return ctx.answer();
        },
        toggleProfileSound: async (ctx: WidgetActionContext<ProfileState>) => {
            const nextVal = !ctx.state.soundEffects;
            await ctx.setState({ soundEffects: nextVal });
            return ctx.answer();
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

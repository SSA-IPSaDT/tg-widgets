import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

export interface PollState {
    votes: {
        grammy: number;
        telegraf: number;
        aiogram: number;
    };
    userVote?: 'grammy' | 'telegraf' | 'aiogram';
}

const pollClientScript = (initial: PollState) => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    let state = { ...initial };

    const updatePollUI = (s: typeof state) => {
        state = { ...s };
        const total = Math.max(1, state.votes.grammy + state.votes.telegraf + state.votes.aiogram);

        const keys = ['grammy', 'telegraf', 'aiogram'] as const;
        for (const k of keys) {
            const count = state.votes[k];
            const pct = Math.round((count / total) * 100);

            const row = document.getElementById(`poll-row-${k}`);
            if (row) {
                const bar = row.querySelector('.poll-bar') as HTMLElement | null;
                const pctEl = row.querySelector('.poll-pct');
                const countEl = row.querySelector('.poll-count');
                if (bar) bar.style.width = `${pct}%`;
                if (pctEl) pctEl.textContent = `${pct}%`;
                if (countEl) countEl.textContent = `${count} гол.`;

                if (state.userVote === k) {
                    row.style.borderColor = 'var(--tg-theme-button-color, #2481cc)';
                    row.style.background = 'rgba(36, 129, 204, 0.12)';
                } else {
                    row.style.borderColor = 'rgba(120, 120, 128, 0.16)';
                    row.style.background = 'rgba(120, 120, 128, 0.06)';
                }
            }
        }

        const totalEl = document.getElementById('poll-total-votes');
        if (totalEl) {
            totalEl.textContent = `Всего голосов: ${state.votes.grammy + state.votes.telegraf + state.votes.aiogram}`;
        }
    };

    const registerVote = (choice: 'grammy' | 'telegraf' | 'aiogram') => {
        if (state.userVote === choice) return;
        W?.HapticFeedback?.impactOccurred?.('medium');
        if (state.userVote) {
            state.votes[state.userVote] = Math.max(0, state.votes[state.userVote] - 1);
        }
        state.votes[choice]++;
        state.userVote = choice;
        updatePollUI(state);
        W?.request?.(`vote:${choice}`);
    };

    document.getElementById('poll-row-grammy')?.addEventListener('click', () => registerVote('grammy'));
    document.getElementById('poll-row-telegraf')?.addEventListener('click', () => registerVote('telegraf'));
    document.getElementById('poll-row-aiogram')?.addEventListener('click', () => registerVote('aiogram'));
};

/**
 * Экран интерактивного опроса / квиза с динамическими полосами результатов
 */
export const pollScreen = defineWidgetScreen({
    id: 'poll',
    component: (props: PollState) => {
        const total = Math.max(1, props.votes.grammy + props.votes.telegraf + props.votes.aiogram);
        const options = [
            { key: 'grammy' as const, label: 'grammY (TypeScript)', count: props.votes.grammy },
            { key: 'telegraf' as const, label: 'Telegraf (JavaScript)', count: props.votes.telegraf },
            { key: 'aiogram' as const, label: 'aiogram (Python)', count: props.votes.aiogram },
        ];

        return (
            <WidgetLayout fullWidth padding="6px 8px">
                <Card fullWidth>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Опрос сообщества</CardTitle>
                            <Badge
                                variant="accent"
                                pulse
                                icon={LucideIcon({
                                    icon: LucideIcons.Flame,
                                    size: 15,
                                    color: 'var(--tg-theme-link-color, #2481cc)',
                                })}
                            />
                        </div>
                        <CardDescription>
                            Какой стек вы используете для разработки Telegram-ботов?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {options.map((opt) => {
                                const pct = Math.round((opt.count / total) * 100);
                                const isSelected = props.userVote === opt.key;
                                return (
                                    <div
                                        id={`poll-row-${opt.key}`}
                                        style={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderRadius: 10,
                                            border: `1px solid ${isSelected ? 'var(--tg-theme-button-color, #2481cc)' : 'rgba(120, 120, 128, 0.16)'}`,
                                            background: isSelected ? 'rgba(36, 129, 204, 0.12)' : 'rgba(120, 120, 128, 0.06)',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            transition: 'border-color 0.2s, background 0.2s',
                                        }}
                                    >
                                        {/* Полоска прогресса */}
                                        <div
                                            class="poll-bar"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                width: `${pct}%`,
                                                background: 'rgba(36, 129, 204, 0.2)',
                                                borderRadius: 9,
                                                transition: 'width 0.3s ease',
                                                zIndex: 0,
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'relative',
                                                zIndex: 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                                                {opt.label}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span class="poll-count" style={{ fontSize: 11, color: 'var(--tg-theme-text-color, #111827)', opacity: 0.65 }}>
                                                    {opt.count} гол.
                                                </span>
                                                <span class="poll-pct" style={{ fontSize: 13, fontWeight: 700, minWidth: 34, textAlign: 'right' }}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <span id="poll-total-votes" style={{ fontSize: 11, color: 'var(--tg-theme-text-color, #111827)', opacity: 0.65 }}>
                            Всего голосов: {props.votes.grammy + props.votes.telegraf + props.votes.aiogram}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--tg-theme-text-color, #111827)', opacity: 0.65 }}>
                            Нажмите на вариант для выбора
                        </span>
                    </CardFooter>
                </Card>
                <Script fn={pollClientScript} args={[props]} />
            </WidgetLayout>
        );
    },
    initialState: (props?: Partial<PollState>): PollState => ({
        votes: props?.votes ?? {
            grammy: 48,
            telegraf: 21,
            aiogram: 35,
        },
        userVote: props?.userVote ?? 'grammy',
    }),
    actions: {
        vote: async (ctx: WidgetActionContext<PollState>, payload?: unknown) => {
            const choice = String(payload) as 'grammy' | 'telegraf' | 'aiogram';
            const state = { ...ctx.state };
            if (state.userVote && state.userVote !== choice) {
                state.votes[state.userVote] = Math.max(0, state.votes[state.userVote] - 1);
            }
            if (state.userVote !== choice) {
                state.votes[choice] = (state.votes[choice] ?? 0) + 1;
                state.userVote = choice;
            }
            await ctx.setState(state);
            return state;
        },
    },
});

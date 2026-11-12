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

/**
 * State contract for the interactive community poll widget.
 */
export interface PollState {
    votes: {
        grammy: number;
        telegraf: number;
        aiogram: number;
    };
    userVote?: 'grammy' | 'telegraf' | 'aiogram';
}

/**
 * Client-side script providing instant optimistic UI updates and progress bar calculation.
 */
const pollClientScript = (initial: PollState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };

    const updatePollUI = (nextState: typeof state) => {
        state = { ...nextState };
        const total = Math.max(1, state.votes.grammy + state.votes.telegraf + state.votes.aiogram);

        const pollOptions = ['grammy', 'telegraf', 'aiogram'] as const;
        for (const optionKey of pollOptions) {
            const count = state.votes[optionKey];
            const percentage = Math.round((count / total) * 100);

            const row = document.getElementById(`poll-row-${optionKey}`);
            if (row) {
                const bar = row.querySelector('.poll-bar') as HTMLElement | null;
                const percentageElement = row.querySelector('.poll-pct');
                const countElement = row.querySelector('.poll-count');
                if (bar) bar.style.width = `${percentage}%`;
                if (percentageElement) percentageElement.textContent = `${percentage}%`;
                if (countElement) countElement.textContent = `${count} votes`;

                if (state.userVote === optionKey) {
                    row.style.borderColor = 'var(--tg-theme-button-color, #2481cc)';
                    row.style.background = 'rgba(36, 129, 204, 0.12)';
                } else {
                    row.style.borderColor = 'rgba(120, 120, 128, 0.16)';
                    row.style.background = 'rgba(120, 120, 128, 0.06)';
                }
            }
        }

        const totalVotesElement = document.getElementById('poll-total-votes');
        if (totalVotesElement) {
            totalVotesElement.textContent = `Total votes: ${state.votes.grammy + state.votes.telegraf + state.votes.aiogram}`;
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (parsedData && typeof parsedData === 'object') updatePollUI(parsedData);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const registerVote = (choice: 'grammy' | 'telegraf' | 'aiogram') => {
        if (state.userVote === choice) return;
        widget?.HapticFeedback?.impactOccurred?.('medium');
        if (state.userVote) {
            state.votes[state.userVote] = Math.max(0, state.votes[state.userVote] - 1);
        }
        state.votes[choice]++;
        state.userVote = choice;
        updatePollUI(state);
        widget?.request?.(`vote:${choice}`).then((response) => {
            if (response?.result) {
                try {
                    const parsedData = JSON.parse(response.result);
                    if (parsedData && typeof parsedData === 'object') updatePollUI(parsedData);
                } catch {
                    // ignore JSON parse errors
                }
            }
        });
    };

    document.getElementById('poll-row-grammy')?.addEventListener('click', () => registerVote('grammy'));
    document.getElementById('poll-row-telegraf')?.addEventListener('click', () => registerVote('telegraf'));
    document.getElementById('poll-row-aiogram')?.addEventListener('click', () => registerVote('aiogram'));
};

/**
 * Community poll widget screen featuring interactive voting options, live progress bars,
 * haptic feedback, and server synchronization via `window.TelegramWidget.request()`.
 *
 * @example
 * ```tsx
 * import { pollScreen } from './poll/screen';
 *
 * await bot.api.sendMessage(chatId, 'Poll', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Vote Now',
 *       callback_data: 'open_poll'
 *     }]]
 *   }
 * });
 * ```
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
                            <CardTitle>Framework Poll</CardTitle>
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
                            Which framework do you use for Telegram bot development?
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
                                            borderRadius: 'var(--tg-radius-md, 10px)',
                                            border: `1px solid ${isSelected ? 'var(--tg-theme-button-color, #2481cc)' : 'rgba(120, 120, 128, 0.16)'}`,
                                            background: isSelected ? 'rgba(36, 129, 204, 0.12)' : 'rgba(120, 120, 128, 0.06)',
                                            padding: '12px 14px',
                                            minHeight: 46,
                                            boxSizing: 'border-box',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            touchAction: 'manipulation',
                                            transition: 'border-color 0.12s, background 0.12s',
                                        }}
                                    >
                                        {/* Progress bar background fill */}
                                        <div
                                            class="poll-bar"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                width: `${pct}%`,
                                                background: 'rgba(36, 129, 204, 0.2)',
                                                borderRadius: 'var(--tg-radius-md, 9px)',
                                                transition: 'width 0.15s cubic-bezier(0.2, 0, 0, 1)',
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
                                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                                                {opt.label}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span class="poll-count tg-description" style={{ fontSize: 12, fontWeight: 500, color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))', opacity: 0.85 }}>
                                                    {opt.count} votes
                                                </span>
                                                <span class="poll-pct" style={{ fontSize: 13.5, fontWeight: 700, minWidth: 34, textAlign: 'right' }}>
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
                        <span id="poll-total-votes" class="tg-description" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))', opacity: 0.85 }}>
                            Total votes: {props.votes.grammy + props.votes.telegraf + props.votes.aiogram}
                        </span>
                        <span class="tg-description" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))', opacity: 0.85 }}>
                            Tap an option to cast your vote
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

import type { PollState } from './screen';

/**
 * Client-side script providing instant optimistic UI updates and multi-device state synchronization for poll.
 */
export const pollClientScript = (initial: PollState) => {
    const widget = window.TelegramWidget;
    let state: PollState = {
        votes: { ...initial.votes },
        userVote: initial.userVote,
    };

    const decodePollState = (raw: unknown): Partial<PollState> => {
        if (!raw || typeof raw !== 'object') return {};
        const record = raw as Record<string, unknown>;
        const res: Partial<PollState> = {};

        const rawVotes = (record.votes ?? record.V) as Record<string, unknown> | undefined;
        if (rawVotes && typeof rawVotes === 'object') {
            res.votes = {
                grammy: Number(rawVotes.grammy ?? 0),
                telegraf: Number(rawVotes.telegraf ?? 0),
                aiogram: Number(rawVotes.aiogram ?? 0),
            };
        }

        const rawUserVote = (record.userVote ?? record.U) as PollState['userVote'];
        if (rawUserVote) {
            res.userVote = rawUserVote;
        }

        return res;
    };

    const updatePollUI = (partialState: Partial<PollState>) => {
        if (!partialState) return;
        state = {
            ...state,
            ...partialState,
            votes: {
                ...state.votes,
                ...(partialState.votes ?? {}),
            },
        };

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

                const isSelected = state.userVote === optionKey;
                row.classList.toggle('selected', isSelected);
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
                updatePollUI(decodePollState(parsedData));
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
        updatePollUI({ votes: state.votes, userVote: choice });

        Promise.resolve(widget?.request?.(`vote:${choice}`))
            .then((response?: { result?: string | null }) => {
                if (response?.result) {
                    try {
                        const parsedData = JSON.parse(response.result);
                        updatePollUI(decodePollState(parsedData));
                    } catch {
                        // ignore JSON parse errors
                    }
                }
            })
            .catch(() => {});
    };

    document
        .getElementById('poll-row-grammy')
        ?.addEventListener('click', () => registerVote('grammy'));
    document
        .getElementById('poll-row-telegraf')
        ?.addEventListener('click', () => registerVote('telegraf'));
    document
        .getElementById('poll-row-aiogram')
        ?.addEventListener('click', () => registerVote('aiogram'));
};

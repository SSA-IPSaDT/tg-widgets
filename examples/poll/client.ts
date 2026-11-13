import type { PollState } from './screen';

/**
 * Client-side script providing instant optimistic UI updates and progress bar calculation.
 */
export const pollClientScript = (initial: PollState) => {
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

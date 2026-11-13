import type { TournamentState } from './screen';

/**
 * Client-side script handling role selection, count updates, and Mini App navigation.
 */
export const tournamentClientScript = (initial: TournamentState) => {
    const widget = window.TelegramWidget;
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
            statsElement.textContent = `Participants: ${state.participantsCount} • Volunteers: ${state.volunteersCount}`;
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

    let isPending = false;

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    document.getElementById('btn-volunteer')?.addEventListener('click', () => {
        if (isPending) return;
        isPending = true;
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (state.registeredRole !== 'volunteer') {
            if (state.registeredRole === 'participant') state.participantsCount--;
            state.registeredRole = 'volunteer';
            state.volunteersCount++;
            updateCounts();
        }
        showToast('🤝 Volunteer application received!');

        try {
            if (widget?.openTelegramLink) {
                widget.openTelegramLink('https://t.me/BotFather');
            } else if (widget?.openLink) {
                widget.openLink('https://google.com');
            }
        } catch {
            // fallback
        }
        Promise.resolve(widget?.request?.('registerVolunteer'))
            .catch(() => {})
            .finally(() => {
                isPending = false;
            });
    });

    document.getElementById('btn-participant')?.addEventListener('click', () => {
        if (isPending) return;
        isPending = true;
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (state.registeredRole !== 'participant') {
            if (state.registeredRole === 'volunteer') state.volunteersCount--;
            state.registeredRole = 'participant';
            state.participantsCount++;
            updateCounts();
        }
        showToast('♟️ You are registered as a tournament player!');

        try {
            if (widget?.openTelegramLink) {
                widget.openTelegramLink('https://t.me/BotFather');
            } else if (widget?.openLink) {
                widget.openLink('https://google.com');
            }
        } catch {
            // fallback
        }
        Promise.resolve(widget?.request?.('registerParticipant'))
            .catch(() => {})
            .finally(() => {
                isPending = false;
            });
    });
};

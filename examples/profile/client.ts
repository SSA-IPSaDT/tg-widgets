import type { ProfileState } from './screen';

/**
 * Client-side script handling toggle synchronization and fallback triggers.
 */
export const profileClientScript = (initial: ProfileState) => {
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

import type { ProfileState } from './screen';

/**
 * Normalizes state from raw JSON payload, supporting both full and codec keys.
 */
const decodeProfileState = (raw: unknown): Partial<ProfileState> => {
    if (!raw || typeof raw !== 'object') return {};
    const record = raw as Record<string, unknown>;
    const res: Partial<ProfileState> = {};

    const notif = record.notifications ?? record.o;
    if (typeof notif === 'boolean') res.notifications = notif;

    const priv = record.privateMode ?? record.m;
    if (typeof priv === 'boolean') res.privateMode = priv;

    const sound = record.soundEffects ?? record.e;
    if (typeof sound === 'boolean') res.soundEffects = sound;

    const name = record.name ?? record.n;
    if (typeof name === 'string') res.name = name;

    const username = record.username ?? record.u;
    if (typeof username === 'string') res.username = username;

    return res;
};

/**
 * Client-side script handling toggle synchronization, optimistic feedback, and text fallback.
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
                updateProfileUI(decodeProfileState(parsed));
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
        actionBase: string,
    ) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.addEventListener('click', () => {
            widget?.HapticFeedback?.impactOccurred?.('light');
            const targetVal = !state[key];
            updateProfileUI({ [key]: targetVal });

            Promise.resolve(widget?.request?.(`${actionBase}:${targetVal}`))
                .then((response?: { result?: string | null }) => {
                    if (response?.result) {
                        try {
                            const parsed = JSON.parse(response.result);
                            updateProfileUI(decodeProfileState(parsed));
                        } catch {
                            // ignore JSON parse errors
                        }
                    }
                })
                .catch(() => {});
        });
    };

    bindToggle('profile-notify', 'notifications', 'toggleProfileNotify');
    bindToggle('profile-private', 'privateMode', 'toggleProfilePrivate');
    bindToggle('profile-sound', 'soundEffects', 'toggleProfileSound');

    document.getElementById('btn-fallback')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('warning');
        Promise.resolve(widget?.request?.('fallbackToText')).catch(() => {});
    });
};

import type { ControlsState } from './screen';

/**
 * Normalizes state from raw JSON payload, supporting both full and codec keys.
 */
const decodeControlsState = (raw: unknown): Partial<ControlsState> => {
    if (!raw || typeof raw !== 'object') return {};
    const record = raw as Record<string, unknown>;
    const res: Partial<ControlsState> = {};

    const notif = record.notifications ?? record.o;
    if (typeof notif === 'boolean') res.notifications = notif;

    const news = record.newsletter ?? record.w;
    if (typeof news === 'boolean') res.newsletter = news;

    const tickets = record.tickets ?? record.k;
    if (typeof tickets === 'number') res.tickets = tickets;

    const plan = record.plan ?? record.l;
    if (typeof plan === 'string') res.plan = plan;

    return res;
};

/**
 * Client-side script providing instant optimistic UI feedback and in-flight locking for controls.
 */
export const controlsClientScript = (initial: ControlsState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    let isPending = false;

    const setBusy = (busy: boolean) => {
        isPending = busy;
        const container = document.querySelector('.tg-layout') as HTMLElement | null;
        if (container) {
            container.style.pointerEvents = busy ? 'none' : '';
            container.style.opacity = busy ? '0.75' : '';
        }
    };

    const updateUI = (partialState: Partial<ControlsState>) => {
        state = { ...state, ...partialState };

        if (typeof state.notifications === 'boolean') {
            document
                .getElementById('toggle-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', state.notifications);
        }

        if (typeof state.newsletter === 'boolean') {
            const checkboxSvg = document.getElementById('chk-newsletter')?.querySelector('svg');
            if (checkboxSvg) {
                checkboxSvg.outerHTML = state.newsletter
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color,#2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';
            }
        }

        if (typeof state.tickets === 'number') {
            const stepperVal = document
                .getElementById('stepper-tickets')
                ?.querySelector('.tg-stepper-val');
            if (stepperVal) stepperVal.textContent = String(state.tickets);
        }

        if (state.plan) {
            const renderRadioSvg = (isSelected: boolean) =>
                isSelected
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color,#2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color,#2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';

            const basicSvg = document.getElementById('plan-basic')?.querySelector('svg');
            if (basicSvg) basicSvg.outerHTML = renderRadioSvg(state.plan === 'basic');
            const proSvg = document.getElementById('plan-pro')?.querySelector('svg');
            if (proSvg) proSvg.outerHTML = renderRadioSvg(state.plan === 'pro');
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                updateUI(decodeControlsState(parsedData));
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string) => {
        if (isPending) return;
        setBusy(true);
        Promise.resolve(widget?.request?.(action))
            .then((response?: { result?: string | null }) => {
                if (response?.result) {
                    try {
                        const parsedData = JSON.parse(response.result);
                        updateUI(decodeControlsState(parsedData));
                    } catch {
                        // ignore JSON parse errors
                    }
                }
            })
            .finally(() => {
                setBusy(false);
            });
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        if (isPending) return;
        widget?.HapticFeedback?.impactOccurred?.('medium');
        const targetVal = !state.notifications;
        updateUI({ notifications: targetVal });
        sendAction(`toggleNotifications:${targetVal}`);
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        if (isPending) return;
        widget?.HapticFeedback?.impactOccurred?.('light');
        const targetVal = !state.newsletter;
        updateUI({ newsletter: targetVal });
        sendAction(`toggleNewsletter:${targetVal}`);
    });

    const stepperButtons = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (stepperButtons && stepperButtons[0] && stepperButtons[1]) {
        stepperButtons[0].addEventListener('click', () => {
            if (isPending || state.tickets <= 1) return;
            widget?.HapticFeedback?.impactOccurred?.('light');
            updateUI({ tickets: state.tickets - 1 });
            sendAction('ticketMinus');
        });
        stepperButtons[1].addEventListener('click', () => {
            if (isPending || state.tickets >= 10) return;
            widget?.HapticFeedback?.impactOccurred?.('light');
            updateUI({ tickets: state.tickets + 1 });
            sendAction('ticketPlus');
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        if (isPending || state.plan === 'basic') return;
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'basic' });
        sendAction('setPlan:basic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        if (isPending || state.plan === 'pro') return;
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'pro' });
        sendAction('setPlan:pro');
    });
};

import type { ControlsState } from './screen';

/**
 * Client-side script providing instant optimistic UI feedback and multi-device state synchronization.
 */
export const controlsClientScript = (initial: ControlsState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };

    const decodeControlsState = (raw: unknown): Partial<ControlsState> => {
        const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        const res: Partial<ControlsState> = {};
        const o = r.notifications ?? r.o;
        if (typeof o === 'boolean') res.notifications = o;
        const w = r.newsletter ?? r.w;
        if (typeof w === 'boolean') res.newsletter = w;
        const k = r.tickets ?? r.k;
        if (typeof k === 'number') res.tickets = k;
        const l = r.plan ?? r.l;
        if (typeof l === 'string') res.plan = l;
        return res;
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
                checkboxSvg.outerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">${
                    state.newsletter
                        ? '<rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color,#2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                        : '<rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/>'
                }</svg>`;
            }
        }

        if (typeof state.tickets === 'number') {
            const stepperEl = document.getElementById('stepper-tickets');
            const stepperVal = stepperEl?.querySelector('.tg-stepper-val');
            if (stepperVal) stepperVal.textContent = String(state.tickets);
            const buttons = stepperEl?.querySelectorAll('button');
            if (buttons && buttons[0] && buttons[1]) {
                (buttons[0] as HTMLButtonElement).disabled = state.tickets <= 1;
                (buttons[1] as HTMLButtonElement).disabled = state.tickets >= 10;
            }
        }

        if (state.plan) {
            const renderRadioSvg = (isSelected: boolean) =>
                `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="${isSelected ? 'var(--tg-theme-button-color,#2481cc)' : 'var(--tg-theme-hint-color,rgba(120,120,128,0.4))'}" stroke-width="${isSelected ? 2 : 1.5}"/>${isSelected ? '<circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color,#2481cc)"/>' : ''}</svg>`;

            const basicSvg = document.getElementById('plan-basic')?.querySelector('svg');
            if (basicSvg) basicSvg.outerHTML = renderRadioSvg(state.plan === 'basic');
            const proSvg = document.getElementById('plan-pro')?.querySelector('svg');
            if (proSvg) proSvg.outerHTML = renderRadioSvg(state.plan === 'pro');
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) updateUI(decodeControlsState(JSON.parse(widget.chatData)));
        } catch {}
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string) => {
        Promise.resolve(widget?.request?.(action))
            .then((res?: { result?: string | null }) => {
                if (res?.result) {
                    try {
                        updateUI(decodeControlsState(JSON.parse(res.result)));
                    } catch {}
                }
            })
            .catch(() => {});
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('medium');
        const targetVal = !state.notifications;
        updateUI({ notifications: targetVal });
        sendAction(`toggleNotifications:${targetVal}`);
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        const targetVal = !state.newsletter;
        updateUI({ newsletter: targetVal });
        sendAction(`toggleNewsletter:${targetVal}`);
    });

    const stepperButtons = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (stepperButtons && stepperButtons[0] && stepperButtons[1]) {
        stepperButtons[0].addEventListener('click', () => {
            if (state.tickets <= 1) return;
            widget?.HapticFeedback?.impactOccurred?.('light');
            updateUI({ tickets: state.tickets - 1 });
            sendAction('ticketMinus');
        });
        stepperButtons[1].addEventListener('click', () => {
            if (state.tickets >= 10) return;
            widget?.HapticFeedback?.impactOccurred?.('light');
            updateUI({ tickets: state.tickets + 1 });
            sendAction('ticketPlus');
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        if (state.plan === 'basic') return;
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'basic' });
        sendAction('setPlan:basic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        if (state.plan === 'pro') return;
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'pro' });
        sendAction('setPlan:pro');
    });
};

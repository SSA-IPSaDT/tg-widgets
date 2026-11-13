import type { ControlsState } from './screen';

/**
 * Client-side script providing instant optimistic UI feedback for controls.
 */
export const controlsClientScript = (initial: ControlsState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };

    const updateUI = (partialState: Partial<ControlsState>) => {
        state = { ...state, ...partialState };

        if ('notifications' in partialState) {
            document
                .getElementById('toggle-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', Boolean(state.notifications));
        }

        if ('newsletter' in partialState) {
            const checkboxSvg = document.getElementById('chk-newsletter')?.querySelector('svg');
            if (checkboxSvg) {
                checkboxSvg.outerHTML = state.newsletter
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color,#2481cc)"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';
            }
        }

        if ('tickets' in partialState) {
            const stepperValueElement = document
                .getElementById('stepper-tickets')
                ?.querySelector('.tg-stepper-val');
            if (stepperValueElement) {
                stepperValueElement.textContent = String(state.tickets);
            }
        }

        if ('plan' in partialState) {
            const renderRadioSvg = (isSelected: boolean) =>
                isSelected
                    ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-button-color,#2481cc)" stroke-width="2"/><circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color,#2481cc)"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="var(--tg-theme-hint-color,rgba(120,120,128,0.4))" stroke-width="1.5"/></svg>';

            const basicRadioSvg = document.getElementById('plan-basic')?.querySelector('svg');
            if (basicRadioSvg) basicRadioSvg.outerHTML = renderRadioSvg(state.plan === 'basic');
            const proRadioSvg = document.getElementById('plan-pro')?.querySelector('svg');
            if (proRadioSvg) proRadioSvg.outerHTML = renderRadioSvg(state.plan === 'pro');
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (parsedData && typeof parsedData === 'object') updateUI(parsedData);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string) => {
        widget?.request?.(action).then((response) => {
            if (response?.result) {
                try {
                    const parsedData = JSON.parse(response.result);
                    if (parsedData && typeof parsedData === 'object') updateUI(parsedData);
                } catch {
                    // ignore JSON parse errors
                }
            }
        });
    };

    document.getElementById('toggle-notify')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('medium');
        updateUI({ notifications: !state.notifications });
        sendAction('toggleNotifications');
    });

    document.getElementById('chk-newsletter')?.addEventListener('click', () => {
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateUI({ newsletter: !state.newsletter });
        sendAction('toggleNewsletter');
    });

    const stepperButtons = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (stepperButtons && stepperButtons[0] && stepperButtons[1]) {
        stepperButtons[0].addEventListener('click', () => {
            if (state.tickets > 1) {
                widget?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets - 1 });
                sendAction('ticketMinus');
            }
        });
        stepperButtons[1].addEventListener('click', () => {
            if (state.tickets < 10) {
                widget?.HapticFeedback?.impactOccurred?.('light');
                updateUI({ tickets: state.tickets + 1 });
                sendAction('ticketPlus');
            }
        });
    }

    document.getElementById('plan-basic')?.addEventListener('click', () => {
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'basic' });
        sendAction('selectBasic');
    });

    document.getElementById('plan-pro')?.addEventListener('click', () => {
        widget?.HapticFeedback?.selectionChanged?.();
        updateUI({ plan: 'pro' });
        sendAction('selectPro');
    });
};

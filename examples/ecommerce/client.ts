import type { EcommerceState } from './screen';

/**
 * Normalizes e-commerce state from raw JSON payload, supporting both full and codec keys.
 */
const decodeEcommerceState = (raw: unknown): Partial<EcommerceState> => {
    if (!raw || typeof raw !== 'object') return {};
    const record = raw as Record<string, unknown>;
    const res: Partial<EcommerceState> = {};

    const sz = record.size ?? record.Z;
    if (typeof sz === 'number') res.size = sz;

    const qty = record.quantity ?? record.q;
    if (typeof qty === 'number') res.quantity = qty;

    const price = record.pricePerUnit ?? record.price ?? record.P;
    if (typeof price === 'number') res.pricePerUnit = price;

    return res;
};

/**
 * Client-side script handling size selection, quantity calculation, and checkout feedback.
 */
export const ecommerceClientScript = (initial: EcommerceState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    let isPending = false;
    const toast = document.getElementById('ecom-toast');

    const setBusy = (busy: boolean) => {
        isPending = busy;
        const container = document.querySelector('.tg-layout') as HTMLElement | null;
        if (container) {
            container.style.pointerEvents = busy ? 'none' : '';
            container.style.opacity = busy ? '0.75' : '';
        }
    };

    const updateEcomUI = (partial?: Partial<EcommerceState>) => {
        if (partial) state = { ...state, ...partial };

        const availableSizes = [41, 42, 43, 44];
        for (const sizeNumber of availableSizes) {
            const sizeButton = document.getElementById(`size-${sizeNumber}`);
            if (sizeButton) {
                if (state.size === sizeNumber) {
                    sizeButton.style.background = 'var(--tg-theme-button-color, #2481cc)';
                    sizeButton.style.color = '#ffffff';
                    sizeButton.style.borderColor = 'var(--tg-theme-button-color, #2481cc)';
                } else {
                    sizeButton.style.background = 'transparent';
                    sizeButton.style.color = 'var(--tg-theme-text-color, inherit)';
                    sizeButton.style.borderColor = 'rgba(120, 120, 128, 0.24)';
                }
            }
        }

        const quantityElement = document.getElementById('ecom-qty');
        const totalPriceElement = document.getElementById('ecom-total');
        if (quantityElement) quantityElement.textContent = String(state.quantity);
        if (totalPriceElement) {
            totalPriceElement.textContent = `$${(state.quantity * state.pricePerUnit).toFixed(2)}`;
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                updateEcomUI(decodeEcommerceState(parsedData));
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
                        updateEcomUI(decodeEcommerceState(parsedData));
                    } catch {
                        // ignore JSON parse errors
                    }
                }
            })
            .finally(() => {
                setBusy(false);
            });
    };

    [41, 42, 43, 44].forEach((sizeNumber) => {
        document.getElementById(`size-${sizeNumber}`)?.addEventListener('click', () => {
            if (isPending || state.size === sizeNumber) return;
            widget?.HapticFeedback?.selectionChanged?.();
            updateEcomUI({ size: sizeNumber });
            sendAction(`setSize:${sizeNumber}`);
        });
    });

    document.getElementById('ecom-minus')?.addEventListener('click', () => {
        if (isPending || state.quantity <= 1) return;
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateEcomUI({ quantity: state.quantity - 1 });
        sendAction('qtyMinus');
    });

    document.getElementById('ecom-plus')?.addEventListener('click', () => {
        if (isPending || state.quantity >= 5) return;
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateEcomUI({ quantity: state.quantity + 1 });
        sendAction('qtyPlus');
    });

    document.getElementById('btn-checkout')?.addEventListener('click', () => {
        if (isPending) return;
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (toast) {
            toast.textContent = `🎉 Order placed! Size: ${state.size}, ${state.quantity} pair(s) for $${(state.quantity * state.pricePerUnit).toFixed(2)}`;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
        sendAction('checkout');
    });
};

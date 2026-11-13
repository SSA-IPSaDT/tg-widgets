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
 * Leverages centralized class-based styling (.active) instead of imperative inline style mutations.
 */
export const ecommerceClientScript = (initial: EcommerceState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('ecom-toast');

    const updateEcomUI = (partial?: Partial<EcommerceState>) => {
        if (partial) state = { ...state, ...partial };

        const availableSizes = [41, 42, 43, 44];
        for (const sizeNumber of availableSizes) {
            document
                .getElementById(`size-${sizeNumber}`)
                ?.classList.toggle('active', state.size === sizeNumber);
        }

        const quantityElement = document.getElementById('ecom-qty');
        const totalPriceElement = document.getElementById('ecom-total');
        if (quantityElement) quantityElement.textContent = String(state.quantity);
        if (totalPriceElement) {
            totalPriceElement.textContent = `$${(state.quantity * state.pricePerUnit).toFixed(2)}`;
        }

        const minusBtn = document.getElementById('ecom-minus') as HTMLButtonElement | null;
        const plusBtn = document.getElementById('ecom-plus') as HTMLButtonElement | null;
        if (minusBtn) minusBtn.disabled = state.quantity <= 1;
        if (plusBtn) plusBtn.disabled = state.quantity >= 5;
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
            .catch(() => {});
    };

    [41, 42, 43, 44].forEach((sizeNumber) => {
        document.getElementById(`size-${sizeNumber}`)?.addEventListener('click', () => {
            if (state.size === sizeNumber) return;
            widget?.HapticFeedback?.selectionChanged?.();
            updateEcomUI({ size: sizeNumber });
            sendAction(`setSize:${sizeNumber}`);
        });
    });

    document.getElementById('ecom-minus')?.addEventListener('click', () => {
        if (state.quantity <= 1) return;
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateEcomUI({ quantity: state.quantity - 1 });
        sendAction('qtyMinus');
    });

    document.getElementById('ecom-plus')?.addEventListener('click', () => {
        if (state.quantity >= 5) return;
        widget?.HapticFeedback?.impactOccurred?.('light');
        updateEcomUI({ quantity: state.quantity + 1 });
        sendAction('qtyPlus');
    });

    document.getElementById('btn-checkout')?.addEventListener('click', () => {
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

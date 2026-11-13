import type { EcommerceState } from './screen';

/**
 * Client-side script handling size selection, quantity calculation, and checkout feedback.
 * Leverages centralized class-based styling (.active) instead of imperative inline style mutations.
 */
export const ecommerceClientScript = (initial: EcommerceState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('ecom-toast');

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
        if (minusBtn && !isPending.quantity) minusBtn.disabled = state.quantity <= 1;
        if (plusBtn && !isPending.quantity) plusBtn.disabled = state.quantity >= 5;
    };

    const isPending = {
        size: false,
        quantity: false,
        checkout: false,
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const incoming = decodeEcommerceState(JSON.parse(widget.chatData));
                if (isPending.size) delete incoming.size;
                if (isPending.quantity) delete incoming.quantity;
                updateEcomUI(incoming);
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const sendAction = (action: string, onDone?: () => void) => {
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
            .catch(() => {})
            .finally(() => {
                onDone?.();
            });
    };

    [41, 42, 43, 44].forEach((sizeNumber) => {
        document.getElementById(`size-${sizeNumber}`)?.addEventListener('click', () => {
            if (isPending.size || state.size === sizeNumber) return;
            isPending.size = true;
            widget?.HapticFeedback?.selectionChanged?.();
            updateEcomUI({ size: sizeNumber });
            sendAction(`setSize:${sizeNumber}`, () => {
                isPending.size = false;
            });
        });
    });

    const minusBtn = document.getElementById('ecom-minus') as HTMLButtonElement | null;
    const plusBtn = document.getElementById('ecom-plus') as HTMLButtonElement | null;

    const handleQtyChange = (delta: number, action: string) => {
        if (isPending.quantity) return;
        const target = state.quantity + delta;
        if (target < 1 || target > 5) return;

        isPending.quantity = true;
        if (minusBtn) {
            minusBtn.disabled = true;
            minusBtn.style.pointerEvents = 'none';
        }
        if (plusBtn) {
            plusBtn.disabled = true;
            plusBtn.style.pointerEvents = 'none';
        }

        widget?.HapticFeedback?.impactOccurred?.('light');
        updateEcomUI({ quantity: target });
        sendAction(action, () => {
            isPending.quantity = false;
            if (minusBtn) {
                minusBtn.style.pointerEvents = '';
                minusBtn.disabled = state.quantity <= 1;
            }
            if (plusBtn) {
                plusBtn.style.pointerEvents = '';
                plusBtn.disabled = state.quantity >= 5;
            }
        });
    };

    minusBtn?.addEventListener('click', () => handleQtyChange(-1, 'qtyMinus'));
    plusBtn?.addEventListener('click', () => handleQtyChange(1, 'qtyPlus'));

    const checkoutBtn = document.getElementById('btn-checkout') as HTMLButtonElement | null;
    checkoutBtn?.addEventListener('click', () => {
        if (isPending.checkout || checkoutBtn.disabled) return;
        isPending.checkout = true;
        checkoutBtn.disabled = true;
        checkoutBtn.style.pointerEvents = 'none';

        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (toast) {
            toast.textContent = `🎉 Order placed! Size: ${state.size}, ${state.quantity} pair(s) for $${(state.quantity * state.pricePerUnit).toFixed(2)}`;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
        sendAction('checkout', () => {
            isPending.checkout = false;
            checkoutBtn.disabled = false;
            checkoutBtn.style.pointerEvents = '';
        });
    });
};

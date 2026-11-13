import type { EcommerceState } from './screen';

/**
 * Client-side script handling size selection, quantity calculation, and checkout feedback.
 */
export const ecommerceClientScript = (initial: EcommerceState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('ecom-toast');

    const updateEcomUI = () => {
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
                if (parsedData && typeof parsedData === 'object') {
                    state = { ...state, ...parsedData };
                    updateEcomUI();
                }
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    [41, 42, 43, 44].forEach((sizeNumber) => {
        document.getElementById(`size-${sizeNumber}`)?.addEventListener('click', () => {
            widget?.HapticFeedback?.selectionChanged?.();
            state.size = sizeNumber;
            updateEcomUI();
            widget?.request?.(`setSize:${sizeNumber}`);
        });
    });

    document.getElementById('ecom-minus')?.addEventListener('click', () => {
        if (state.quantity > 1) {
            widget?.HapticFeedback?.impactOccurred?.('light');
            state.quantity--;
            updateEcomUI();
            widget?.request?.('qtyMinus');
        }
    });

    document.getElementById('ecom-plus')?.addEventListener('click', () => {
        if (state.quantity < 5) {
            widget?.HapticFeedback?.impactOccurred?.('light');
            state.quantity++;
            updateEcomUI();
            widget?.request?.('qtyPlus');
        }
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
        widget?.request?.('checkout');
    });
};

/**
 * Client-side script providing reliable synchronized counter state.
 * Implements in-flight request locking ("wait for update") to prevent race conditions.
 */
export const clientCounterScript = (args: { count: number }) => {
    const widget = window.TelegramWidget;
    const incrementButton = document.getElementById('btn-inc');
    const decrementButton = document.getElementById('btn-dec');
    const counterValueElement = document.getElementById('counter-val');
    let count = args.count;
    let isPending = false;

    const setCount = (newCount: number) => {
        count = newCount;
        if (counterValueElement) counterValueElement.textContent = String(count);
    };

    const setBusy = (busy: boolean) => {
        isPending = busy;
        if (incrementButton) {
            incrementButton.style.opacity = busy ? '0.5' : '1';
            incrementButton.style.pointerEvents = busy ? 'none' : 'auto';
        }
        if (decrementButton) {
            decrementButton.style.opacity = busy ? '0.5' : '1';
            decrementButton.style.pointerEvents = busy ? 'none' : 'auto';
        }
    };

    const parseServerCount = (raw: unknown): number | undefined => {
        if (!raw || typeof raw !== 'object') return undefined;
        const obj = raw as Record<string, unknown>;
        if (typeof obj.count === 'number') return obj.count;
        if (typeof obj.c === 'number') return obj.c;
        return undefined;
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                const serverCount = parseServerCount(parsedData);
                if (serverCount !== undefined && !isPending) {
                    setCount(serverCount);
                }
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    const executeAction = (action: 'inc' | 'dec') => {
        if (isPending) return;
        setBusy(true);
        widget?.HapticFeedback?.impactOccurred?.('light');

        const requestPromise = widget?.request?.(action);
        if (!requestPromise || typeof requestPromise.then !== 'function') {
            setBusy(false);
            return;
        }

        requestPromise
            .then((response: { result?: string | null }) => {
                if (response?.result) {
                    try {
                        const parsedData = JSON.parse(response.result);
                        const serverCount = parseServerCount(parsedData);
                        if (serverCount !== undefined) {
                            setCount(serverCount);
                        }
                    } catch {
                        // ignore JSON parse errors
                    }
                }
            })
            .finally(() => {
                setBusy(false);
            });
    };

    incrementButton?.addEventListener('click', () => executeAction('inc'));
    decrementButton?.addEventListener('click', () => executeAction('dec'));
};

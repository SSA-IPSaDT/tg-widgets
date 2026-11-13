import type { ControlsState } from './screen';

/**
 * Client-side script providing instant optimistic UI feedback and multi-device state synchronization.
 */
export const controlsClientScript = (initial: ControlsState) => {
    const w = window.TelegramWidget;
    let s = { ...initial };
    const p: Record<string, boolean> = {};

    const dec = (raw: unknown): Partial<ControlsState> => {
        const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        const res: Partial<ControlsState> = {};
        const [o, n, k, l] = [
            r.notify ?? r.notifications ?? r.o,
            r.news ?? r.newsletter ?? r.w,
            r.tickets ?? r.k,
            r.plan ?? r.l,
        ];
        if (typeof o === 'boolean') res.notify = o;
        if (typeof n === 'boolean') res.news = n;
        if (typeof k === 'number') res.tickets = k;
        if (typeof l === 'string') res.plan = l;
        return res;
    };

    const cBtn = 'var(--tg-theme-button-color,#2481cc)';
    const sWrap = (inner: string) =>
        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">${inner}</svg>`;
    const updateUI = (up: Partial<ControlsState>) => {
        s = { ...s, ...up };
        if (typeof s.notify === 'boolean') {
            document
                .getElementById('toggle-notify')
                ?.querySelector('.tg-switch-track')
                ?.classList.toggle('active', s.notify);
        }
        if (typeof s.news === 'boolean') {
            const svg = document.getElementById('chk-news')?.querySelector('svg');
            if (svg) {
                svg.outerHTML = sWrap(
                    s.news
                        ? `<rect width="20" height="20" rx="5" fill="${cBtn}"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
                        : '<rect x="1" y="1" width="18" height="18" rx="5" stroke="rgba(120,120,128,0.4)" stroke-width="1.5"/>',
                );
            }
        }
        if (typeof s.tickets === 'number') {
            const st = document.getElementById('stepper-tickets');
            const sv = st?.querySelector('.tg-stepper-val');
            if (sv) sv.textContent = String(s.tickets);
            const btns = st?.querySelectorAll('button');
            if (btns && btns[0] && btns[1]) {
                btns[0].disabled = s.tickets <= 1;
                btns[1].disabled = s.tickets >= 10;
            }
        }
        if (s.plan) {
            const rSvg = (sel: boolean) =>
                sWrap(
                    `<circle cx="10" cy="10" r="9" stroke="${sel ? cBtn : 'rgba(120,120,128,0.4)'}" stroke-width="${sel ? 2 : 1.5}"/>${sel ? `<circle cx="10" cy="10" r="5" fill="${cBtn}"/>` : ''}`,
                );
            (['basic', 'pro'] as const).forEach((k) => {
                const el = document.getElementById(`plan-${k}`)?.querySelector('svg');
                if (el) el.outerHTML = rSvg(s.plan === k);
            });
        }
    };

    const sync = () => {
        try {
            if (w?.chatData) {
                const inc = dec(JSON.parse(w.chatData));
                for (const k of ['notify', 'news', 'tickets', 'plan']) {
                    if (p[k]) delete inc[k as keyof ControlsState];
                }
                updateUI(inc);
            }
        } catch {}
    };

    sync();
    w?.onEvent?.('chatDataChanged', sync);

    const act = (a: string) =>
        Promise.resolve(w?.request?.(a))
            .then((res?: { result?: string | null }) => {
                if (res?.result) {
                    try {
                        updateUI(dec(JSON.parse(res.result)));
                    } catch {}
                }
            })
            .catch(() => {});

    const lock = (
        k: string,
        btn: HTMLElement | (HTMLElement | null | undefined)[],
        fn: () => void,
        a: string,
    ) => {
        if (p[k]) return;
        p[k] = true;
        const els = Array.isArray(btn) ? btn.filter(Boolean) : [btn];
        els.forEach((b) => {
            if (b) {
                if ('disabled' in b) (b as HTMLButtonElement).disabled = true;
                b.style.pointerEvents = 'none';
            }
        });
        fn();
        act(a).finally(() => {
            p[k] = false;
            els.forEach((b) => {
                if (b) {
                    if ('disabled' in b) (b as HTMLButtonElement).disabled = false;
                    b.style.pointerEvents = '';
                }
            });
            updateUI({});
        });
    };

    const bindToggle = (
        id: string,
        key: 'notify' | 'news',
        action: string,
        hap: 'medium' | 'light',
    ) => {
        const btn = document.getElementById(id);
        btn?.addEventListener('click', () => {
            lock(
                key,
                btn,
                () => {
                    w?.HapticFeedback?.impactOccurred?.(hap);
                    updateUI({ [key]: !s[key] });
                },
                `${action}:${!s[key]}`,
            );
        });
    };

    bindToggle('toggle-notify', 'notify', 'toggleNotify', 'medium');
    bindToggle('chk-news', 'news', 'toggleNews', 'light');

    const sBtns = document.getElementById('stepper-tickets')?.querySelectorAll('button');
    if (sBtns && sBtns[0] && sBtns[1]) {
        const onTicket = (delta: number, a: string) => {
            const target = s.tickets + delta;
            if (target < 1 || target > 10) return;
            lock(
                'tickets',
                [sBtns[0], sBtns[1]],
                () => {
                    w?.HapticFeedback?.impactOccurred?.('light');
                    updateUI({ tickets: target });
                },
                a,
            );
        };
        sBtns[0].addEventListener('click', () => onTicket(-1, 'ticketMinus'));
        sBtns[1].addEventListener('click', () => onTicket(1, 'ticketPlus'));
    }

    (['basic', 'pro'] as const).forEach((k) => {
        const el = document.getElementById(`plan-${k}`);
        el?.addEventListener('click', () => {
            if (s.plan === k) return;
            const all = (['basic', 'pro'] as const)
                .map((x) => document.getElementById(`plan-${x}`))
                .filter(Boolean) as HTMLElement[];
            lock(
                'plan',
                all,
                () => {
                    w?.HapticFeedback?.selectionChanged?.();
                    updateUI({ plan: k });
                },
                `setPlan:${k}`,
            );
        });
    });
};

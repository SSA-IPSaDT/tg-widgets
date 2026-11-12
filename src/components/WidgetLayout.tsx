import { h } from '../jsx';

export interface WidgetRadii {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
}

export interface WidgetLayoutProps {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    theme?: 'auto' | 'light' | 'dark';
    gap?: number;
    /**
     * Border radius scale preset ('none' | 'sm' | 'md' | 'lg' | 'xl') or numeric base radius in pixels.
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /**
     * Fine-grained override tokens for specific border radii.
     */
    radii?: Partial<WidgetRadii>;
    /**
     * Internal padding for the widget. Defaults to '6px 8px' to ensure natural spacing inside the Telegram bubble.
     */
    padding?: number | string;
    /**
     * Accounts for Telegram bottom-right timestamp safe area overlay.
     */
    safeArea?: boolean;
    /**
     * Maximum bubble height (Telegram enforces a 50-600px range).
     */
    maxHeight?: number | string;
    minHeight?: number | string;
    width?: number | string;
    height?: number | string;
    /**
     * Expands widget to 100% of available bubble width.
     */
    fullWidth?: boolean;
    /**
     * Sets fixed or minimum height.
     */
    fullHeight?: boolean;
    /**
     * Expands widget to fill full width while retaining system padding.
     */
    expand?: boolean;
    [key: `data-${string}`]: string | undefined;
}

const RADIUS_PRESETS: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', WidgetRadii> = {
    none: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, xxl: 0, full: 9999 },
    sm: { xs: 3, sm: 6, md: 9, lg: 12, xl: 16, xxl: 20, full: 9999 },
    md: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 },
    lg: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 28, full: 9999 },
    xl: { xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36, full: 9999 },
};

const BASE_RESET_CSS =
    ':root{color-scheme:light dark;--tg-font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",Roboto,Helvetica,Arial,sans-serif;--tg-radius-xs:4px;--tg-radius-sm:8px;--tg-radius-md:12px;--tg-radius-lg:16px;--tg-radius-xl:20px;--tg-radius-xxl:24px;--tg-radius-full:9999px;}' +
    'html,body,button,label,input,select,textarea,div,span,p{font-family:var(--tg-font-family);}' +
    'html,body{margin:0;padding:0;width:100%;height:auto;background:transparent;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;touch-action:manipulation;-webkit-text-size-adjust:100%;}' +
    '*,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}' +
    'button,[role="button"],summary,.tg-btn,.tg-switch,.tg-checkbox,.tg-radio,.tg-stepper-btn,.tg-segmented-btn,[data-action]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;cursor:pointer;}' +
    '@keyframes tg-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.85);}}' +
    '.tg-badge-pulse{animation:tg-pulse 1.8s infinite ease-in-out;display:inline-block;}' +
    '.tg-widget-root{display:flex!important;flex-direction:column!important;box-sizing:border-box;width:100%;height:auto!important;overflow:visible!important;}' +
    '.tg-widget-root>style{display:none!important;}' +
    'details>summary::-webkit-details-marker,details>summary::marker{display:none!important;}' +
    'details>summary{touch-action:manipulation;cursor:pointer;user-select:none;-webkit-user-select:none;}' +
    'details[open] .tg-accordion-chevron{transform:rotate(90deg)!important;}' +
    '.tg-accordion-chevron{transition:transform .12s cubic-bezier(0.2,0,0,1)!important;}' +
    '.tg-card{border-radius:var(--tg-radius-lg,14px);padding:12px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box;width:100%;transition:background .12s ease,border-color .12s ease;}' +
    '.tg-card-default{background:var(--tg-theme-section-bg-color,var(--tg-theme-bg-color,#ffffff));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.15));box-shadow:0 1px 3px rgba(0,0,0,0.04);}' +
    '.tg-card-secondary{background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.08));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.12));}' +
    '.tg-card-outlined{background:transparent;border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.22));}' +
    '.tg-card-section{background:var(--tg-theme-section-bg-color,var(--tg-theme-secondary-bg-color,#ffffff));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.15));box-shadow:0 1px 3px rgba(0,0,0,0.04);}' +
    '.tg-card-inset{background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.10));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.10));}' +
    '.tg-card-header{display:flex;flex-direction:column;gap:2px;margin-bottom:2px;}' +
    '.tg-card-title{font-size:16px;font-weight:600;color:var(--tg-theme-text-color,inherit);}' +
    '.tg-card-content{display:flex;flex-direction:column;gap:8px;}' +
    '.tg-card-footer{display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-top:4px;}' +
    '.tg-segmented-control{display:flex;background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.14));border-radius:var(--tg-radius-md,10px);padding:3px;gap:2px;}' +
    '.tg-segmented-btn{flex:1;border:none;outline:none;background:transparent;color:var(--tg-theme-subtitle-text-color,var(--tg-theme-hint-color,#888));padding:6px 8px;font-size:12px;font-weight:500;border-radius:var(--tg-radius-sm,8px);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;touch-action:manipulation;transition:all .1s cubic-bezier(0.2,0,0,1);will-change:transform;}' +
    '.tg-segmented-btn:active{transform:scale(0.96);}' +
    '.tg-segmented-btn.active{background:var(--tg-theme-bg-color,#fff);color:var(--tg-theme-text-color,#111827);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.12);}' +
    '.tg-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-weight:600;font-family:inherit;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;border:none;flex:1 1 auto;transition:opacity .1s ease,transform .06s cubic-bezier(0.2,0,0,1);will-change:transform;}' +
    '.tg-btn:active{transform:scale(0.96);opacity:0.88;}' +
    '.tg-btn-sm{padding:6px 12px;font-size:13px;border-radius:var(--tg-radius-sm,8px);}' +
    '.tg-btn-md{padding:10px 16px;font-size:14px;border-radius:var(--tg-radius-md,12px);}' +
    '.tg-btn-lg{padding:14px 20px;font-size:16px;border-radius:var(--tg-radius-lg,14px);}' +
    '.tg-btn-full{width:100%!important;flex:1 1 0%!important;}' +
    '.tg-btn-primary{background:var(--tg-theme-button-color,#2481cc);color:var(--tg-theme-button-text-color,#fff);}' +
    '.tg-btn-secondary{background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.18))!important;border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.24))!important;color:var(--tg-theme-text-color,inherit)!important;}' +
    '.tg-btn-destructive{background:var(--tg-theme-destructive-text-color,#ef4444);color:#fff;}' +
    '.tg-btn-outline{background:transparent;color:var(--tg-theme-button-color,#2481cc);border:1px solid var(--tg-theme-button-color,#2481cc);}' +
    '.tg-btn-ghost{background:transparent;color:var(--tg-theme-link-color,#2481cc);}' +
    '.tg-badge{display:inline-flex;align-items:center;justify-content:center;gap:5px;font-weight:700;border-radius:var(--tg-radius-sm,6px);text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;font-size:10px;padding:2px 6px;}' +
    '.tg-badge-md{padding:4px 8px;font-size:12px;}' +
    '.tg-badge-square{width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;max-width:26px!important;max-height:26px!important;flex:0 0 26px!important;aspect-ratio:1/1!important;padding:0!important;box-sizing:border-box!important;border-radius:var(--tg-radius-sm,8px);}' +
    '.tg-badge-square.tg-badge-md{width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;max-width:30px!important;max-height:30px!important;flex:0 0 30px!important;}' +
    '.tg-badge-default{background:var(--tg-theme-secondary-bg-color,rgba(0,0,0,0.06));color:var(--tg-theme-text-color,inherit);border:none;}' +
    '.tg-badge-accent{background:rgba(36,129,204,0.15);color:var(--tg-theme-link-color,#2481cc);border:1px solid rgba(36,129,204,0.3);}' +
    '.tg-badge-destructive{background:rgba(239,68,68,0.15);color:var(--tg-theme-destructive-text-color,#ef4444);border:1px solid rgba(239,68,68,0.3);}' +
    '.tg-badge-outline{background:transparent;color:var(--tg-theme-subtitle-text-color,var(--tg-theme-hint-color,#888));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.2));}' +
    '.tg-badge-success{background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);}' +
    '.tg-badge-warning{background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);}' +
    '.tg-description{font-size:12.5px;font-weight:500;line-height:1.4;color:var(--tg-theme-subtitle-text-color,var(--tg-theme-text-color,#111827));opacity:0.85;}' +
    '.tg-switch{display:inline-flex;align-items:center;justify-content:space-between;gap:12px;background:transparent;border:none;padding:4px 0;margin:0;text-align:left;font-family:inherit;cursor:pointer;opacity:1;color:var(--tg-theme-text-color,inherit);width:100%;touch-action:manipulation;user-select:none;-webkit-user-select:none;}' +
    '.tg-switch:disabled{opacity:0.5;cursor:default;}' +
    '.tg-switch-track{position:relative;width:44px;height:26px;border-radius:13px;background-color:rgba(120,120,128,0.24);transition:background-color .12s cubic-bezier(0.2,0,0,1);flex-shrink:0;}' +
    '.tg-switch-track.active{background-color:var(--tg-theme-button-color,#2481cc);}' +
    '.tg-switch-thumb{position:absolute;top:2px;left:2px;width:22px;height:22px;border-radius:50%;background-color:#ffffff;box-shadow:0 2px 4px rgba(0,0,0,0.2);transition:left .12s cubic-bezier(0.2,0,0,1),transform .08s ease;will-change:left;}' +
    '.tg-switch-track.active .tg-switch-thumb{left:20px;}' +
    '.tg-switch:active .tg-switch-thumb{transform:scale(0.94);}' +
    '.tg-divider{border:none;height:1px;background-color:rgba(120,120,128,0.14);margin:0;width:100%;}' +
    '.tg-checkbox{display:inline-flex;align-items:center;gap:10px;background:transparent;border:none;padding:4px 0;margin:0;text-align:left;font-family:inherit;cursor:pointer;opacity:1;color:var(--tg-theme-text-color,inherit);width:100%;touch-action:manipulation;user-select:none;-webkit-user-select:none;}' +
    '.tg-checkbox:disabled{opacity:0.5;cursor:default;}' +
    '.tg-checkbox:active svg{transform:scale(0.92);transition:transform .06s ease;}' +
    '.tg-radio{display:inline-flex;align-items:center;gap:10px;background:transparent;border:none;padding:4px 0;margin:0;text-align:left;font-family:inherit;cursor:pointer;opacity:1;color:var(--tg-theme-text-color,inherit);width:100%;touch-action:manipulation;user-select:none;-webkit-user-select:none;}' +
    '.tg-radio:disabled{opacity:0.5;cursor:default;}' +
    '.tg-radio:active svg{transform:scale(0.92);transition:transform .06s ease;}' +
    '.tg-alert{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;border-radius:var(--tg-radius-md,14px);box-shadow:0 1px 3px rgba(0,0,0,0.05);color:var(--tg-theme-text-color,inherit);width:100%;box-sizing:border-box;}' +
    '.tg-alert-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}' +
    '.tg-alert-body{display:flex;flex-direction:column;gap:2px;flex:1;}' +
    '.tg-alert-title{font-weight:600;font-size:14px;letter-spacing:-0.1px;color:var(--tg-theme-text-color,inherit);}' +
    '.tg-alert-desc{font-size:13px;font-weight:500;color:var(--tg-theme-text-color,inherit);opacity:0.9;line-height:1.4;}' +
    '.tg-alert-default{background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.12));border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.20));}' +
    '.tg-alert-default .tg-alert-icon{background:rgba(120,120,128,0.16);color:var(--tg-theme-text-color,inherit);}' +
    '.tg-alert-info{background:rgba(36,129,204,0.10);border:1px solid rgba(36,129,204,0.28);}' +
    '.tg-alert-info .tg-alert-icon{background:rgba(36,129,204,0.18);color:var(--tg-theme-link-color,#2481cc);}' +
    '.tg-alert-success{background:rgba(16,185,129,0.10);border:1px solid rgba(16,185,129,0.28);}' +
    '.tg-alert-success .tg-alert-icon{background:rgba(16,185,129,0.18);color:#10b981;}'+
    '.tg-alert-warning{background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.28);}' +
    '.tg-alert-warning .tg-alert-icon{background:rgba(245,158,11,0.18);color:#f59e0b;}' +
    '.tg-alert-destructive{background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.28);}' +
    '.tg-alert-destructive .tg-alert-icon{background:rgba(239,68,68,0.18);color:var(--tg-theme-destructive-text-color,#ef4444);}' +
    '.tg-stepper{display:inline-flex;align-items:center;background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.14));border-radius:8px;padding:3px;gap:4px;flex-shrink:0;}' +
    '.tg-stepper-btn{flex:0 0 28px;width:28px;height:28px;min-width:28px;max-width:28px;min-height:28px;max-height:28px;aspect-ratio:1/1;padding:0;margin:0;box-sizing:border-box;border-radius:6px;border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.16));background:var(--tg-theme-section-bg-color,var(--tg-theme-bg-color,#ffffff));color:var(--tg-theme-text-color,inherit);display:inline-flex;align-items:center;justify-content:center;line-height:0;box-shadow:0 1px 2px rgba(0,0,0,0.06);touch-action:manipulation;cursor:pointer;transition:transform .06s ease,background-color .08s ease;will-change:transform;}' +
    '.tg-stepper-btn:active{transform:scale(0.92);background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.22));}' +
    '.tg-stepper-btn:disabled{opacity:0.4;cursor:default;}' +
    '.tg-stepper-val{font-weight:600;font-size:14px;min-width:24px;text-align:center;}' +
    'table.tg-table tr:last-child{border-bottom:none!important;}' +
    'table.tg-table tfoot tr{border-bottom:none!important;}' +
    'svg.lucide{fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;display:inline-block;vertical-align:middle;flex-shrink:0;}';

export const WidgetLayout = ({
    children,
    style,
    className = '',
    theme = 'auto',
    gap = 10,
    radius,
    radii,
    padding = '6px 8px',
    safeArea = false,
    maxHeight,
    minHeight,
    width,
    height,
    fullWidth = true,
    fullHeight = false,
    expand = false,
    ...dataAttrs
}: WidgetLayoutProps): string => {
    const themeStyle =
        theme === 'auto'
            ? {}
            : {
                  colorScheme: theme,
              };

    const safeAreaStyle = safeArea
        ? {
              paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
              paddingRight:
                  'max(12px, var(--tg-content-safe-area-corner-right, 0px))',
          }
        : {};

    const isFullWidth = fullWidth || expand;

    const radiusTokens =
        radius !== undefined || radii !== undefined
            ? (() => {
                  const base =
                      typeof radius === 'number'
                          ? {
                                xs: Math.max(0, Math.round(radius * 0.25)),
                                sm: Math.max(0, Math.round(radius * 0.5)),
                                md: Math.max(0, Math.round(radius * 0.75)),
                                lg: radius,
                                xl: Math.round(radius * 1.25),
                                xxl: Math.round(radius * 1.5),
                                full: 9999,
                            }
                          : typeof radius === 'string' && radius in RADIUS_PRESETS
                            ? RADIUS_PRESETS[radius as keyof typeof RADIUS_PRESETS]
                            : RADIUS_PRESETS.md;
                  const merged = { ...base, ...radii };
                  return {
                      '--tg-radius-xs': `${merged.xs}px`,
                      '--tg-radius-sm': `${merged.sm}px`,
                      '--tg-radius-md': `${merged.md}px`,
                      '--tg-radius-lg': `${merged.lg}px`,
                      '--tg-radius-xl': `${merged.xl}px`,
                      '--tg-radius-xxl': `${merged.xxl}px`,
                      '--tg-radius-full': `${merged.full}px`,
                  };
              })()
            : {};

    const layoutStyle = {
        padding,
        boxSizing: 'border-box',
        width: width ?? (isFullWidth ? '100%' : 'auto'),
        ...(height !== undefined ? { height } : {}),
        ...(minHeight !== undefined ? { minHeight } : {}),
        color: 'var(--tg-theme-text-color, #111827)',
        display: 'flex',
        flexDirection: 'column',
        gap,
        maxHeight: maxHeight ?? 600,
        ...themeStyle,
        ...safeAreaStyle,
        ...radiusTokens,
        ...style,
    };

    return (
        <div
            class={`tg-widget-root ${className}`.trim()}
            style={layoutStyle}
            {...dataAttrs}
        >
            <style>{BASE_RESET_CSS}</style>
            {children}
        </div>
    );
};

/**
 * @deprecated Use `WidgetLayout` instead. Kept for backwards compatibility.
 */
export const BubbleLayout = WidgetLayout;

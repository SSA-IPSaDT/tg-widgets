import { h } from '../jsx';

export interface WidgetLayoutProps {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    theme?: 'auto' | 'light' | 'dark';
    gap?: number;
    scrollable?: boolean;
    maxHeight?: number | string;
}

const BASE_RESET_CSS =
    ":root{color-scheme:light dark;}body{margin:0;padding:0;background:transparent;-webkit-font-smoothing:antialiased;}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}button,input,label{font-family:inherit;}.tg-widget-root{display:flex!important;flex-direction:column!important;box-sizing:border-box;width:100%;}.tg-widget-root>style{display:none!important;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:rgba(120,120,128,0.25);border-radius:4px;}::-webkit-scrollbar-track{background:transparent;}.tg-card{border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box;width:100%;}.tg-card-default{background:var(--tg-theme-secondary-bg-color,rgba(0,0,0,0.04));border:none;}.tg-card-outlined{background:transparent;border:1px solid rgba(120,120,128,0.16);}.tg-card-section{background:var(--tg-theme-section-bg-color,var(--tg-theme-secondary-bg-color,rgba(0,0,0,0.04)));border:none;}.tg-card-inset{background:rgba(0,0,0,0.08);border:none;}.tg-segmented-control{display:flex;background:var(--tg-theme-secondary-bg-color,rgba(120,120,128,0.14));border-radius:10px;padding:3px;gap:2px;}.tg-segmented-btn{flex:1;border:none;outline:none;background:transparent;color:var(--tg-theme-hint-color,#888);padding:6px 8px;font-size:12px;font-weight:500;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;transition:all .15s ease;}.tg-segmented-btn.active{background:var(--tg-theme-bg-color,#fff);color:var(--tg-theme-text-color,#111827);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.12);}.tg-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-weight:600;font-family:inherit;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;border:none;flex:1;transition:opacity .15s ease,transform .1s ease;}.tg-btn:active{transform:scale(0.97);opacity:0.85;}.tg-btn-sm{padding:6px 12px;font-size:13px;border-radius:8px;}.tg-btn-md{padding:10px 16px;font-size:14px;border-radius:12px;}.tg-btn-lg{padding:14px 20px;font-size:16px;border-radius:14px;}.tg-btn-full{width:100%;flex:none;}.tg-btn-primary{background:var(--tg-theme-button-color,#2481cc);color:var(--tg-theme-button-text-color,#fff);}.tg-btn-secondary{background:var(--tg-theme-secondary-bg-color,rgba(0,0,0,0.06));color:var(--tg-theme-text-color,inherit);}.tg-btn-destructive{background:var(--tg-theme-destructive-text-color,#ef4444);color:#fff;}.tg-btn-outline{background:transparent;color:var(--tg-theme-button-color,#2481cc);border:1px solid var(--tg-theme-button-color,#2481cc);}.tg-btn-ghost{background:transparent;color:var(--tg-theme-link-color,#2481cc);}.tg-badge{display:inline-flex;align-items:center;justify-content:center;gap:5px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;font-size:10px;padding:2px 6px;}.tg-badge-md{padding:4px 8px;font-size:12px;}.tg-badge-default{background:var(--tg-theme-secondary-bg-color,rgba(0,0,0,0.06));color:var(--tg-theme-text-color,inherit);border:none;}.tg-badge-accent{background:rgba(36,129,204,0.15);color:var(--tg-theme-link-color,#2481cc);border:1px solid rgba(36,129,204,0.3);}.tg-badge-destructive{background:rgba(239,68,68,0.15);color:var(--tg-theme-destructive-text-color,#ef4444);border:1px solid rgba(239,68,68,0.3);}.tg-badge-outline{background:transparent;color:var(--tg-theme-hint-color,#888);border:1px solid var(--tg-theme-hint-color,rgba(0,0,0,0.15));}.tg-badge-success{background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);}.tg-badge-warning{background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);}.tg-switch-input:checked + .tg-switch-slider{background-color:var(--tg-theme-button-color,#2481cc)!important;}.tg-switch-input:checked + .tg-switch-slider .tg-switch-thumb{left:20px!important;}.tg-checkbox-input:checked{background-color:var(--tg-theme-button-color,#2481cc)!important;border-color:var(--tg-theme-button-color,#2481cc)!important;}.tg-checkbox-input:checked::after{content:'';display:block;width:4px;height:8px;border:solid var(--tg-theme-button-text-color,#ffffff);border-width:0 2px 2px 0;transform:rotate(45deg);margin-left:5px;margin-top:1px;}.tg-radio-input:checked{border-color:var(--tg-theme-button-color,#2481cc)!important;background:radial-gradient(circle,var(--tg-theme-button-color,#2481cc) 42%,transparent 48%)!important;}";

export const WidgetLayout = ({
    children,
    style,
    className = '',
    theme = 'auto',
    gap = 10,
    scrollable = false,
    maxHeight,
}: WidgetLayoutProps): string => {
    const themeStyle =
        theme === 'auto'
            ? {}
            : {
                  colorScheme: theme,
              };

    const scrollStyle = scrollable
        ? {
              maxHeight: maxHeight ?? 580,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
          }
        : {};

    const layoutStyle = {
        padding: 12,
        fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: 'var(--tg-theme-text-color, #111827)',
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...themeStyle,
        ...scrollStyle,
        ...style,
    };

    return (
        <div class={`tg-widget-root ${className}`.trim()} style={layoutStyle}>
            <style>{BASE_RESET_CSS}</style>
            {children}
        </div>
    );
};

/**
 * @deprecated Use `WidgetLayout` instead. Kept for backwards compatibility.
 */
export const BubbleLayout = WidgetLayout;

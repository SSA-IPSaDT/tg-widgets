import type { WidgetRadii } from './WidgetLayout';

export const RADIUS_PRESETS: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', WidgetRadii> = {
    none: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, xxl: 0, full: 9999 },
    sm: { xs: 3, sm: 6, md: 9, lg: 12, xl: 16, xxl: 20, full: 9999 },
    md: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 },
    lg: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 28, full: 9999 },
    xl: { xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36, full: 9999 },
};

export const BASE_RESET_CSS =
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
    '.tg-btn-destructive{background:var(--tg-theme-destructive-text-color,#ff3b30)!important;color:#fff!important;}' +
    '.tg-btn-outline{background:transparent!important;border:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.25))!important;color:var(--tg-theme-text-color,inherit)!important;}' +
    '.tg-btn-ghost{background:transparent!important;border:none!important;color:var(--tg-theme-button-color,#2481cc)!important;}' +
    '.tg-btn-disabled{opacity:0.45!important;cursor:not-allowed!important;pointer-events:none!important;}' +
    '.tg-table{border-collapse:collapse;width:100%;}' +
    '.tg-table th,.tg-table td{padding:8px 12px;border-bottom:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.12));}' +
    '.tg-table th{font-weight:600;color:var(--tg-theme-subtitle-text-color,var(--tg-theme-hint-color,#888));font-size:11px;text-transform:uppercase;letter-spacing:0.4px;}' +
    '.tg-table tr:last-child td{border-bottom:none;}' +
    '.tg-table-footer td{border-top:1px solid var(--tg-theme-section-separator-color,rgba(120,120,128,0.16));font-weight:600;}';

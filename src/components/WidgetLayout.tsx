import { h } from '../jsx';
import { BASE_RESET_CSS, RADIUS_PRESETS } from './WidgetLayout.styles';

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
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
    radii?: Partial<WidgetRadii>;
    padding?: number | string;
    safeArea?: boolean;
    maxHeight?: number | string;
    minHeight?: number | string;
    width?: number | string;
    height?: number | string;
    fullWidth?: boolean;
    fullHeight?: boolean;
    expand?: boolean;
    [key: `data-${string}`]: string | undefined;
}

export { RADIUS_PRESETS, BASE_RESET_CSS } from './WidgetLayout.styles';

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
    const themeStyle = theme === 'auto' ? {} : { colorScheme: theme };

    const safeAreaStyle = safeArea
        ? {
              paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
              paddingRight: 'max(12px, var(--tg-content-safe-area-corner-right, 0px))',
          }
        : {};

    const isFullWidth = fullWidth || expand;
    const isFullHeight = fullHeight || expand;
    const effectivePadding = expand ? 0 : padding;

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
        padding: effectivePadding,
        boxSizing: 'border-box',
        width: width ?? (isFullWidth ? '100%' : 'auto'),
        ...(isFullHeight ? { height: '100%', flex: 1 } : {}),
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
        <div class={`tg-widget-root ${className}`.trim()} style={layoutStyle} {...dataAttrs}>
            <style>{BASE_RESET_CSS}</style>
            {children}
        </div>
    );
};

export const BubbleLayout = WidgetLayout;

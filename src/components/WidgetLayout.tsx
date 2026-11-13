import { h } from '../jsx';
import { BASE_RESET_CSS, RADIUS_PRESETS } from './WidgetLayout.styles';

/**
 * Configuration for border radii across widget components.
 */
export interface WidgetRadii {
    /** Extra small radius in px. */
    xs: number;
    /** Small radius in px. */
    sm: number;
    /** Medium radius in px. */
    md: number;
    /** Large radius in px. */
    lg: number;
    /** Extra large radius in px. */
    xl: number;
    /** Extra extra large radius in px. */
    xxl: number;
    /** Full (pill/circular) radius in px. */
    full: number;
}

/**
 * Props for the WidgetLayout component.
 */
export interface WidgetLayoutProps {
    /** Widget children elements. */
    children?: unknown;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Force light or dark theme or adhere to auto Telegram theme. */
    theme?: 'auto' | 'light' | 'dark';
    /** Spacing between vertical children elements in px. */
    gap?: number;
    /** Radius preset name or explicit uniform radius number. */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Fine-grained customization of individual radius scale tokens. */
    radii?: Partial<WidgetRadii>;
    /** Inner padding of the widget container. */
    padding?: number | string;
    /** Whether to respect Telegram safe-area insets. */
    safeArea?: boolean;
    /** Maximum height constraint for widget container. */
    maxHeight?: number | string;
    /** Minimum height constraint for widget container. */
    minHeight?: number | string;
    /** Fixed width constraint for widget container. */
    width?: number | string;
    /** Fixed height constraint for widget container. */
    height?: number | string;
    /** Whether widget expands horizontally to full width. */
    fullWidth?: boolean;
    /** Whether widget expands vertically to full container height. */
    fullHeight?: boolean;
    /** Whether widget root expands in flex container. */
    expand?: boolean;
    /** Data attributes passed to root container. */
    [key: `data-${string}`]: string | undefined;
}

export { RADIUS_PRESETS, BASE_RESET_CSS } from './WidgetLayout.styles';

/**
 * Root container layout for Telegram widgets with base reset CSS and theme variables.
 *
 * @param props - Layout configuration props.
 * @returns Rendered HTML string.
 */
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
        ...(maxHeight !== undefined ? { maxHeight } : {}),
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

/**
 * Alias for WidgetLayout representing a bubble-style widget layout.
 */
export const BubbleLayout: (props: WidgetLayoutProps) => string = WidgetLayout;

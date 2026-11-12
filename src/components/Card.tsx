import { h } from '../jsx';

export interface CardProps {
    id?: string;
    variant?: 'default' | 'section' | 'secondary' | 'outlined' | 'inset';
    radius?: number;
    gap?: number;
    fullWidth?: boolean;
    fullHeight?: boolean;
    header?: unknown;
    footer?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
    [key: `data-${string}`]: string | undefined;
}

export const Card = ({
    id,
    variant = 'default',
    radius,
    gap = 8,
    fullWidth = true,
    fullHeight = false,
    header,
    footer,
    style,
    className = '',
    children,
    ...dataAttrs
}: CardProps): string => {
    const overrides: Record<string, string | number | undefined | null> = {
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(gap !== 8 ? { gap } : {}),
        ...(fullWidth ? { width: '100%' } : {}),
        ...(fullHeight ? { height: '100%', flex: 1 } : {}),
        ...style,
    };

    return (
        <div
            id={id}
            class={`tg-card tg-card-${variant} ${className}`.trim()}
            style={Object.keys(overrides).length > 0 ? overrides : undefined}
            {...dataAttrs}
        >
            {header && (
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'var(--tg-theme-section-header-text-color, var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827)))',
                        opacity: 0.7,
                    }}
                >
                    {header}
                </div>
            )}
            {children}
            {footer && (
                <div
                    style={{
                        fontSize: 11.5,
                        color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                        opacity: 0.7,
                        marginTop: 4,
                    }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
};

export const Section = Card;

export const CardHeader = ({
    children,
    style,
    className = '',
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}): string => (
    <div class={`tg-card-header ${className}`.trim()} style={style}>
        {children}
    </div>
);

export const CardTitle = ({
    children,
    style,
    className = '',
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}): string => (
    <div class={`tg-card-title ${className}`.trim()} style={style}>
        {children}
    </div>
);

export const CardDescription = ({
    children,
    style,
    className = '',
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}): string => (
    <div class={`tg-description ${className}`.trim()} style={style}>
        {children}
    </div>
);

export const CardContent = ({
    children,
    style,
    className = '',
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}): string => (
    <div class={`tg-card-content ${className}`.trim()} style={style}>
        {children}
    </div>
);

export const CardFooter = ({
    children,
    style,
    className = '',
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}): string => (
    <div class={`tg-card-footer ${className}`.trim()} style={style}>
        {children}
    </div>
);

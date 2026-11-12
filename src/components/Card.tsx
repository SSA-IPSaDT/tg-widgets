import { h } from '../jsx';

export interface CardProps {
    id?: string;
    variant?: 'default' | 'outlined' | 'section' | 'inset';
    radius?: number;
    gap?: number;
    header?: unknown;
    footer?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const Card = ({
    id,
    variant = 'default',
    radius,
    gap = 8,
    header,
    footer,
    style,
    className = '',
    children,
}: CardProps): string => {
    const overrides: Record<string, string | number | undefined | null> = {
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(gap !== 8 ? { gap } : {}),
        ...style,
    };

    return (
        <div
            id={id}
            class={`tg-card tg-card-${variant} ${className}`.trim()}
            style={Object.keys(overrides).length > 0 ? overrides : undefined}
        >
            {header && (
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'var(--tg-theme-hint-color, #888888)',
                    }}
                >
                    {header}
                </div>
            )}
            {children}
            {footer && (
                <div
                    style={{
                        fontSize: 11,
                        color: 'var(--tg-theme-hint-color, #888888)',
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

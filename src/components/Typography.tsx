import { h } from '../jsx';

export interface TypographyProps {
    variant?:
        | 'title'
        | 'headline'
        | 'subhead'
        | 'body'
        | 'caption'
        | 'footnote'
        | 'code';
    color?: 'default' | 'hint' | 'link' | 'accent' | 'destructive' | 'success';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
    truncate?: boolean;
    as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'code';
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const Typography = ({
    variant = 'body',
    color = 'default',
    weight,
    align,
    truncate = false,
    as,
    style,
    className = '',
    children,
}: TypographyProps): string => {
    const variantStyles = {
        title: { fontSize: 20, fontWeight: 700, lineHeight: 1.25 },
        headline: { fontSize: 17, fontWeight: 600, lineHeight: 1.3 },
        subhead: { fontSize: 14, fontWeight: 600, lineHeight: 1.35 },
        body: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
        caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.35 },
        footnote: { fontSize: 11, fontWeight: 400, lineHeight: 1.3 },
        code: {
            fontSize: 13,
            fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
            fontWeight: 500,
            lineHeight: 1.4,
        },
    }[variant];

    const colorStyles = {
        default: 'var(--tg-theme-text-color, inherit)',
        hint: 'var(--tg-theme-hint-color, #888888)',
        link: 'var(--tg-theme-link-color, #2481cc)',
        accent: 'var(--tg-theme-button-color, #2481cc)',
        destructive: 'var(--tg-theme-destructive-text-color, #ef4444)',
        success: '#10b981',
    }[color];

    const weightMap = {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    };

    const truncateStyle = truncate
        ? {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
          }
        : {};

    const Tag =
        as ??
        (variant === 'title'
            ? 'h2'
            : variant === 'headline'
              ? 'h3'
              : variant === 'code'
                ? 'code'
                : 'div');

    const baseStyle = {
        color: colorStyles,
        textAlign: align,
        margin: 0,
        ...variantStyles,
        ...(weight ? { fontWeight: weightMap[weight] } : {}),
        ...truncateStyle,
        ...style,
    };

    return (
        <Tag
            class={`tg-text tg-text-${variant} ${className}`}
            style={baseStyle}
        >
            {children}
        </Tag>
    );
};

export const Text = Typography;

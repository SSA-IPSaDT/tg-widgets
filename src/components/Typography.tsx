import { h } from '../jsx';

/**
 * Props for the Typography component.
 */
export interface TypographyProps {
    /** Typographic scale variant. Default 'body'. */
    variant?: 'title' | 'headline' | 'subhead' | 'body' | 'caption' | 'footnote' | 'code';
    /** Semantic theme color. Default 'default'. */
    color?: 'default' | 'hint' | 'link' | 'accent' | 'destructive' | 'success';
    /** Font weight override. */
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    /** Text alignment. */
    align?: 'left' | 'center' | 'right';
    /** Whether text should truncate with ellipsis if it overflows. */
    truncate?: boolean;
    /** Semantic HTML wrapper tag. Defaults according to variant. */
    as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'code';
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Text or child elements. */
    children?: unknown;
}

/**
 * Typographic text element formatted to Telegram theme typography.
 *
 * @param props - Typography configuration props.
 * @returns Rendered HTML string.
 */
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
        accent: 'var(--tg-theme-accent-text-color, var(--tg-theme-button-color, var(--tg-theme-link-color, #2481cc)))',
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
        <Tag class={`tg-text tg-text-${variant} ${className}`} style={baseStyle}>
            {children}
        </Tag>
    );
};

/**
 * Alias for Typography component.
 */
export const Text: (props: TypographyProps) => string = Typography;

/**
 * Props for the DescriptionText component.
 */
export interface DescriptionTextProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Content elements. */
    children?: unknown;
    /** HTML tag to render. Default 'div'. */
    as?: 'div' | 'span' | 'p';
}

/**
 * Secondary description text styled with Telegram subtitle/hint color.
 *
 * @param props - DescriptionTextProps.
 * @returns Rendered HTML string.
 */
export const DescriptionText = ({
    id,
    style,
    className = '',
    children,
    as: Tag = 'div',
}: DescriptionTextProps): string => (
    <Tag
        id={id}
        class={`tg-description ${className}`.trim()}
        style={{
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: 1.4,
            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
            opacity: 0.85,
            ...style,
        }}
    >
        {children}
    </Tag>
);

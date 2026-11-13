import { h } from '../jsx';
import { ChevronRightIcon } from './Icon';

/**
 * Props for the AccordionItem component.
 */
export interface AccordionItemProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Header title or JSX element displayed in summary bar. */
    title: unknown;
    /** Expandable content elements. */
    children?: unknown;
    /** Whether the item is expanded by default. */
    open?: boolean;
    /** Whether interaction is disabled. */
    disabled?: boolean;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Data attributes passed to root element. */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Accordion item based on native HTML `<details>` and `<summary>` elements.
 * Fully compliant with Telegram QuickJS Profile 1; toggles natively without JavaScript.
 *
 * @example
 * <AccordionItem title="FAQ Question" open={true}>
 *   Detailed answer text here.
 * </AccordionItem>
 */
export const AccordionItem = ({
    id,
    title,
    children,
    open = false,
    disabled = false,
    style,
    className = '',
    ...dataAttrs
}: AccordionItemProps): string => {
    return (
        <details
            id={id}
            open={open}
            class={`tg-accordion-item ${className}`.trim()}
            style={{
                borderBottom:
                    '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
                width: '100%',
                opacity: disabled ? 0.5 : 1,
                ...style,
            }}
            {...dataAttrs}
        >
            <summary
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 4px',
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--tg-theme-text-color, inherit)',
                    cursor: disabled ? 'default' : 'pointer',
                    listStyle: 'none',
                    userSelect: 'none',
                    touchAction: 'manipulation',
                }}
            >
                <span>{title}</span>
                <span
                    class="tg-accordion-chevron"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'var(--tg-theme-hint-color, #888888)',
                        transition: 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)',
                    }}
                >
                    {ChevronRightIcon({ size: 16 })}
                </span>
            </summary>
            <div
                style={{
                    padding: '0 4px 12px 4px',
                    fontSize: 13,
                    color: 'var(--tg-theme-text-color, inherit)',
                    opacity: 0.88,
                    lineHeight: 1.45,
                }}
            >
                {children}
            </div>
        </details>
    );
};

/**
 * Props for the Accordion container component.
 */
export interface AccordionProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Accordion items or content elements. */
    children?: unknown;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * Accordion container for grouping expandable `<details>` sections.
 *
 * @example
 * <Accordion>
 *   <AccordionItem title="Section 1">Content 1</AccordionItem>
 *   <AccordionItem title="Section 2">Content 2</AccordionItem>
 * </Accordion>
 */
export const Accordion = ({ id, children, style, className = '' }: AccordionProps): string => {
    return (
        <div
            id={id}
            class={`tg-accordion ${className}`.trim()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Alias for AccordionItem representing a collapsible section.
 */
export const Collapsible: (props: AccordionItemProps) => string = AccordionItem;

import { h } from '../jsx';
import { ChevronRightIcon } from './Icon';

export interface AccordionItemProps {
    id?: string;
    title: unknown;
    children?: unknown;
    open?: boolean;
    disabled?: boolean;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
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

export interface AccordionProps {
    id?: string;
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
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

export const Collapsible = AccordionItem;

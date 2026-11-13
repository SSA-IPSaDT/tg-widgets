import { h } from '../jsx';

export interface TableProps {
    id?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
    [key: `data-${string}`]: string | undefined;
}

export * from './Table.parts';

/**
 * Data Table component (shadcn/ui style) for Telegram Widgets.
 * Natively supported in Telegram QuickJS Profile 1 with clean cell borders and auto-wrapping.
 *
 * @example
 * <Table>
 *   <TableHeader><TableRow><TableHead>Item</TableHead><TableHead align="right">Price</TableHead></TableRow></TableHeader>
 *   <TableBody><TableRow><TableCell>TON</TableCell><TableCell align="right">$5.40</TableCell></TableRow></TableBody>
 * </Table>
 */
export const Table = ({
    id,
    style,
    className = '',
    children,
    ...dataAttrs
}: TableProps): string => {
    return (
        <div
            style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 'var(--tg-radius-md, 12px)',
                border: '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
            }}
        >
            <table
                id={id}
                class={`tg-table ${className}`.trim()}
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                    textAlign: 'left',
                    captionSide: 'bottom',
                    ...style,
                }}
                {...dataAttrs}
            >
                {children}
            </table>
        </div>
    );
};

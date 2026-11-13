import { h } from '../jsx';

/**
 * Props for the Table container component (`<table>`).
 */
export interface TableProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Table parts (`TableHeader`, `TableBody`, `TableFooter`, `TableCaption`, rows). */
    children?: unknown;
    /** Data attributes passed to root table element. */
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
        <table id={id} class={`tg-table ${className}`.trim()} style={style} {...dataAttrs}>
            {children}
        </table>
    );
};

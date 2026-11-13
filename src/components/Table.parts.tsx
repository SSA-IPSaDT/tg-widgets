import { h } from '../jsx';

/**
 * Props for table structural sections (`<thead>`, `<tbody>`, `<tfoot>`, `<caption>`).
 */
export interface TableSectionProps {
    /** Child table rows or text. */
    children?: unknown;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * Props for the TableRow component (`<tr>`).
 */
export interface TableRowProps {
    /** Child table cells (`<th>`, `<td>`). */
    children?: unknown;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Whether row has interactive hover and pointer states. */
    interactive?: boolean;
    /** Explicitly control bottom border of this row. */
    borderBottom?: boolean;
}

/**
 * Props for table cells (`<th>`, `<td>`).
 */
export interface TableCellProps {
    /** Cell contents. */
    children?: unknown;
    /** Text alignment within cell. */
    align?: 'left' | 'center' | 'right';
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Column span attribute. */
    colspan?: number;
    /** Row span attribute. */
    rowspan?: number;
}

/**
 * Table header group (`<thead>`).
 *
 * @param props - TableSectionProps.
 * @returns Rendered HTML string.
 */
export const TableHeader = ({ children, style, className = '' }: TableSectionProps): string => (
    <thead class={className || undefined} style={style}>
        {children}
    </thead>
);

/**
 * Table body group (`<tbody>`).
 *
 * @param props - TableSectionProps.
 * @returns Rendered HTML string.
 */
export const TableBody = ({ children, style, className = '' }: TableSectionProps): string => (
    <tbody class={className || undefined} style={style}>
        {children}
    </tbody>
);

/**
 * Table footer group (`<tfoot>`).
 *
 * @param props - TableSectionProps.
 * @returns Rendered HTML string.
 */
export const TableFooter = ({ children, style, className = '' }: TableSectionProps): string => (
    <tfoot class={`tg-table-footer ${className}`.trim() || undefined} style={style}>
        {children}
    </tfoot>
);

/**
 * Table row element (`<tr>`).
 *
 * @param props - TableRowProps.
 * @returns Rendered HTML string.
 */
export const TableRow = ({
    children,
    style,
    className = '',
    interactive = false,
    borderBottom,
}: TableRowProps): string => {
    const classes = [
        interactive ? 'tg-table-row-interactive' : '',
        borderBottom === false ? 'tg-table-row-noborder' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <tr
            class={classes || undefined}
            style={{
                ...(borderBottom === false ? { borderBottom: 'none' } : {}),
                ...(borderBottom === true
                    ? {
                          borderBottom:
                              '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
                      }
                    : {}),
                ...(interactive ? { cursor: 'pointer' } : {}),
                ...style,
            }}
        >
            {children}
        </tr>
    );
};

/**
 * Table header cell element (`<th>`).
 *
 * @param props - TableCellProps.
 * @returns Rendered HTML string.
 */
export const TableHead = ({ children, align, style, className = '' }: TableCellProps): string => (
    <th
        class={className || undefined}
        style={{
            ...(align ? { textAlign: align } : {}),
            ...style,
        }}
    >
        {children}
    </th>
);

/**
 * Table data cell element (`<td>`).
 *
 * @param props - TableCellProps.
 * @returns Rendered HTML string.
 */
export const TableCell = ({
    children,
    align,
    style,
    className = '',
    colspan,
    rowspan,
}: TableCellProps): string => (
    <td
        colspan={colspan}
        rowspan={rowspan}
        class={className || undefined}
        style={{
            ...(align ? { textAlign: align } : {}),
            ...style,
        }}
    >
        {children}
    </td>
);

/**
 * Table caption element (`<caption>`).
 *
 * @param props - TableSectionProps.
 * @returns Rendered HTML string.
 */
export const TableCaption = ({ children, style, className = '' }: TableSectionProps): string => (
    <caption class={`tg-table-caption ${className}`.trim() || undefined} style={style}>
        {children}
    </caption>
);

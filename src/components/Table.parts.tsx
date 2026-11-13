import { h } from '../jsx';

export interface TableSectionProps {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export interface TableRowProps {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    interactive?: boolean;
    borderBottom?: boolean;
}

export interface TableCellProps {
    children?: unknown;
    align?: 'left' | 'center' | 'right';
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    colspan?: number;
    rowspan?: number;
}

export const TableHeader = ({ children, style, className = '' }: TableSectionProps): string => (
    <thead class={className || undefined} style={style}>
        {children}
    </thead>
);

export const TableBody = ({ children, style, className = '' }: TableSectionProps): string => (
    <tbody class={className || undefined} style={style}>
        {children}
    </tbody>
);

export const TableFooter = ({ children, style, className = '' }: TableSectionProps): string => (
    <tfoot class={`tg-table-footer ${className}`.trim() || undefined} style={style}>
        {children}
    </tfoot>
);

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

export const TableHead = ({ children, align, style, className = '' }: TableCellProps): string => (
    <th
        align={align}
        class={className || undefined}
        style={{
            ...(align ? { textAlign: align } : {}),
            ...style,
        }}
    >
        {children}
    </th>
);

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
        align={align}
        class={className || undefined}
        style={{
            ...(align ? { textAlign: align } : {}),
            ...style,
        }}
    >
        {children}
    </td>
);

export const TableCaption = ({ children, style, className = '' }: TableSectionProps): string => (
    <caption class={`tg-table-caption ${className}`.trim() || undefined} style={style}>
        {children}
    </caption>
);

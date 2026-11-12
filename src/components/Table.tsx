import { h } from '../jsx';

export interface TableProps {
    id?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Таблица данных (Table по образу shadcn/ui) для виджетов Telegram.
 * Поддерживается нативно песочницей Profile 1 со встроенными разделителями ячеек.
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
                borderRadius: 12,
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

export const TableHeader = ({
    children,
    style,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
}): string => (
    <thead
        style={{
            background:
                'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.06))',
            borderBottom:
                '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
            ...style,
        }}
    >
        {children}
    </thead>
);

export const TableBody = ({
    children,
    style,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
}): string => <tbody style={style}>{children}</tbody>;

export const TableFooter = ({
    children,
    style,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
}): string => (
    <tfoot
        style={{
            borderTop:
                '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
            fontWeight: 600,
            background:
                'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.04))',
            ...style,
        }}
    >
        {children}
    </tfoot>
);

export const TableRow = ({
    children,
    style,
    interactive = false,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    interactive?: boolean;
}): string => (
    <tr
        style={{
            borderBottom:
                '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.12))',
            cursor: interactive ? 'pointer' : 'default',
            ...style,
        }}
    >
        {children}
    </tr>
);

export const TableHead = ({
    children,
    align = 'left',
    style,
}: {
    children?: unknown;
    align?: 'left' | 'center' | 'right';
    style?: Record<string, string | number | undefined | null>;
}): string => (
    <th
        style={{
            padding: '8px 10px',
            fontWeight: 600,
            color: 'var(--tg-theme-hint-color, #888888)',
            textAlign: align,
            fontSize: 12,
            ...style,
        }}
    >
        {children}
    </th>
);

export const TableCell = ({
    children,
    align = 'left',
    style,
    colspan,
    rowspan,
}: {
    children?: unknown;
    align?: 'left' | 'center' | 'right';
    style?: Record<string, string | number | undefined | null>;
    colspan?: number;
    rowspan?: number;
}): string => (
    <td
        colspan={colspan}
        rowspan={rowspan}
        style={{
            padding: '8px 10px',
            color: 'var(--tg-theme-text-color, inherit)',
            textAlign: align,
            ...style,
        }}
    >
        {children}
    </td>
);

export const TableCaption = ({
    children,
    style,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
}): string => (
    <caption
        style={{
            padding: '6px 10px',
            fontSize: 11,
            color: 'var(--tg-theme-hint-color, #888888)',
            textAlign: 'center',
            ...style,
        }}
    >
        {children}
    </caption>
);

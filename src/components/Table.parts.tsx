import { h } from '../jsx';

export const TableHeader = ({
    children,
    style,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
}): string => (
    <thead
        style={{
            background: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.06))',
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
        class="tg-table-footer"
        style={{
            borderTop:
                '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
            fontWeight: 600,
            background: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.04))',
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
    borderBottom = true,
}: {
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    interactive?: boolean;
    borderBottom?: boolean;
}): string => (
    <tr
        style={{
            ...(borderBottom
                ? {
                      borderBottom:
                          '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.12))',
                  }
                : { borderBottom: 'none' }),
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
            color: 'var(--tg-theme-text-color, #111827)',
            opacity: 0.7,
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
            fontSize: 11.5,
            color: 'var(--tg-theme-text-color, #111827)',
            opacity: 0.65,
            textAlign: 'center',
            ...style,
        }}
    >
        {children}
    </caption>
);

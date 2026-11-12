import { h } from '../jsx';

export interface DividerProps {
    inset?: number | boolean;
    color?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Divider = ({
    inset = false,
    color = 'rgba(120, 120, 128, 0.14)',
    style,
    className = '',
}: DividerProps): string => {
    const marginLeft = typeof inset === 'number' ? inset : inset ? 16 : 0;
    return (
        <hr
            class={`tg-divider ${className}`}
            style={{
                border: 'none',
                height: 1,
                backgroundColor: color,
                marginLeft,
                marginRight: 0,
                marginTop: 0,
                marginBottom: 0,
                ...style,
            }}
        />
    );
};

export const Separator = Divider;

import { h } from '../jsx';

export interface DividerProps {
    inset?: number | boolean;
    color?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Divider = ({
    inset = false,
    color,
    style,
    className = '',
}: DividerProps): string => {
    const marginLeft = typeof inset === 'number' ? inset : inset ? 16 : 0;
    const customStyle: Record<string, string | number | undefined | null> = {
        ...(marginLeft > 0 ? { marginLeft } : {}),
        ...(color && color !== 'rgba(120, 120, 128, 0.14)'
            ? { backgroundColor: color }
            : {}),
        ...style,
    };

    return (
        <hr
            class={`tg-divider ${className}`.trim()}
            style={
                Object.keys(customStyle).length > 0 ? customStyle : undefined
            }
        />
    );
};

export const Separator = Divider;

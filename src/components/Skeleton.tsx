import { h } from '../jsx';

export interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'rect' | 'circle';
    radius?: number;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Skeleton = ({
    width = '100%',
    height,
    variant = 'rect',
    radius,
    style,
    className = '',
}: SkeletonProps): string => {
    const computedHeight = height ?? (variant === 'text' ? 14 : variant === 'circle' ? width : 40);
    const borderRadius = radius ?? (variant === 'circle' ? '50%' : variant === 'text' ? 4 : 8);

    return (
        <div
            class={`tg-skeleton ${className}`}
            style={{
                width,
                height: computedHeight,
                borderRadius,
                background:
                    'linear-gradient(90deg, rgba(120, 120, 128, 0.08) 25%, rgba(120, 120, 128, 0.16) 50%, rgba(120, 120, 128, 0.08) 75%)',
                backgroundSize: '200% 100%',
                opacity: 0.8,
                ...style,
            }}
        />
    );
};

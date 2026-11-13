import { h } from '../jsx';

/**
 * Props for the Skeleton loading placeholder component.
 */
export interface SkeletonProps {
    /** CSS width (default '100%'). */
    width?: string | number;
    /** CSS height. Defaults based on variant. */
    height?: string | number;
    /** Shape variant: text line, rectangle, or circle. */
    variant?: 'text' | 'rect' | 'circle';
    /** Custom border radius in pixels. */
    radius?: number;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * Animated loading skeleton placeholder.
 *
 * @param props - Skeleton placeholder configuration props.
 * @returns Rendered HTML string.
 */
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

import { h } from '../jsx';

export interface IconProps {
    size?: number;
    color?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const ChevronRightIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <path d="M9 18l6-6-6-6" />
    </svg>
);

export const CheckIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const CloseIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const InfoIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export const WarningIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export const CopyIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

export const StarIcon = ({
    size = 18,
    color = 'currentColor',
    fill = 'none',
    style,
    className = '',
}: IconProps & { fill?: string }): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

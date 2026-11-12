import { h } from '../jsx';

export interface ProgressBarProps {
    percent: number;
    id?: string;
    color?: string;
    trackColor?: string;
    height?: number;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const ProgressBar = ({
    percent,
    id = 'progress-bar',
    color = 'var(--tg-theme-button-color, #2481cc)',
    trackColor = 'rgba(120, 120, 128, 0.16)',
    height = 6,
    style,
    className = '',
}: ProgressBarProps): string => {
    const clamped = Math.max(0, Math.min(100, percent));
    return (
        <div
            class={`tg-progress ${className}`}
            style={{
                width: '100%',
                height,
                background: trackColor,
                borderRadius: Math.round(height / 2),
                overflow: 'hidden',
                ...style,
            }}
        >
            <div
                id={id}
                class="tg-progress-fill"
                style={{
                    height: '100%',
                    width: `${clamped}%`,
                    background: color,
                    borderRadius: Math.round(height / 2),
                    transition: 'width 0.3s ease',
                }}
            />
        </div>
    );
};

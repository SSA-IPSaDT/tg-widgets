import { h } from '../jsx';

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
    /** Progress percentage from 0 to 100. */
    percent: number;
    /** Unique DOM element identifier for the inner fill element. */
    id?: string;
    /** Fill color (CSS color or variable). */
    color?: string;
    /** Background track color. */
    trackColor?: string;
    /** Height in pixels of the progress bar track. */
    height?: number;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * Visual progress bar indicator.
 *
 * @param props - Progress bar configuration props.
 * @returns Rendered HTML string.
 */
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

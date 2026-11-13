import { h } from '../jsx';

/**
 * Item specification for a segmented control tab.
 */
export interface SegmentedControlItem {
    /** Unique identifier for this segment/tab. */
    id: string;
    /** Human-readable label text. */
    label: string;
    /** Optional badge or counter element. */
    badge?: unknown;
}

/**
 * Props for the SegmentedControl component.
 */
export interface SegmentedControlProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Array of segmented control items. */
    items: SegmentedControlItem[];
    /** Identifier of the currently active segment. Defaults to first item. */
    activeId?: string;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * Segmented control (tabs switcher) styled for Telegram Mini Apps / Widgets.
 *
 * @param props - SegmentedControl configuration props.
 * @returns Rendered HTML string.
 */
export const SegmentedControl = ({
    id,
    items,
    activeId,
    style,
    className = '',
}: SegmentedControlProps): string => {
    const selectedId = activeId ?? items[0]?.id;

    return (
        <div id={id} class={`tg-segmented-control ${className}`.trim()} style={style}>
            {items.map((item) => {
                const isActive = item.id === selectedId;
                return (
                    <button
                        type="button"
                        class={`tg-segmented-btn ${isActive ? 'active' : ''}`.trim()}
                        data-tab-target={item.id}
                    >
                        <span>{item.label}</span>
                        {item.badge}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * Alias for SegmentedControl representing a tab bar switcher.
 */
export const Tabs: (props: SegmentedControlProps) => string = SegmentedControl;

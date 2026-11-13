import { h } from '../jsx';

export interface SegmentedControlItem {
    id: string;
    label: string;
    badge?: unknown;
}

export interface SegmentedControlProps {
    id?: string;
    items: SegmentedControlItem[];
    activeId?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

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

export const Tabs = SegmentedControl;

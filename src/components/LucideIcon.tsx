/**
 * Telegram Widgets Lucide SVG Icon Integration.
 *
 * Provides official Lucide icons inlined into compact SVG markup with custom sizing,
 * colors, stroke widths, and styling for Telegram widgets.
 *
 * @module components/LucideIcon
 */

import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Bell,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    CircleCheck,
    Crown,
    Download,
    ExternalLink,
    Flame,
    HelpCircle,
    Info,
    Minus,
    Plus,
    Settings,
    Shield,
    ShoppingBag,
    Sliders,
    Sparkles,
    TriangleAlert,
    Trophy,
    User,
    X,
    Zap,
} from 'lucide-static';
import { formatStyle } from '../jsx';

/**
 * Properties configuring LucideIcon rendering.
 */
export interface LucideIconProps {
    /**
     * Raw SVG markup string from `lucide-static` (e.g. `Info`, `CircleCheck`, `Download`).
     */
    icon: string;
    /**
     * Icon width and height in pixels.
     * @default 18
     */
    size?: number;
    /**
     * Stroke color in hex or CSS color format.
     * @default 'currentColor'
     */
    color?: string;
    /**
     * Stroke line thickness.
     * @default 1.75
     */
    strokeWidth?: number;
    /**
     * Custom CSS class names.
     */
    className?: string;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
}

/**
 * Renders an official Lucide SVG icon with custom sizing, stroke color, and styling.
 * Automatically purges redundant XML namespaces to minimize byte weight.
 *
 * @param props LucideIcon properties.
 * @returns Rendered SVG markup string.
 *
 * @example
 * LucideIcon({ icon: LucideIcons.Flame, size: 16, color: '#2481cc' })
 */
export const LucideIcon = ({
    icon,
    size = 18,
    color = 'currentColor',
    strokeWidth = 1.75,
    className = '',
    style,
}: LucideIconProps): string => {
    if (!icon || typeof icon !== 'string') {
        return '';
    }

    let svg = icon;

    // Purge redundant XML namespaces
    svg = svg.replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');

    // Replace dimensions
    svg = svg.replace(/\bwidth="[0-9]+"/, `width="${size}"`);
    svg = svg.replace(/\bheight="[0-9]+"/, `height="${size}"`);

    // Replace stroke width
    if (strokeWidth !== 2) {
        svg = svg.replace(/\bstroke-width="[0-9.]+"/, `stroke-width="${strokeWidth}"`);
    }

    // Replace color
    if (color !== 'currentColor') {
        svg = svg.replace(/\bstroke="currentColor"/, `stroke="${color}"`);
    }

    // Append class names
    if (className) {
        svg = svg.replace(/\bclass="([^"]*)"/, `class="$1 ${className}"`);
    }

    // Attach inline styles only if explicitly passed
    if (style && Object.keys(style).length > 0) {
        const css = formatStyle(style);
        if (css) {
            svg = svg.replace('<svg', `<svg style="${css}"`);
        }
    }

    // Collapse redundant whitespace and newlines for compact single-line SVG payload
    svg = svg.replace(/\s+/g, ' ').replace(/\s+>/g, '>').replace(/>\s+</g, '><').trim();

    return svg;
};

/**
 * Curated dictionary of commonly used Lucide SVG icon markup strings.
 */
export const LucideIcons: Record<string, string> = {
    Info,
    CircleCheck,
    CheckCircle2,
    TriangleAlert,
    CircleAlert,
    AlertTriangle,
    AlertCircle,
    Flame,
    Sparkles,
    Trophy,
    Crown,
    ShoppingBag,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Settings,
    Sliders,
    Shield,
    Bell,
    User,
    Check,
    X,
    Plus,
    Minus,
    Download,
    BarChart3,
    Zap,
};

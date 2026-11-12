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

export interface LucideIconProps {
    /**
     * Raw SVG markup string from `lucide-static` (e.g. `Info`, `CircleCheck`, `Download`).
     */
    icon: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    style?: Record<string, string | number | undefined | null>;
}

/**
 * Renders an official Lucide SVG icon with custom sizing, stroke color, and styling.
 * Automatically purges redundant XML namespaces to minimize byte weight.
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

    let svg = icon.trim();

    // Strip redundant xmlns attribute for HTML5/QuickJS bubble context
    svg = svg.replace(/\s*xmlns="[^"]*"/g, '');

    // Replace width and height dimensions
    svg = svg.replace(/\bwidth="[^"]*"/, `width="${size}"`);
    svg = svg.replace(/\bheight="[^"]*"/, `height="${size}"`);

    // Override stroke width (1.75 default provides crisp modern aesthetic)
    if (strokeWidth !== undefined) {
        svg = svg.replace(
            /\bstroke-width="[^"]*"/g,
            `stroke-width="${strokeWidth}"`,
        );
    }

    // Replace stroke color if custom value provided
    if (color && color !== 'currentColor') {
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

    return svg;
};

// Export curated set of commonly used Lucide icons
export const LucideIcons = {
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

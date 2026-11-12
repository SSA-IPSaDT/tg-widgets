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
     * SVG строка иконки из `lucide-static` (например, `Info`, `CircleCheck`, `Download`)
     */
    icon: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    style?: Record<string, string | number | undefined | null>;
}

/**
 * Рендерит подлинную SVG-иконку Lucide с кастомизацией размера, цвета и стилей
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

    // Удаляем избыточный XML-namespace для HTML5/WebKit/QuickJS баббла
    svg = svg.replace(/\s*xmlns="[^"]*"/g, '');

    // Заменяем размеры width и height
    svg = svg.replace(/\bwidth="[^"]*"/, `width="${size}"`);
    svg = svg.replace(/\bheight="[^"]*"/, `height="${size}"`);

    // Заменяем толщину штриха (1.75 по умолчанию для аккуратного современного стиля)
    if (strokeWidth !== undefined) {
        svg = svg.replace(
            /\bstroke-width="[^"]*"/g,
            `stroke-width="${strokeWidth}"`,
        );
    }

    // Заменяем stroke цвет, если указан
    if (color && color !== 'currentColor') {
        svg = svg.replace(/\bstroke="currentColor"/, `stroke="${color}"`);
    }

    // Добавляем className
    if (className) {
        svg = svg.replace(/\bclass="([^"]*)"/, `class="$1 ${className}"`);
    }

    // Добавляем инлайн-стили только если переданы пользовательские свойства (дефолты в CSS)
    if (style && Object.keys(style).length > 0) {
        const css = formatStyle(style);
        if (css) {
            svg = svg.replace('<svg', `<svg style="${css}"`);
        }
    }

    return svg;
};

// Экспортируем популярные Lucide иконки для удобного использования в компонентах
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

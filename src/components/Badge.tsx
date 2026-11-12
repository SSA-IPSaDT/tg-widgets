import { h } from "../jsx";

export interface BadgeProps {
    id?: string;
    variant?:
        | "default"
        | "accent"
        | "destructive"
        | "outline"
        | "success"
        | "warning";
    size?: "sm" | "md";
    dot?: boolean;
    pulse?: boolean;
    icon?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const Badge = ({
    id,
    variant = "default",
    size = "sm",
    dot = false,
    pulse = false,
    icon,
    style,
    className = "",
    children,
}: BadgeProps): string => {
    const sizeClass = size === "md" ? "tg-badge-md" : "";
    const isIconOnly = !children;
    const squareDim = size === "md" ? 30 : 26;

    return (
        <span
            id={id}
            class={`tg-badge tg-badge-${variant} ${sizeClass} ${className}`.trim()}
            style={{
                ...(isIconOnly
                    ? {
                          width: squareDim,
                          height: squareDim,
                          minWidth: squareDim,
                          minHeight: squareDim,
                          maxWidth: squareDim,
                          maxHeight: squareDim,
                          aspectRatio: "1 / 1",
                          padding: 2,
                          borderRadius: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxSizing: "border-box",
                      }
                    : {
                          minHeight: size === "md" ? 26 : 22,
                          borderRadius: 7,
                          padding: size === "md" ? "3px 8px" : "2px 7px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                      }),
                ...style,
            }}
        >
            {(dot || (pulse && !icon)) && (
                <span
                    class={pulse ? "tg-badge-pulse" : ""}
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "currentColor",
                        display: "inline-block",
                        flexShrink: 0,
                    }}
                />
            )}
            {icon && (
                <span
                    class={pulse ? "tg-badge-pulse" : ""}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </span>
            )}
            {children}
        </span>
    );
};

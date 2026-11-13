const VOID_TAGS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

const UNITLESS_PROPS = new Set([
    'opacity',
    'zIndex',
    'fontWeight',
    'lineHeight',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
]);

const toKebab = (prop: string): string => prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * Formats a CSS style object into a minified inline CSS string.
 *
 * @param style Style property key-value map.
 * @returns Minified inline CSS string.
 */
export const formatStyle = (style: Record<string, string | number | undefined | null>): string => {
    return Object.entries(style)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => {
            const rawVal = typeof v === 'number' && !UNITLESS_PROPS.has(k) ? `${v}px` : String(v);
            const val = rawVal.replace(/"/g, "'");
            return `${toKebab(k)}:${val}`;
        })
        .join(';');
};

/**
 * JSX factory function for building lightweight HTML strings.
 *
 * @param tag HTML tag name or functional component.
 * @param props Component or element properties.
 * @param children Child elements or text.
 * @returns Rendered HTML string.
 */
export const h = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
    ...children: unknown[]
): string => {
    if (typeof tag === 'function') {
        const rawChildren =
            children.length > 0
                ? children
                : props && 'children' in props && props.children !== undefined
                  ? Array.isArray(props.children)
                      ? props.children
                      : [props.children]
                  : [];
        const flatChildren = rawChildren
            .flat(Infinity)
            .filter((c) => c !== null && c !== undefined && c !== false && c !== '');
        const componentProps = { ...(props ?? {}) };
        if (flatChildren.length > 0) {
            componentProps.children = flatChildren;
        } else {
            delete componentProps.children;
        }
        return tag(componentProps);
    }

    const attrs = props
        ? Object.entries(props)
              .filter(([k, v]) => k !== 'children' && v !== undefined && v !== null)
              .map(([k, v]) => {
                  const attrName = k === 'className' ? 'class' : k;
                  if (typeof v === 'boolean') {
                      return v ? ` ${attrName}` : '';
                  }
                  if (attrName === 'style' && typeof v === 'object' && v !== null) {
                      const css = formatStyle(
                          v as Record<string, string | number | undefined | null>,
                      );
                      return css ? ` style="${css}"` : '';
                  }
                  return ` ${attrName}="${String(v)}"`;
              })
              .join('')
        : '';

    const allChildren =
        children.length > 0 ? children : props && 'children' in props ? [props.children] : [];

    const content = allChildren
        .flat(Infinity)
        .filter((c) => c !== null && c !== undefined && c !== false)
        .join('');

    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrs} />`;
    }

    return `<${tag}${attrs}>${content}</${tag}>`;
};

/**
 * JSX Fragment helper that concatenates children without an extra wrapper element.
 */
export const Fragment = (props: { children?: unknown[] }): string => {
    const children = props.children ?? [];
    return children.flat(Infinity).join('');
};

export const jsx = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
): string => {
    return h(tag, props);
};

export const jsxs = jsx;

export const jsxDEV = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
    ..._rest: unknown[]
): string => jsx(tag, props);

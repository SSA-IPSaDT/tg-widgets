/**
 * Ambient type definitions for JSX runtime.
 * Automatically resolves 'react/jsx-runtime', 'react/jsx-dev-runtime' and 'react'
 * so code editors (VS Code, Cursor, WebStorm) and TypeScript projects do not require
 * @types/react or special JSX pragmas like /** @jsxImportSource ... * / or /** @jsx h * /.
 */

declare module 'react/jsx-runtime' {
    export namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }
    export const Fragment: (props: { children?: unknown }) => string;
    export const jsx: (tag: unknown, props: unknown) => string;
    export const jsxs: (tag: unknown, props: unknown) => string;
    export const jsxDEV: (tag: unknown, props: unknown) => string;
}

declare module 'react/jsx-dev-runtime' {
    export namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }
    export const Fragment: (props: { children?: unknown }) => string;
    export const jsx: (tag: unknown, props: unknown) => string;
    export const jsxs: (tag: unknown, props: unknown) => string;
    export const jsxDEV: (tag: unknown, props: unknown) => string;
}

declare module 'react' {
    export namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }
    export const Fragment: (props: { children?: unknown }) => string;
    export const createElement: (tag: unknown, props: unknown, ...children: unknown[]) => string;
}

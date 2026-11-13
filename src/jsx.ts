declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }
}

export * from './jsx/types';
export * from './jsx/runtime';
export * from './jsx/inspector';

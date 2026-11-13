export namespace JSX {
    export interface IntrinsicElements {
        [elemName: string]: Record<string, unknown>;
    }
    export type Element = string;
}

export * from './jsx/types';
export * from './jsx/runtime';
export * from './jsx/inspector';

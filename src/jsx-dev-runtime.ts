export { Fragment, jsx, jsxDEV, jsxs } from './jsx';

export namespace JSX {
    export interface IntrinsicElements {
        [elemName: string]: Record<string, unknown>;
    }
    export type Element = string;
}


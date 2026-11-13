/**
 * Props for the Script component.
 */
export interface ScriptProps<T extends unknown[]> {
    /** Client function executed in embedded Telegram QuickJS environment. */
    fn: (...args: T) => void;
    /** Arguments serialized and passed into the client function. */
    args?: T;
}

/**
 * Renders a type-safe TypeScript/JavaScript client function as an inline Immediately Invoked Function Expression (IIFE).
 * Executes inside Telegram's embedded QuickJS environment with serialized arguments.
 *
 * @example
 * <Script fn={clientScript} args={[{ count: 0 }]} />
 */
export const Script = <T extends unknown[]>({ fn, args }: ScriptProps<T>): string => {
    const serializedArgs = (args ?? []).map((arg) => JSON.stringify(arg)).join(',');
    const code = `(${fn.toString()})(${serializedArgs});`;
    return `<script>${code}</script>`;
};

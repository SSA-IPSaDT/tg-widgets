export interface ScriptProps<T extends unknown[]> {
    fn: (...args: T) => void;
    args?: T;
}

/**
 * Рендерит типизированную JavaScript/TypeScript функцию как самоисполняемый инлайн-скрипт (IIFE)
 */
export const Script = <T extends unknown[]>({
    fn,
    args,
}: ScriptProps<T>): string => {
    const serializedArgs = (args ?? [])
        .map((arg) => JSON.stringify(arg))
        .join(',');
    const code = `(${fn.toString()})(${serializedArgs});`;
    return `<script>${code}</script>`;
};

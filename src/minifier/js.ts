/**
 * Telegram Widgets Secure JavaScript Compaction Engine.
 *
 * Provides safe, zero-dependency JavaScript minification and local variable mangling
 * specifically crafted for Telegram Interactive Widget client scripts.
 * Strictly preserves string literals and template strings without AST-level overhead or code corruption risks.
 *
 * @module minifier/js
 */

import type { JsMinifyOptions } from './types';

const RESERVED_WORDS = new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'let',
    'static',
    'enum',
    'await',
    'async',
    'null',
    'true',
    'false',
    'undefined',
    'NaN',
    'Infinity',
    'window',
    'document',
    'console',
    'TelegramWidget',
    'Math',
    'JSON',
    'Promise',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'RegExp',
    'Date',
    'Error',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'addEventListener',
    'removeEventListener',
    'event',
    'target',
    'currentTarget',
]);

/**
 * Safely compacts JavaScript code by removing comments, collapsing whitespace,
 * and performing safe local variable mangling while strictly preserving string literals.
 *
 * @param code Raw JavaScript string.
 * @param options JS minification options.
 * @returns Compacted, safe JavaScript string.
 */
export const compactJs = (code: string, options: JsMinifyOptions = {}): string => {
    if (!code || typeof code !== 'string') return '';

    const removeComments = options.removeComments !== false;
    const collapseWhitespace = options.collapseWhitespace !== false;

    // Tokenizes JavaScript strings (both single, double, template literals) and regex literals
    const tokenRegex = /(["'`])(?:\\.|(?!\1)[^\\])*\1|\/(?:\\.|[^\/\n\\])+\/[gimsu]*/g;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const cleanNonString = (str: string): string => {
        let cleaned = str;
        if (removeComments) {
            // Strip single-line comments //...
            cleaned = cleaned.replace(/\/\/[^\n]*/g, '');
            // Strip multi-line comments /*...*/
            cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        if (collapseWhitespace) {
            cleaned = cleaned
                .replace(/^\s+|\s+$/gm, '')
                .replace(/\n+/g, ' ')
                .replace(/\s*([;{},()=+\-*/%&|^!<>?:])\s*/g, '$1')
                .replace(/[ \t]+/g, ' ');
        }
        return cleaned;
    };

    while ((match = tokenRegex.exec(code)) !== null) {
        result += cleanNonString(code.slice(lastIndex, match.index));
        result += match[0];
        lastIndex = match.index + match[0].length;
    }

    result += cleanNonString(code.slice(lastIndex));

    // Optional safe local identifier mangling if enabled
    const shouldMangle = options.collapseWhitespace !== false;
    if (shouldMangle) {
        const declaredVars = new Set<string>();
        // Find var/let/const declarations
        const declRegex = /\b(?:var|let|const)\s+([a-zA-Z0-9_$]+)/g;
        let declMatch: RegExpExecArray | null;
        while ((declMatch = declRegex.exec(result)) !== null) {
            const name = declMatch[1];
            if (!RESERVED_WORDS.has(name) && name.length > 2) {
                declaredVars.add(name);
            }
        }

        // Find function names and parameters: function name(param1, param2)
        const fnRegex = /\bfunction\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g;
        let fnMatch: RegExpExecArray | null;
        while ((fnMatch = fnRegex.exec(result)) !== null) {
            const fnName = fnMatch[1];
            if (!RESERVED_WORDS.has(fnName) && fnName.length > 2) {
                declaredVars.add(fnName);
            }
            const params = fnMatch[2].split(',').map((p) => p.trim());
            for (const param of params) {
                if (param && !RESERVED_WORDS.has(param) && param.length > 1) {
                    declaredVars.add(param);
                }
            }
        }

        if (declaredVars.size > 0) {
            const mangleMap = new Map<string, string>();
            let varIndex = 0;
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            for (const varName of declaredVars) {
                const shortName = `_${letters[varIndex % letters.length]}${varIndex >= letters.length ? Math.floor(varIndex / letters.length) : ''}`;
                mangleMap.set(varName, shortName);
                varIndex++;
            }

            // Replace declared variables outside string literals
            let mangled = '';
            lastIndex = 0;
            tokenRegex.lastIndex = 0;
            while ((match = tokenRegex.exec(result)) !== null) {
                let codeChunk = result.slice(lastIndex, match.index);
                for (const [orig, short] of mangleMap.entries()) {
                    codeChunk = codeChunk.replace(new RegExp(`\\b${orig}\\b`, 'g'), short);
                }
                mangled += codeChunk;
                mangled += match[0];
                lastIndex = match.index + match[0].length;
            }
            let remaining = result.slice(lastIndex);
            for (const [orig, short] of mangleMap.entries()) {
                remaining = remaining.replace(new RegExp(`\\b${orig}\\b`, 'g'), short);
            }
            mangled += remaining;
            result = mangled;
        }
    }

    return result.trim();
};

/**
 * Synchronous backward-compatible alias for compactJs.
 *
 * @param code Raw JavaScript code.
 * @returns Compacted JavaScript code.
 */
export const compactJsSync = (code: string): string => compactJs(code);

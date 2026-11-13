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

const RESERVED_WORDS: Set<string> = new Set(
    'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield,let,static,enum,await,async,null,true,false,undefined,NaN,Infinity,window,document,console,TelegramWidget,Math,JSON,Promise,Array,Object,String,Number,Boolean,RegExp,Date,Error,setTimeout,setInterval,clearTimeout,clearInterval,addEventListener,removeEventListener,event,target,currentTarget,HTML,CSS,SVG,Element,Node'.split(
        ',',
    ),
);

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

    // Tokenizes JavaScript strings and regex literals (excluding /* and // comments)
    const tokenRegex = /(["'`])(?:\\.|(?!\1)[^\\])*\1|\/(?![/*])(?:\\.|[^\/\n\\])+\/[gimsu]*/g;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const cleanNonString = (str: string): string => {
        let cleaned = str;
        if (removeComments) {
            cleaned = cleaned.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
        }

        if (collapseWhitespace) {
            cleaned = cleaned
                .replace(/^\s+|\s+$/gm, '')
                .replace(/\n+/g, ' ')
                .replace(/\s*([;{},()=+\-*/%&|^!<>?:[\]])\s*/g, '$1')
                .replace(/[ \t]+/g, ' ')
                .replace(/;+/g, ';')
                .replace(/;}/g, '}')
                .replace(/:\s*true\b/g, ':!0')
                .replace(/=\s*true\b/g, '=!0')
                .replace(/\(\s*true\b/g, '(!0')
                .replace(/,\s*true\b/g, ',!0')
                .replace(/:\s*false\b/g, ':!1')
                .replace(/=\s*false\b/g, '=!1')
                .replace(/\(\s*false\b/g, '(!1')
                .replace(/,\s*false\b/g, ',!1');
        }
        return cleaned;
    };

    while ((match = tokenRegex.exec(code)) !== null) {
        result += cleanNonString(code.slice(lastIndex, match.index));
        result += match[0];
        lastIndex = match.index + match[0].length;
    }
    result += cleanNonString(code.slice(lastIndex));

    if (collapseWhitespace) {
        // Protect identifiers interpolated in template literals from renaming
        const protectedIdents = new Set<string>();
        for (const tm of result.matchAll(/\$\{([^}]+)\}/g)) {
            const ids = tm[1].matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
            for (const id of ids) {
                protectedIdents.add(id[1]);
            }
        }

        const declared = new Set<string>();
        const declBlocks = result.matchAll(/\b(?:var|let|const)\s+([^;]+?)(?=[;}\n]|$)/g);
        for (const b of declBlocks) {
            const idMatches = b[1].matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?:\s*[,=:\)\}\]]|$)/g);
            for (const m of idMatches) {
                if (!RESERVED_WORDS.has(m[1]) && !protectedIdents.has(m[1]) && m[1].length > 1) {
                    declared.add(m[1]);
                }
            }
        }
        const arrowMatches = result.matchAll(/(?:\(([^)]*)\)|([a-zA-Z_$][a-zA-Z0-9_$]*))\s*=>/g);
        for (const m of arrowMatches) {
            const params = (m[1] || m[2] || '').split(',');
            for (const p of params) {
                const clean = p
                    .trim()
                    .replace(/^\(+/, '')
                    .match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)?.[0];
                if (
                    clean &&
                    !RESERVED_WORDS.has(clean) &&
                    !protectedIdents.has(clean) &&
                    clean.length > 1
                ) {
                    declared.add(clean);
                }
            }
        }
        const fnMatches = result.matchAll(/\bfunction\s*([a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g);
        for (const m of fnMatches) {
            if (
                m[1] &&
                !RESERVED_WORDS.has(m[1]) &&
                !protectedIdents.has(m[1]) &&
                m[1].length > 1
            ) {
                declared.add(m[1]);
            }
            const params = m[2].split(',');
            for (const p of params) {
                const clean = p
                    .trim()
                    .replace(/^\(+/, '')
                    .match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)?.[0];
                if (
                    clean &&
                    !RESERVED_WORDS.has(clean) &&
                    !protectedIdents.has(clean) &&
                    clean.length > 1
                ) {
                    declared.add(clean);
                }
            }
        }

        if (declared.size > 0) {
            const mangleMap = new Map<string, string>();
            let idx = 0;
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            for (const v of declared) {
                const short = `_${letters[idx % letters.length]}${idx >= letters.length ? Math.floor(idx / letters.length) : ''}`;
                mangleMap.set(v, short);
                idx++;
            }

            let mangled = '';
            lastIndex = 0;
            tokenRegex.lastIndex = 0;
            while ((match = tokenRegex.exec(result)) !== null) {
                let chunk = result.slice(lastIndex, match.index);
                for (const [orig, short] of mangleMap.entries()) {
                    chunk = chunk.replace(
                        new RegExp(`(?<!(?<!\\.\\.)\\.)(?<![a-zA-Z0-9_$])${orig}\\b`, 'g'),
                        short,
                    );
                }
                mangled += chunk;
                mangled += match[0];
                lastIndex = match.index + match[0].length;
            }
            let remaining = result.slice(lastIndex);
            for (const [orig, short] of mangleMap.entries()) {
                remaining = remaining.replace(
                    new RegExp(`(?<!(?<!\\.\\.)\\.)(?<![a-zA-Z0-9_$])${orig}\\b`, 'g'),
                    short,
                );
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

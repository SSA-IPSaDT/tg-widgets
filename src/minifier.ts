/**
 * Модуль агрессивной минификации HTML и CSS для виджетов Telegram (Profile 1).
 * Сокращает размер разметки до минимального количества байт для укладывания в лимит 4096 байт zlib deflate.
 */

/**
 * Минифицирует inline CSS из атрибута style="..."
 */
export const minifyInlineStyle = (styleStr: string): string => {
    return styleStr
        // Убираем комментарии
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Убираем пробелы вокруг разделителей
        .replace(/\s*([:;(),{}])\s*/g, '$1')
        // Убираем 0px -> 0, 0em -> 0, 0rem -> 0, 0% -> 0
        .replace(/\b0(?:px|em|rem|%)\b/g, '0')
        // Сокращаем цвета #ffffff -> #fff, #000000 -> #000
        .replace(
            /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g,
            '#$1$2$3',
        )
        // Убираем завершающую точку с запятой
        .replace(/;+$/g, '')
        .trim();
};

/**
 * Минифицирует содержимое тега <style>...</style>
 */
export const minifyCssBlock = (css: string): string => {
    return css
        // Убираем CSS комментарии
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Схлопываем множественные пробелы и переносы строк
        .replace(/\s+/g, ' ')
        // Убираем пробелы вокруг синтаксических символов
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Убираем последнюю точку с запятой перед закрывающей скобкой правила
        .replace(/;}/g, '}')
        // Убираем 0px -> 0
        .replace(/\b0(?:px|em|rem|%)\b/g, '0')
        // Сокращаем 6-значные hex цвета до 3-значных
        .replace(
            /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g,
            '#$1$2$3',
        )
        .trim();
};

/**
 * Полная минификация HTML-документа или фрагмента виджета Telegram
 */
export const minifyHtml = (html: string): string => {
    // 1. Убираем HTML-комментарии (кроме условных тегов, если такие есть)
    let result = html.replace(/<!--[\s\S]*?-->/g, '');

    // 2. Минифицируем содержимое блоков <style>...</style>
    result = result.replace(
        /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
        (_, attrs, cssContent) => {
            const minifiedCss = minifyCssBlock(cssContent);
            return `<style${attrs}>${minifiedCss}</style>`;
        },
    );

    // 3. Минифицируем атрибуты style="..."
    result = result.replace(/style="([^"]*)"/gi, (_, styleVal) => {
        const minifiedStyle = minifyInlineStyle(styleVal);
        return minifiedStyle ? `style="${minifiedStyle}"` : '';
    });

    // 4. Схлопываем пробелы между закрывающим и открывающим тегами
    result = result.replace(/>\s+</g, '><');

    // 5. Убираем пробелы в начале и конце строк
    result = result.replace(/^\s+|\s+$/gm, '');

    // 6. Схлопываем множественные пробелы внутри текста до одного
    result = result.replace(/[ \t]+/g, ' ');

    return result.trim();
};

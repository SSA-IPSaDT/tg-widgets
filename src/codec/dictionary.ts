/**
 * Default dictionary of common widget field abbreviations for Bot API 10.4.
 */
export const DEFAULT_KEY_MAP: Record<string, string> = {
    // Protocol core & navigation
    action: 'a',
    payload: 'p',
    type: 't',
    screen: 's',
    id: 'i',
    value: 'v',
    data: 'd',
    state: 'z',
    key: 'k',
    error: 'E',
    status: 'y',
    message: 'M',
    text: 'x',
    timestamp: 'T',
    name: 'n',
    username: 'u',

    // UI settings and form controls
    notifications: 'o',
    soundEffects: 'e',
    privateMode: 'm',
    newsletter: 'w',
    plan: 'l',
    tickets: 'k',
    setting: 'g',
    enabled: 'b',
    active: 'A',
    count: 'c',
    step: 'S',
    min: 'N',
    max: 'X',
    checked: 'C',
    selected: 'K',
    votes: 'V',
    userVote: 'U',

    // E-commerce & financial
    quantity: 'q',
    price: 'P',
    size: 'Z',
    total: 'R',
    items: 'I',
    cart: 'C',
    currency: 'Y',
    address: 'D',

    // System screen identifier
    __screen: '_s',
};

/**
 * Reverse dictionary for recovering original property names.
 */
export const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(DEFAULT_KEY_MAP).map(([k, v]) => [v, k]),
);

/**
 * Lightweight client script snippet (< 300 B) for embedding into inline `<script>`,
 * providing client-side QuickJS code with transparent state compression helpers.
 */
export const CLIENT_CODEC_SNIPPET =
    'var __KM=' +
    JSON.stringify(DEFAULT_KEY_MAP) +
    ';var __RM=Object.fromEntries(Object.entries(__KM).map(([k,v])=>[v,k]));' +
    'window.packState=function(o){return JSON.stringify(Object.fromEntries(Object.entries(o).map(([k,v])=>[__KM[k]||k,v])));};' +
    'window.unpackState=function(s){var o=typeof s==="string"?JSON.parse(s):s;return Object.fromEntries(Object.entries(o).map(([k,v])=>[__RM[k]||k,v]));};';

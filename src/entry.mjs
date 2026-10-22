export const DIGITS = '0123456789';
export const CODES = DIGITS + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NETWORK_TEXT = DIGITS + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-_/:|, ';
export function newEntry(kind, label, max = 10, initial = '', alphabet = CODES) {
    return { kind, label, max, buffer: String(initial), cursor: 0, alphabet };
}
export function changeDigit(entry, direction) {
    const chars = entry.buffer.padEnd(entry.cursor + 1, '_').split('');
    const at = entry.alphabet.indexOf(chars[entry.cursor]);
    chars[entry.cursor] = at < 0
        ? (direction > 0 ? '0' : '9')
        : entry.alphabet[(at + direction + entry.alphabet.length) % entry.alphabet.length];
    entry.buffer = chars.join('');
}
export function nextDigit(entry) {
    if (!entry.buffer || entry.buffer[entry.cursor] === '_')
        return;
    if (entry.cursor < entry.max - 1) {
        entry.cursor++;
        entry.buffer = entry.buffer.padEnd(entry.cursor + 1, '_');
    }
}
export function typeCharacter(entry, character) {
    if (!entry.alphabet.includes(character)) {
        character = character.toUpperCase();
        if (!entry.alphabet.includes(character))
            return;
    }
    const chars = entry.buffer.padEnd(entry.cursor + 1, '_').split('');
    chars[entry.cursor] = character;
    entry.buffer = chars.join('');
    entry.cursor = Math.min(entry.max - 1, entry.cursor + 1);
}
export function enteredValue(entry) {
    return entry.buffer.replace(/_+$/, '').replace(/_/g, '0');
}

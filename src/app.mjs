import { DG3 } from './engine.mjs';
import { Keypad } from './keypad.mjs';
import { drawLED, drawOLED } from './pixels.mjs';
const $ = selector => document.querySelector(selector);
const storageKey = 'hanover-dg3-simulator-v1';
let saved;
try {
    saved = JSON.parse(localStorage.getItem(storageKey));
}
catch { }
let dg3;
try {
    dg3 = new DG3(saved);
}
catch {
    dg3 = new DG3();
}
const keypad = new Keypad(dg3);
let lastTranscript = '';
function persist() {
    if (dg3.draft)
        return;
    try {
        localStorage.setItem(storageKey, JSON.stringify(dg3.snapshot()));
    }
    catch { }
}
function press(key) { keypad.press(key); update(); }
function release(key) { keypad.release(key); persist(); update(); }
for (const button of document.querySelectorAll('[data-key]')) {
    const key = button.dataset.key;
    button.addEventListener('pointerdown', event => {
        event.preventDefault();
        button.focus();
        button.setPointerCapture(event.pointerId);
        press(key);
    });
    button.addEventListener('pointerup', () => release(key));
    button.addEventListener('pointercancel', () => { keypad.cancel(); update(); });
    button.addEventListener('click', event => {
        if (event.detail === 0) {
            press(key);
            release(key);
        }
    });
}
const keys = { Enter: 'fe', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down' };
window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey)
        return;
    if (keys[event.key]) {
        event.preventDefault();
        if (!event.repeat)
            press(keys[event.key]);
    }
    else if (event.key === 'Escape') {
        if (dg3.mode === 'entry') {
            if (['settingText', 'settingCode'].includes(dg3.entry.kind))
                dg3.returnSettings();
            else {
                dg3.mode = 'normal';
                dg3.entry = null;
            }
        }
        else
            dg3.key('left');
        update();
    }
    else if (/^[a-z0-9. _/:|,-]$/i.test(event.key) && dg3.mode === 'entry') {
        event.preventDefault();
        dg3.typeDigit(event.key);
        update();
    }
    else if (event.key.toLowerCase() === 'p' && !event.repeat) {
        keypad.power();
        persist();
        update();
    }
});
window.addEventListener('keyup', event => { if (keys[event.key])
    release(keys[event.key]); });
window.addEventListener('blur', () => { keypad.cancel(); update(); });
function update() {
    const now = Date.now();
    keypad.advance();
    dg3.tick(now);
    for (const button of document.querySelectorAll('[data-key]'))
        button.classList.toggle('pressed', keypad.held.has(button.dataset.key));
    const screen = dg3.displayText(now);
    const route = dg3.config.RN || dg3.config.RB ? dg3.route : dg3.current()?.route;
    if (dg3.mode === 'normal' && route && screen.lines[0]?.startsWith(route + ' ')) {
        screen.routeText = route;
        screen.messageLines = [screen.lines[0].slice(route.length + 1), ...screen.lines.slice(1)];
    }
    drawOLED($('#oled'), screen, now - dg3.lastInteraction > 7000, now, { background: '#30313d', foreground: '#ffe535', dim: '#e5cc30', inactive: '#c8b333' });
    $('#oled').dataset.selected = screen.highlight === undefined ? '' : screen.lines[screen.highlight];
    const transcript = [...screen.lines.map((line, index) => screen.highlight === index ? 'Selected: ' + line : line), screen.footer].filter(Boolean).join(' · ');
    if (transcript !== lastTranscript) {
        $('#controller-transcript').textContent = transcript;
        $('#oled').setAttribute('aria-label', transcript || 'Controller powered off');
        lastTranscript = transcript;
    }
    for (const [side, width, height] of [['front', 160, 24], ['side', 96, 16], ['rear', 32, 16]]) {
        const content = dg3.signContent(side, now);
        const blanking = dg3.blankAt !== null && dg3.blankAt !== undefined && now < dg3.blankAt;
        const brightness = blanking && Number(dg3.config.BL) > 0 ? Math.max(1, 85 * (100 - Number(dg3.config.BL)) / 100) : 85;
        drawLED($('#' + side), width, height, content, brightness, now, dg3.mode === 'test' ? dg3.testStart : dg3.selectionAt);
        $('#' + side).setAttribute('aria-label', side + ' display: ' + (content.test ? 'test pattern' : [content.route, ...content.lines].filter(Boolean).join(' ') || 'blank'));
    }
}
dg3.reboot();
update();
setInterval(update, 50);
setInterval(persist, 1000);
window.addEventListener('beforeunload', persist);

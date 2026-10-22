const patterns = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'], C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'], G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], I: ['111', '010', '010', '010', '010', '010', '111'], J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'], K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'], M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'], Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'], S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'], U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'], W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'], Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['010', '110', '010', '010', '010', '010', '111'], '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'], '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'], '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'], '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    ' ': ['000', '000', '000', '000', '000', '000', '000'], ':': ['0', '1', '1', '0', '1', '1', '0'], '.': ['0', '0', '0', '0', '0', '1', '1'], ',': ['00', '00', '00', '00', '01', '01', '10'], '-': ['000', '000', '000', '111', '000', '000', '000'], '_': ['00000', '00000', '00000', '00000', '00000', '00000', '11111'], '/': ['00001', '00001', '00010', '00100', '01000', '10000', '10000'], '\\': ['10000', '10000', '01000', '00100', '00010', '00001', '00001'], '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'], '!': ['1', '1', '1', '1', '1', '0', '1'], '*': ['00000', '10101', '01110', '11111', '01110', '10101', '00000'], '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'], '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'], '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'], '(': ['01', '10', '10', '10', '10', '10', '01'], ')': ['10', '01', '01', '01', '01', '01', '10'], '[': ['11', '10', '10', '10', '10', '10', '11'], ']': ['11', '01', '01', '01', '01', '01', '11'], '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'], '>': ['100', '010', '001', '000', '001', '010', '100'], "'": ['1', '1', '0', '0', '0', '0', '0'], '~': ['00000', '00000', '01001', '10110', '00000', '00000', '00000'],
};
export function glyphs(text) { return [...String(text).toUpperCase()].map(c => patterns[c] || patterns['?']); }
export function textWidth(text) { return glyphs(text).reduce((n, g) => n + g[0].length + 1, 0) - 1; }
export function putText(matrix, w, h, text, box, { stretch = false, scroll = 0 } = {}) {
    if (!text)
        return;
    const chars = glyphs(text);
    const tw = Math.max(1, textWidth(text));
    const [bx, by, bw, bh] = box;
    const sy = Math.max(1, Math.floor(bh / 7));
    const sx = stretch ? Math.min(sy, bw / tw) : Math.min(sy, Math.max(1, Math.floor(bw / tw)));
    const dw = Math.min(bw, Math.ceil(tw * sx));
    const dh = Math.min(bh, 7 * sy);
    const startX = bx + Math.floor((bw - dw) / 2);
    const startY = by + Math.floor((bh - dh) / 2);
    const source = new Uint8Array(tw * 7);
    let offset = 0;
    for (const g of chars) {
        for (let y = 0; y < 7; y++)
            for (let x = 0; x < g[0].length; x++)
                source[y * tw + offset + x] = g[y][x] === '1' ? 1 : 0;
        offset += g[0].length + 1;
    }
    for (let y = 0; y < dh; y++)
        for (let x = 0; x < dw; x++) {
            const tx = Math.floor(x / sx) + scroll;
            const xx = startX + x, yy = startY + y;
            if (xx >= 0 && xx < w && yy >= 0 && yy < h && tx >= 0 && tx < tw)
                matrix[yy * w + xx] = source[Math.floor(y / sy) * tw + tx];
        }
}
export function signMatrix(w, h, content, now = Date.now(), origin = 0) {
    const m = new Uint8Array(w * h);
    if (content.test) {
        if (content.address) {
            putText(m, w, h, '#' + content.index, [0, 0, w, h], { stretch: true });
            return m;
        }
        const phase = Math.floor((now - origin) / 1500) % 4;
        if (phase === 0) {
            putText(m, w, h, `#${content.index} ${w} X ${h}`, [0, 0, w, h], { stretch: true });
        }
        else
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++)
                    m[y * w + x] = phase === 1 ? (y % 2 === 0 ? 1 : 0) : phase === 2 ? (x % 2 === 0 ? 1 : 0) : (x + y) % 2;
        return m;
    }
    const { route = '', lines = [] } = content;
    if (w <= 40) {
        if (lines.length) {
            lines.slice(0, 2).forEach((line, i) => putText(m, w, h, line, [0, i * 8, w, 7], { stretch: true }));
        }
        else
            putText(m, w, h, route, [1, 1, w - 2, h - 2], { stretch: true });
        return m;
    }
    const routeWidth = route ? Math.min(Math.ceil(w * .28), Math.ceil(textWidth(route) * (h >= 24 ? 2 : 1)) + 2) : 0;
    if (route)
        putText(m, w, h, route, [0, 1, routeWidth, h - 2], { stretch: true });
    const x = routeWidth + (route ? 3 : 0), width = w - x - 1;
    if (lines.length < 2) {
        const line = lines[0] || '';
        const overflow = textWidth(line) > width;
        putText(m, w, h, line, [x, 1, width, h - 2], { stretch: !overflow, scroll: overflow ? Math.max(0, Math.floor((now - origin) / 110) % (textWidth(line) + width) - width) : 0 });
    }
    else
        lines.slice(0, 2).forEach((line, i) => { const overflow = textWidth(line) > width; putText(m, w, h, line, [x, i * Math.floor(h / 2) + (h >= 24 ? 1 : 0), width, Math.floor(h / 2) - (h >= 24 ? 2 : 1)], { scroll: overflow ? Math.max(0, Math.floor((now - origin) / 120) % (textWidth(line) + width) - width) : 0 }); });
    return m;
}
export function drawLED(canvas, w, h, content, brightness = 85, now = Date.now(), origin = 0) {
    const pitch = 6;
    const cw = w * pitch, ch = h * pitch;
    if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090b08';
    ctx.fillRect(0, 0, cw, ch);
    const matrix = signMatrix(w, h, content, now, origin);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const on = matrix[y * w + x];
            ctx.beginPath();
            ctx.arc(x * pitch + pitch / 2, y * pitch + pitch / 2, on ? 2.05 : 1.65, 0, Math.PI * 2);
            ctx.fillStyle = on ? `rgba(255,176,43,${Math.max(.08, brightness / 100)})` : '#1c1c10';
            ctx.fill();
            if (on) {
                ctx.beginPath();
                ctx.arc(x * pitch + 2.6, y * pitch + 2.4, .65, 0, Math.PI * 2);
                ctx.fillStyle = '#ffdb7c';
                ctx.fill();
            }
        }
}
export function drawOLED(canvas, screen, dim = false, now = Date.now(), palette = {}) {
    if (canvas.width !== 768) {
        canvas.width = 768;
        canvas.height = 192;
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = palette.background || '#080b08';
    ctx.fillRect(0, 0, 768, 192);
    const m = new Uint8Array(256 * 64);
    if (screen.entry) {
        const e = screen.entry;
        if (e.multiline) {
            putText(m, 256, 64, e.label, [4, 1, 248, 17], { stretch: true });
            const offset = Math.max(0, e.cursor - 37);
            let x = 4;
            for (const glyph of glyphs(e.value.slice(offset, offset + 40))) {
                for (let y = 0; y < 7; y++)
                    for (let gx = 0; gx < glyph[0].length; gx++)
                        if (glyph[y][gx] === '1')
                            for (let sy = 0; sy < 2; sy++)
                                if (x + gx < 256)
                                    m[(30 + y * 2 + sy) * 256 + x + gx] = 1;
                x += glyph[0].length + 1;
            }
            if (Math.floor(now / 450) % 2 === 0) {
                const start = 4 + textWidth(e.value.slice(offset, e.cursor)) + 1;
                for (let xx = start; xx < Math.min(256, start + 5); xx++)
                    m[48 * 256 + xx] = 1;
            }
        }
        else {
            const label = e.label + ' ';
            const scale = textWidth(label + e.value) > 124 ? 1 : 2;
            let x = 4;
            for (const glyph of glyphs(label + e.value)) {
                for (let y = 0; y < 7; y++)
                    for (let gx = 0; gx < glyph[0].length; gx++)
                        if (glyph[y][gx] === '1')
                            for (let sy = 0; sy < 2; sy++)
                                for (let sx = 0; sx < scale; sx++)
                                    if (x + gx * scale + sx < 256)
                                        m[(5 + y * 2 + sy) * 256 + x + gx * scale + sx] = 1;
                x += (glyph[0].length + 1) * scale;
            }
            putText(m, 256, 64, String(e.previous).split('').join(' '), [4, 35, 245, 24], { stretch: true });
            if (Math.floor(now / 450) % 2 === 0) {
                const prefix = label + e.value.slice(0, e.cursor);
                const start = 4 + (textWidth(prefix) + 1) * scale;
                const end = Math.min(255, start + 5 * scale);
                for (let xx = start; xx < end; xx++)
                    m[22 * 256 + xx] = 1;
            }
        }
    }
    else if (screen.field) {
        const field = screen.field;
        putText(m, 256, 64, screen.lines[0], [4, 1, 248, 17], { stretch: true });
        let text = field.text;
        if (Math.floor(now / 450) % 2 === 0)
            text = text.slice(0, field.start) + ' '.repeat(field.length) + text.slice(field.start + field.length);
        putText(m, 256, 64, text, [4, 26, 248, 30], { stretch: true });
    }
    else if (screen.routeText) {
        putText(m, 256, 64, screen.routeText, [2, 1, 68, 36], { stretch: true });
        const lines = screen.messageLines || [];
        if (lines.length === 1)
            putText(m, 256, 64, lines[0], [72, 2, 180, 32], { stretch: true });
        else
            lines.slice(0, 2).forEach((line, i) => putText(m, 256, 64, line, [72, 2 + i * 18, 180, 17], { stretch: true }));
    }
    else
        screen.lines.forEach((line, i) => {
            const str = String(line);
            const tw = textWidth(str);
            const maxChars = 42;
            const clipped = tw > 250 ? str.slice(0, maxChars) : str;
            let y = 3 + i * 19;
            const gs = glyphs(clipped);
            let x = 3;
            for (const g of gs) {
                for (let gy = 0; gy < 7; gy++)
                    for (let gx = 0; gx < g[0].length; gx++)
                        if (g[gy][gx] === '1') {
                            for (let yy = 0; yy < 2; yy++)
                                if (y + gy * 2 + yy < 64 && x + gx < 256)
                                    m[(y + gy * 2 + yy) * 256 + x + gx] = 1;
                        }
                x += g[0].length + 1;
            }
            if (screen.highlight !== undefined && screen.highlight !== i) {
                for (let yy = y; yy < Math.min(64, y + 14); yy++)
                    for (let xx = 0; xx < 256; xx++)
                        if (m[yy * 256 + xx])
                            m[yy * 256 + xx] = 2;
            }
        });
    if (screen.footer && screen.routeText) {
        const parts = screen.footer.trim().split(/\s+/);
        putText(m, 256, 64, parts.slice(0, 2).join(' ') + (parts.includes('*') ? ' *' : ''), [2, 45, 90, 17], { stretch: true });
        putText(m, 256, 64, parts.at(-1), [163, 45, 90, 17], { stretch: true });
    }
    else if (screen.footer) {
        const gs = glyphs(screen.footer);
        let x = 3;
        for (const g of gs) {
            for (let gy = 0; gy < 7; gy++)
                for (let gx = 0; gx < g[0].length; gx++)
                    if (g[gy][gx] === '1' && x + gx < 256)
                        m[(54 + gy) * 256 + x + gx] = 1;
            x += g[0].length + 1;
        }
    }
    if (screen.cursor !== undefined && Math.floor(now / 450) % 2 === 0) {
        const x = 3 + Math.min(40, screen.cursor) * 6;
        for (let xx = x; xx < x + 5; xx++)
            m[37 * 256 + xx] = 1;
    }
    for (let y = 0; y < 64; y++)
        for (let x = 0; x < 256; x++)
            if (m[y * 256 + x]) {
                ctx.fillStyle = m[y * 256 + x] === 2 ? (palette.inactive || '#87834c') : dim ? (palette.dim || '#a8a260') : (palette.foreground || '#eee9a6');
                ctx.fillRect(x * 3, y * 3, 2.6, 2.6);
            }
}

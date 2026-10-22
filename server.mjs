import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3303);
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
    try {
        const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
        if (!file.startsWith(root + sep) || !['.html', '.mjs', '.js', '.css', '.json', '.svg', '.png'].includes(extname(file)) || path.includes('node_modules')) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': (types[extname(file)] || 'text/plain') + '; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        res.end(req.method === 'HEAD' ? undefined : data);
    }
    catch {
        res.writeHead(404);
        res.end('Not found');
    }
});
server.listen(port, '127.0.0.1', () => console.log(`DG3 simulator ready: http://localhost:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });

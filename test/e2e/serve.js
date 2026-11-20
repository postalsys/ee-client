// A minimal static server for the e2e harness page and index.js, on the loopback interface only.
// Serves files from the repository root; anything outside it, or not a plain file, is a 404.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };

export function serve(port, host = '127.0.0.1') {
    const server = createServer(async (req, res) => {
        try {
            const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
            const file = normalize(join(ROOT, pathname));
            if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep) || file.includes(`${sep}node_modules${sep}`) || !(await stat(file)).isFile()) {
                throw new Error('not found');
            }
            res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
            res.end(await readFile(file));
        } catch {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
        }
    });
    return new Promise(resolve => server.listen(port, host, () => resolve(server)));
}

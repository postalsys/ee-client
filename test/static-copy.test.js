// EmailEngine does not require() this package. copy-static-files.sh copies index.js on its own into
// static/js/ee-client.js and the message browser page loads it with
// `import { EmailEngineClient } from '/static/js/ee-client.js'` in a <script type="module">, so the
// pkg binary only ever serves it as a static file. This checks that use: the file, copied alone
// with no package.json or node_modules next to it, still loads as an ES module and exports the API.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const source = new URL('../index.js', import.meta.url);

describe('static copy loaded by EmailEngine', () => {
    let dir;

    before(() => {
        dir = mkdtempSync(join(tmpdir(), 'ee-client-static-'));
    });

    after(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it('has no static imports, so the lone copy needs nothing beside it', () => {
        const code = readFileSync(source, 'utf8');
        assert.doesNotMatch(code, /^\s*import\s*[\w{*'"]/m);
        assert.doesNotMatch(code, /^\s*export\s[^;]*\bfrom\s*['"]/m);
    });

    it('loads as an ES module when copied on its own', async () => {
        // .mjs so the copy is parsed as a module without a package.json "type" beside it, like the browser does
        const copy = join(dir, 'ee-client.mjs');
        copyFileSync(source, copy);

        const mod = await import(pathToFileURL(copy).href);
        assert.equal(typeof mod.EmailEngineClient, 'function');
        assert.equal(typeof mod.createEmailEngineClient, 'function');
        assert.equal(mod.default, mod.EmailEngineClient);
    });
});

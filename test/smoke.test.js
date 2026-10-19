// Smoke tests for the API-only (no DOM) side of the client: the package loads in Node,
// builds requests the way EmailEngine expects and reports server errors usefully.
// The UI half needs a DOM and is not covered here.

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import EmailEngineClient, { EmailEngineClient as NamedClient, createEmailEngineClient } from '../index.js';

function jsonResponse(body, status = 200, statusText = 'OK') {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: async () => body
    };
}

describe('ee-client', () => {
    let fetchMock;

    beforeEach(() => {
        fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse({ mailboxes: [{ path: 'INBOX' }] }));
        mock.method(console, 'error', () => {});
    });

    afterEach(() => {
        mock.restoreAll();
    });

    it('exports the class as default and named, plus the factory', () => {
        assert.equal(EmailEngineClient, NamedClient);
        assert.equal(typeof createEmailEngineClient, 'function');
    });

    it('factory rejects missing options and a missing account', () => {
        assert.throws(() => createEmailEngineClient(), /Invalid options/);
        assert.throws(() => createEmailEngineClient({ apiUrl: 'http://ee.test' }), /Account identifier is required/);
    });

    it('creates an API-only client without a DOM', () => {
        const client = createEmailEngineClient({ apiUrl: 'http://ee.test', account: 'acc', accessToken: 'tok' });
        assert.equal(client.container, null);
        assert.equal(client.pageSize, 20);
        client.destroy();
    });

    it('sends an authenticated request with the account id encoded', async () => {
        const client = new EmailEngineClient({ apiUrl: 'http://ee.test', account: 'a/b#c', accessToken: 'tok' });
        const folders = await client.loadFolders();

        assert.deepEqual(folders, [{ path: 'INBOX' }]);
        assert.equal(fetchMock.mock.callCount(), 1);
        const [url, options] = fetchMock.mock.calls[0].arguments;
        assert.equal(url, 'http://ee.test/v1/account/a%2Fb%23c/mailboxes');
        assert.equal(options.method, 'GET');
        assert.equal(options.headers.Authorization, 'Bearer tok');
        client.destroy();
    });

    it('carries the server message of a failed request', async () => {
        fetchMock.mock.mockImplementation(async () =>
            jsonResponse({ statusCode: 503, error: 'Service Unavailable', message: 'Requested account is not yet initialized' }, 503, 'Service Unavailable')
        );
        const client = new EmailEngineClient({ apiUrl: 'http://ee.test', account: 'acc' });

        await assert.rejects(client.loadFolders(), error => {
            assert.equal(error.statusCode, 503);
            assert.equal(client._errorMessage(error), 'Requested account is not yet initialized');
            return true;
        });
        client.destroy();
    });

    it('marks transport failures as network errors', async () => {
        fetchMock.mock.mockImplementation(async () => {
            throw new TypeError('fetch failed');
        });
        const client = new EmailEngineClient({ apiUrl: 'http://ee.test', account: 'acc' });

        await assert.rejects(client.apiRequest('GET', '/v1/account/acc'), error => {
            assert.equal(error.isNetworkError, true);
            return true;
        });
        client.destroy();
    });

    it('escapes HTML special characters', () => {
        const client = new EmailEngineClient({ account: 'acc' });
        assert.equal(client.escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
        assert.equal(client.escapeHtml(null), '');
        client.destroy();
    });

    it('starts the keep-alive timer only for sess_ tokens and destroy() clears it', () => {
        const plain = new EmailEngineClient({ account: 'acc', accessToken: 'tok' });
        assert.equal(plain.keepAliveTimer, null);
        plain.destroy();

        const session = new EmailEngineClient({ account: 'acc', accessToken: 'sess_abc' });
        assert.notEqual(session.keepAliveTimer, null);
        session.destroy();
        assert.equal(session.keepAliveTimer, null);
    });
});

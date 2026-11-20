// The DOM-free half of composing: address fields, the recipients and subject of a reply,
// reply-all or forward, the request bodies sendMessage and saveDraft build, the response markers
// and the onNavigate notification. The compose form itself needs a DOM and is exercised by the
// end-to-end suite in test/e2e.

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import { EmailEngineClient } from '../index.js';

function jsonResponse(body) {
    return { ok: true, status: 200, statusText: 'OK', json: async () => body };
}

const OWN = 'me@example.com';

const original = {
    id: 'AAAAAQAACnA',
    subject: 'Quarterly numbers',
    from: { name: 'Alice', address: 'alice@example.com' },
    to: [{ address: OWN }, { name: 'Bob', address: 'bob@example.com' }],
    cc: [{ address: 'carol@example.com' }, { address: 'ALICE@example.com' }]
};

describe('compose helpers', () => {
    let client;
    let fetchMock;

    beforeEach(() => {
        fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse({ queueId: 'q1' }));
        mock.method(console, 'error', () => {});
        client = new EmailEngineClient({ apiUrl: 'http://ee.test', account: 'acc', accessToken: 'tok' });
    });

    afterEach(() => {
        client.destroy();
        mock.restoreAll();
    });

    it('parses an address field, keeping quoted names with commas whole', () => {
        assert.deepEqual(client.parseAddressList('"Doe, John" <john@example.com>; jane@example.com,  ,Bob <bob@example.com>'), [
            { name: 'Doe, John', address: 'john@example.com' },
            { address: 'jane@example.com' },
            { name: 'Bob', address: 'bob@example.com' }
        ]);
        assert.deepEqual(client.parseAddressList('"Say \\"hi\\"" <x@example.com>'), [{ name: 'Say "hi"', address: 'x@example.com' }]);
        assert.deepEqual(client.parseAddressList(''), []);
        assert.deepEqual(client.parseAddressList(null), []);
    });

    it('parses a long run of "<" without a closing ">" in linear time', () => {
        const entry = '<='.repeat(50000);
        const started = Date.now();
        assert.deepEqual(client.parseAddressList(entry), [{ address: entry }]);
        assert.ok(Date.now() - started < 1000, `took ${Date.now() - started}ms`);
    });

    it('splits name and address the way the "Name <address>" pattern did', () => {
        const pattern = /^(.*)<([^>]*)>$/;
        for (const entry of ['a <b> <c@d>', 'a <b>c <d@e>', '<x@y>', 'x <y', 'x <y> z', 'a > <b@c>', 'a <b>>', 'a\nb <c@d>', '"" <a@b>']) {
            const match = entry.match(pattern);
            let expected = { address: entry.trim() };
            if (match) {
                const name = match[1].trim().replace(/^"(.*)"$/, '$1');
                expected = name ? { name, address: match[2].trim() } : { address: match[2].trim() };
            }
            assert.deepEqual(client.parseAddressList(entry), [expected], entry);
        }
    });

    it('formats address entries back into a field that parses to the same list', () => {
        const list = [{ name: 'Doe, John', address: 'john@example.com' }, { address: 'jane@example.com' }, { name: 'Say "hi"', address: 'x@example.com' }];
        const field = client.formatAddressList(list);
        assert.equal(field, '"Doe, John" <john@example.com>, jane@example.com, "Say \\"hi\\"" <x@example.com>');
        assert.deepEqual(client.parseAddressList(field), list);
        // entries without an address are dropped, a single object is accepted
        assert.equal(client.formatAddressList([{ name: 'Nobody' }, null]), '');
        assert.equal(client.formatAddressList({ address: 'one@example.com' }), 'one@example.com');
    });

    it('answers the sender on reply, with one Re: prefix', () => {
        const reply = client.prepareResponse(original, 'reply', OWN);
        assert.deepEqual(reply.to, [{ name: 'Alice', address: 'alice@example.com' }]);
        assert.deepEqual(reply.cc, []);
        assert.equal(reply.subject, 'Re: Quarterly numbers');
        assert.deepEqual(reply.reference, { message: 'AAAAAQAACnA', action: 'reply', inline: true });

        assert.equal(client.prepareResponse({ ...original, subject: 'RE: Quarterly numbers' }, 'reply', OWN).subject, 'RE: Quarterly numbers');
        assert.equal(client.prepareResponse({ ...original, subject: '' }, 'reply', OWN).subject, 'Re:');
    });

    it('prefers Reply-To, unless it names the account itself', () => {
        const withReplyTo = { ...original, replyTo: [{ address: 'list@example.com' }] };
        assert.deepEqual(client.prepareResponse(withReplyTo, 'reply', OWN).to, [{ address: 'list@example.com' }]);

        const replyToSelf = { ...original, replyTo: [{ address: OWN }] };
        assert.deepEqual(client.prepareResponse(replyToSelf, 'reply', OWN).to, [{ name: 'Alice', address: 'alice@example.com' }]);
    });

    it('resolves reply-all itself, without the account and without duplicates', () => {
        const all = client.prepareResponse(original, 'reply-all', OWN);
        assert.deepEqual(all.to, [{ name: 'Alice', address: 'alice@example.com' }]);
        // the account and a differently cased copy of the sender are left out
        assert.deepEqual(all.cc, [{ name: 'Bob', address: 'bob@example.com' }, { address: 'carol@example.com' }]);
        // sent as a plain reply so the server does not add back a recipient the form removed
        assert.equal(all.reference.action, 'reply');
    });

    it('answers the recipients of a message the account sent itself', () => {
        const sent = { id: 'm2', subject: 'Hi', from: { address: OWN }, to: [{ address: 'bob@example.com' }] };
        assert.deepEqual(client.prepareResponse(sent, 'reply', OWN).to, [{ address: 'bob@example.com' }]);

        const toSelf = { id: 'm3', subject: 'Note', from: { name: 'Me', address: OWN }, to: [{ address: OWN }] };
        assert.deepEqual(client.prepareResponse(toSelf, 'reply', OWN).to, [{ name: 'Me', address: OWN }]);
    });

    it('starts a forward with no recipients and the original files as references', () => {
        const withFiles = {
            ...original,
            attachments: [
                { id: 'att1', filename: 'a.pdf', contentType: 'application/pdf', encodedSize: 400 },
                { id: 'att2', filename: 'logo.png', contentType: 'image/png', embedded: true }
            ]
        };
        const forward = client.prepareResponse(withFiles, 'forward', OWN);
        assert.deepEqual(forward.to, []);
        assert.equal(forward.subject, 'Fwd: Quarterly numbers');
        assert.deepEqual(forward.reference, { message: 'AAAAAQAACnA', action: 'forward', inline: true, forwardAttachments: false });
        // an image the body shows in place travels with the quote, not as a file
        assert.deepEqual(forward.attachments, [{ reference: 'att1', filename: 'a.pdf', contentType: 'application/pdf', size: 300 }]);
        assert.equal(client.prepareResponse({ ...original, subject: 'Fw: x' }, 'forward').subject, 'Fw: x');
    });

    it('sends html, cc, bcc, attachments and the reference, leaving empty lists out', async () => {
        await client.sendMessage({
            to: 'a@example.com',
            subject: 'Subject',
            text: 'Body',
            html: '<p>Body</p>',
            cc: [],
            bcc: ['b@example.com'],
            attachments: [
                { filename: 'a.txt', contentType: 'text/plain', content: 'YQ==', size: 1 },
                { reference: 'att1', filename: 'a.pdf', contentType: 'application/pdf', size: 300 }
            ],
            reference: { message: 'm1', action: 'reply', inline: true },
            headers: { 'In-Reply-To': '<x@example.com>' }
        });

        const [url, options] = fetchMock.mock.calls[0].arguments;
        assert.equal(url, 'http://ee.test/v1/account/acc/submit');
        assert.deepEqual(JSON.parse(options.body), {
            subject: 'Subject',
            text: 'Body',
            html: '<p>Body</p>',
            to: [{ address: 'a@example.com' }],
            bcc: [{ address: 'b@example.com' }],
            // the size is the form's own bookkeeping and is not sent; a reference keeps its name
            attachments: [
                { filename: 'a.txt', contentType: 'text/plain', content: 'YQ==' },
                { reference: 'att1', filename: 'a.pdf', contentType: 'application/pdf' }
            ],
            reference: { message: 'm1', action: 'reply', inline: true },
            headers: { 'In-Reply-To': '<x@example.com>' }
        });
    });

    it('refuses the 1.x (to, subject, text) call instead of sending a blank message', async () => {
        await assert.rejects(() => client.sendMessage('a@example.com', 'S', 'T'), TypeError);
        await assert.rejects(() => client.saveDraft(null, 'S', 'T'), /saveDraft\(\) takes a message object/);
        await assert.rejects(() => client.updateDraft('d1', ['a@example.com']), TypeError);
        assert.equal(fetchMock.mock.callCount(), 0);
    });

    it('saves a draft with its reference into the Drafts folder', async () => {
        client.folders = [{ path: 'Drafts', specialUse: '\\Drafts' }];
        fetchMock.mock.mockImplementation(async url => jsonResponse(url.endsWith('/acc') ? { email: OWN, name: 'Me' } : { path: 'Drafts' }));

        await client.saveDraft({ subject: 'Re: x', text: 'Later', reference: { message: 'm1', action: 'reply', inline: true } });

        const upload = fetchMock.mock.calls.find(call => call.arguments[0].endsWith('/message'));
        assert.deepEqual(JSON.parse(upload.arguments[1].body), {
            path: 'Drafts',
            flags: ['\\Draft'],
            subject: 'Re: x',
            text: 'Later',
            reference: { message: 'm1', action: 'reply', inline: true },
            from: { name: 'Me', address: OWN }
        });
    });

    it('replaces a draft: the new version is saved before the old one is removed for good', async () => {
        client.folders = [{ path: 'Drafts', specialUse: '\\Drafts' }];
        fetchMock.mock.mockImplementation(async url => jsonResponse(url.endsWith('/acc') ? { email: OWN } : { id: 'new', path: 'Drafts' }));

        const saved = await client.updateDraft('old/1', { to: 'a@example.com', subject: 'v2', text: 'Second version' });
        assert.deepEqual(saved, { id: 'new', path: 'Drafts' });

        const calls = fetchMock.mock.calls.map(call => `${(call.arguments[1] && call.arguments[1].method) || 'GET'} ${call.arguments[0]}`);
        const upload = calls.indexOf('POST http://ee.test/v1/account/acc/message');
        const removal = calls.indexOf('DELETE http://ee.test/v1/account/acc/message/old%2F1?force=true');
        assert.ok(upload >= 0 && removal > upload, calls.join('\n'));
    });

    it('keeps the new draft when the old one cannot be removed', async () => {
        client.folders = [{ path: 'Drafts', specialUse: '\\Drafts' }];
        fetchMock.mock.mockImplementation(async (url, options) =>
            options && options.method === 'DELETE'
                ? { ok: false, status: 500, statusText: 'Server Error', json: async () => ({ message: 'boom' }) }
                : jsonResponse({ id: 'new', path: 'Drafts' })
        );
        assert.deepEqual(await client.updateDraft('old', { subject: 'v2' }), { id: 'new', path: 'Drafts' });
    });

    it('tells the host about sent messages, saved drafts and failures, and survives a failing handler', async () => {
        const events = [];
        const host = new EmailEngineClient({
            apiUrl: 'http://ee.test',
            account: 'acc',
            onMessageSent: response => {
                events.push(['sent', response.queueId]);
                throw new Error('host bug');
            },
            onDraftSaved: response => events.push(['draft', response.path]),
            onError: (error, context) => events.push(['error', context.action, context.description, error.statusCode])
        });
        host.folders = [{ path: 'Drafts', specialUse: '\\Drafts' }];
        fetchMock.mock.mockImplementation(async url => jsonResponse(url.endsWith('/acc') ? {} : { queueId: 'q1', path: 'Drafts' }));

        // a throwing handler does not turn a delivered message into a failure
        assert.deepEqual(await host.sendMessage({ to: 'a@example.com', subject: 'S', text: 'T' }), { queueId: 'q1', path: 'Drafts' });
        await host.saveDraft({ subject: 'Later' });

        fetchMock.mock.mockImplementation(async () => ({ ok: false, status: 503, statusText: 'Unavailable', json: async () => ({ message: 'Not yet' }) }));
        await assert.rejects(() => host.sendMessage({ to: 'a@example.com' }));

        assert.deepEqual(events, [
            ['sent', 'q1'],
            ['draft', 'Drafts'],
            ['error', 'send', 'Failed to send the message', 503]
        ]);
        host.destroy();
    });

    it('is ready at once without the UI', async () => {
        assert.equal(await client.ready, true);
    });

    it('asks for folder counters when told to, and not by default without the UI', async () => {
        await client.loadFolders();
        await client.loadFolders({ counters: true });
        assert.deepEqual(
            fetchMock.mock.calls.map(call => call.arguments[0]),
            ['http://ee.test/v1/account/acc/mailboxes', 'http://ee.test/v1/account/acc/mailboxes?counters=true']
        );
    });

    it('marks replied and forwarded messages, a forward only as forwarded', () => {
        assert.equal(client._responseMarkers({ flags: ['\\Seen'] }), '');
        assert.match(client._responseMarkers({ flags: ['\\Answered'] }), /aria-label="Replied"/);

        const forwarded = client._responseMarkers({ flags: ['\\Answered', '$Forwarded'] }, true);
        assert.match(forwarded, /<span>Forwarded<\/span>/);
        assert.doesNotMatch(forwarded, /Replied/);
    });

    it('tells the host about navigation, and survives a failing handler', () => {
        const calls = [];
        const host = new EmailEngineClient({ account: 'acc', onNavigate: state => calls.push(state) });
        host.currentFolder = 'INBOX';
        host.currentMessage = { id: 'm1' };
        host._notifyNavigate();
        host._dropMessage('m1');
        assert.deepEqual(calls, [
            { path: 'INBOX', messageId: 'm1' },
            { path: 'INBOX', messageId: null }
        ]);
        host.destroy();

        const failing = new EmailEngineClient({
            account: 'acc',
            onNavigate: () => {
                throw new Error('host bug');
            }
        });
        assert.doesNotThrow(() => failing._notifyNavigate());
        failing.destroy();
    });

    it('renders header addresses escaped, without empty angle brackets', () => {
        const html = client._addressListHtml([
            { name: 'Bob <b>', address: 'bob@example.com' },
            { address: 'carol@example.com' },
            { name: 'Name only' },
            null,
            {}
        ]);
        assert.equal(html, 'Bob &lt;b&gt; <span class="ee-address">&lt;bob@example.com&gt;</span>, carol@example.com, Name only');
        assert.equal(client._addressListHtml({ address: 'one@example.com' }), 'one@example.com');
        assert.equal(client._addressListHtml(undefined), '');
    });

    it('formats the header date to the minute and tolerates a bad value', () => {
        const formatted = client.formatFullDate('2026-11-16T14:00:00Z');
        assert.match(formatted, /2026/);
        assert.doesNotMatch(formatted, /:00:00/);
        assert.equal(client.formatFullDate('not a date'), '');
    });

    it('notify() is a no-op without the UI', () => {
        assert.doesNotThrow(() => client.notify('Queued'));
    });

    it('defaults the attachment limit and takes a host value', () => {
        assert.equal(client.maxAttachmentSize, 25 * 1024 * 1024);
        const custom = new EmailEngineClient({ account: 'acc', maxAttachmentSize: 1024 });
        assert.equal(custom.maxAttachmentSize, 1024);
        custom.destroy();
    });
});

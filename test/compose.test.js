// The DOM-free half of composing: address fields, the recipients and subject of a reply,
// reply-all or forward, the request bodies sendMessage and saveDraft build, the response markers
// and the onNavigate notification. The compose form itself needs a DOM and is exercised by
// EmailEngine's own end-to-end suite.

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

    it('starts a forward with no recipients', () => {
        const forward = client.prepareResponse(original, 'forward', OWN);
        assert.deepEqual(forward.to, []);
        assert.equal(forward.subject, 'Fwd: Quarterly numbers');
        assert.deepEqual(forward.reference, { message: 'AAAAAQAACnA', action: 'forward', inline: true });
        assert.equal(client.prepareResponse({ ...original, subject: 'Fw: x' }, 'forward').subject, 'Fw: x');
    });

    it('sends cc, bcc, attachments and the reference, leaving empty lists out', async () => {
        await client.sendMessage('a@example.com', 'Subject', 'Body', {
            cc: [],
            bcc: ['b@example.com'],
            attachments: [{ filename: 'a.txt', contentType: 'text/plain', content: 'YQ==', size: 1 }],
            reference: { message: 'm1', action: 'reply', inline: true }
        });

        const [url, options] = fetchMock.mock.calls[0].arguments;
        assert.equal(url, 'http://ee.test/v1/account/acc/submit');
        assert.deepEqual(JSON.parse(options.body), {
            subject: 'Subject',
            text: 'Body',
            to: [{ address: 'a@example.com' }],
            bcc: [{ address: 'b@example.com' }],
            // the size is the form's own bookkeeping and is not sent
            attachments: [{ filename: 'a.txt', contentType: 'text/plain', content: 'YQ==' }],
            reference: { message: 'm1', action: 'reply', inline: true }
        });
    });

    it('keeps the three-argument sendMessage call working', async () => {
        await client.sendMessage(['a@example.com', { name: 'B', address: 'b@example.com' }], 'S', 'T');
        assert.deepEqual(JSON.parse(fetchMock.mock.calls[0].arguments[1].body), {
            subject: 'S',
            text: 'T',
            to: [{ address: 'a@example.com' }, { name: 'B', address: 'b@example.com' }]
        });
    });

    it('saves a draft with its reference into the Drafts folder', async () => {
        client.folders = [{ path: 'Drafts', specialUse: '\\Drafts' }];
        fetchMock.mock.mockImplementation(async url => jsonResponse(url.endsWith('/acc') ? { email: OWN, name: 'Me' } : { path: 'Drafts' }));

        await client.saveDraft(null, 'Re: x', 'Later', { reference: { message: 'm1', action: 'reply', inline: true } });

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

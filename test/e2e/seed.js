// Test mail for the e2e mailboxes, built as raw RFC 5322 messages so imapkit stores exactly what
// a real server would. The browser clock is fixed to NOW (see fixtures.js) and every message is
// dated relative to it, so "today" and "last week" render the same on every run.

import { randomBytes } from 'node:crypto';

export const NOW = new Date('2026-11-20T10:00:00Z');
export const OWN = { name: 'Test User', address: 'testuser@example.com' };

const ALICE = { name: 'Alice Andersson', address: 'alice@example.com' };
const BOB = { name: 'Bob Brown', address: 'bob@example.com' };
const CAROL = { name: 'Carol Chen', address: 'carol@example.com' };

// A 1x1 PNG, for the inline image of the newsletter
const PIXEL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const ATTACHMENTS = {
    report: { filename: 'q3-report.pdf', contentType: 'application/pdf', content: Buffer.from('%PDF-1.4\n% e2e test report\n%%EOF\n') },
    data: { filename: 'figures.csv', contentType: 'text/csv', content: Buffer.from('quarter,revenue\nQ3,1200\n') },
    notes: { filename: 'notes.txt', contentType: 'text/plain', content: Buffer.from('Meeting notes\n') }
};

const minutesAgo = minutes => new Date(NOW.getTime() - minutes * 60 * 1000);

function encodeWord(value) {
    return /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;
}

function formatAddress(entry) {
    if (!entry.name) {
        return `<${entry.address}>`;
    }
    const name = /^[\x20-\x7e]*$/.test(entry.name) ? `"${entry.name.replace(/(["\\])/g, '\\$1')}"` : encodeWord(entry.name);
    return `${name} <${entry.address}>`;
}

const formatList = list => [].concat(list).map(formatAddress).join(', ');

function base64Lines(content) {
    return Buffer.from(content).toString('base64').replace(/.{76}/g, '$&\r\n');
}

function textPart(type, content) {
    return `Content-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64Lines(content)}`;
}

function filePart(att, disposition = 'attachment') {
    const cid = att.cid ? `Content-ID: <${att.cid}>\r\n` : '';
    return (
        `Content-Type: ${att.contentType}; name="${att.filename}"\r\n` +
        `Content-Disposition: ${disposition}; filename="${att.filename}"\r\n${cid}` +
        `Content-Transfer-Encoding: base64\r\n\r\n${base64Lines(att.content)}`
    );
}

function multipart(subtype, parts) {
    const boundary = `----e2e-${randomBytes(6).toString('hex')}`;
    return `Content-Type: multipart/${subtype}; boundary="${boundary}"\r\n\r\n${parts.map(part => `--${boundary}\r\n${part}\r\n`).join('')}--${boundary}--\r\n`;
}

/**
 * Builds a raw message
 *
 * @param {Object} msg
 * @param {string} msg.subject
 * @param {Object} [msg.from]
 * @param {Object|Object[]} [msg.to]
 * @param {Object[]} [msg.cc]
 * @param {Object[]} [msg.replyTo]
 * @param {string} [msg.text]
 * @param {string} [msg.html]
 * @param {Object[]} [msg.attachments] - { filename, contentType, content }
 * @param {Object[]} [msg.inline] - { filename, contentType, content, cid }
 * @param {Date} [msg.date]
 * @param {Object} [msg.headers] - extra header lines
 * @returns {string}
 */
export function buildMessage(msg) {
    const headers = [
        `From: ${formatList(msg.from || ALICE)}`,
        `To: ${formatList(msg.to || OWN)}`,
        msg.cc ? `Cc: ${formatList(msg.cc)}` : null,
        msg.replyTo ? `Reply-To: ${formatList(msg.replyTo)}` : null,
        `Subject: ${encodeWord(msg.subject)}`,
        `Date: ${(msg.date || NOW).toUTCString().replace('GMT', '+0000')}`,
        `Message-ID: <${msg.messageId || randomBytes(8).toString('hex')}@example.com>`,
        ...Object.entries(msg.headers || {}).map(([key, value]) => `${key}: ${value}`),
        'MIME-Version: 1.0'
    ].filter(Boolean);

    let body;
    if (msg.html && msg.text) {
        body = multipart('alternative', [textPart('text/plain', msg.text), textPart('text/html', msg.html)]);
    } else if (msg.html) {
        body = textPart('text/html', msg.html);
    } else {
        body = textPart('text/plain', msg.text || '');
    }

    if (msg.inline && msg.inline.length) {
        body = multipart('related', [body.replace(/\r\n$/, ''), ...msg.inline.map(att => filePart(att, 'inline'))]);
    }
    if (msg.attachments && msg.attachments.length) {
        body = multipart('mixed', [body.replace(/\r\n$/, ''), ...msg.attachments.map(att => filePart(att))]);
    }

    return `${headers.join('\r\n')}\r\n${body}`;
}

// Hostile values: each would run script or break the markup if it reached innerHTML unescaped
export const XSS = {
    subject: '<img src=x onerror="window.__xss=1">Invoice',
    name: '<script>window.__xss=2</script>Mallory',
    filename: '<svg onload=window.__xss=3>.txt',
    folder: '<img src=x onerror=window.__xss=4>Evil'
};

// The messages of the standard INBOX, oldest first (imapkit gives them ascending UIDs)
export function inboxMessages() {
    return [
        {
            raw: buildMessage({
                subject: 'Welcome aboard',
                from: CAROL,
                text: 'Hi,\n\nYour account is ready. Reply to this message if you have questions.\n\nCarol',
                date: minutesAgo(60 * 24 * 30)
            }),
            flags: ['\\Seen']
        },
        {
            raw: buildMessage({
                subject: XSS.subject,
                from: { name: XSS.name, address: 'mallory@example.com' },
                html: '<p>Pay now</p><script>window.__xss=5</script><img src="x" onerror="window.__xss=6"><a href="javascript:window.__xss=7">link</a>',
                attachments: [{ filename: XSS.filename, contentType: 'text/plain', content: Buffer.from('x') }],
                date: minutesAgo(60 * 24 * 10)
            }),
            flags: ['\\Seen']
        },
        {
            raw: buildMessage({
                subject: 'Newsletter: November edition',
                from: { name: 'The Gazette', address: 'news@example.com' },
                html:
                    '<table width="100%" bgcolor="#f4f4f4"><tr><td style="color:#222;padding:16px">' +
                    '<h1 style="color:#0a4">November news</h1><img src="cid:logo@e2e" alt="logo" width="40" height="40">' +
                    '<p class="fixed inset-0" id="app">Styled content that must stay inside the viewer.</p></td></tr></table>',
                inline: [{ filename: 'logo.png', contentType: 'image/png', content: Buffer.from(PIXEL_PNG, 'base64'), cid: 'logo@e2e' }],
                date: minutesAgo(60 * 24 * 3)
            }),
            flags: []
        },
        {
            raw: buildMessage({
                subject: 'Your sign-in code',
                from: { name: 'Example Login', address: 'login@example.com' },
                text: 'Your code is 482913. It expires in 10 minutes.',
                headers: { 'OTP-Token': '"482913"; origin="https://login.example.com"' },
                date: minutesAgo(60 * 5)
            }),
            flags: []
        },
        {
            raw: buildMessage({
                subject: 'Re: Project kickoff',
                from: BOB,
                to: [OWN],
                cc: [CAROL],
                html:
                    '<p>Sounds good, see you Monday.</p>' +
                    '<div class="gmail_quote"><div>On Mon, Nov 16, 2026 at 9:00 AM Test User &lt;testuser@example.com&gt; wrote:</div>' +
                    '<blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex">' +
                    '<p>Shall we start the project on Monday? I have booked the large meeting room from nine until noon, ' +
                    'and I will send the agenda and the list of open questions on Friday afternoon.</p></blockquote></div>',
                text: 'Sounds good, see you Monday.\n\nOn Mon, Nov 16, 2026 at 9:00 AM Test User wrote:\n> Shall we start the project on Monday? I have booked the large meeting room.',
                date: minutesAgo(60 * 2)
            }),
            flags: []
        },
        {
            raw: buildMessage({
                subject: 'Quarterly report',
                from: ALICE,
                to: [OWN, BOB],
                cc: [CAROL],
                replyTo: [{ name: 'Finance Team', address: 'finance@example.com' }],
                html: '<p>Hello all,</p><p>The <b>Q3 report</b> and the figures are attached.</p><p>Alice</p>',
                text: 'Hello all,\n\nThe Q3 report and the figures are attached.\n\nAlice',
                attachments: [ATTACHMENTS.report, ATTACHMENTS.data],
                date: minutesAgo(30)
            }),
            flags: []
        },
        {
            raw: buildMessage({
                subject: '\u05e9\u05dc\u05d5\u05dd - \u0645\u0631\u062d\u0628\u0627 - Gr\u00fc\u00dfe',
                from: { name: '\u05d3\u05d5\u05d3 \u05db\u05d4\u05df', address: 'david@example.com' },
                text: '\u05e9\u05dc\u05d5\u05dd \u05e2\u05d5\u05dc\u05dd\n\u0645\u0631\u062d\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645\nGr\u00fc\u00dfe aus M\u00fcnchen',
                date: minutesAgo(10)
            }),
            flags: []
        }
    ];
}

// Messages for paging: count plain messages, newest last
export function bulkMessages(count, prefix = 'Bulk message') {
    return Array.from({ length: count }, (_, i) => ({
        raw: buildMessage({
            subject: `${prefix} ${String(i + 1).padStart(3, '0')}`,
            from: BOB,
            text: `Body of message ${i + 1}`,
            date: minutesAgo(60 * 24 * 60 - i)
        }),
        flags: ['\\Seen']
    }));
}

export function draftMessages() {
    return [
        {
            raw: buildMessage({
                subject: 'Unfinished proposal',
                from: OWN,
                to: [CAROL],
                text: 'Draft text that is not finished yet',
                date: minutesAgo(90)
            }),
            flags: ['\\Draft', '\\Seen']
        }
    ];
}

/**
 * The storage option of imapkit for the standard test mailbox: INBOX with the messages above,
 * the special-use folders, and a nested folder tree with a hostile folder name
 *
 * @param {Object} [overrides] - per-folder message lists, e.g. { INBOX: [...] }
 */
export function standardStorage(overrides = {}) {
    const messages = path => overrides[path] || [];
    return {
        INBOX: { messages: overrides.INBOX || inboxMessages() },
        '': {
            separator: '/',
            folders: {
                Drafts: { 'special-use': '\\Drafts', messages: overrides.Drafts || draftMessages() },
                Sent: { 'special-use': '\\Sent', messages: messages('Sent') },
                Trash: { 'special-use': '\\Trash', messages: messages('Trash') },
                Junk: { 'special-use': '\\Junk', messages: messages('Junk') },
                Archive: { 'special-use': '\\Archive', messages: messages('Archive') },
                Projects: {
                    messages: messages('Projects'),
                    folders: {
                        2026: { messages: messages('Projects/2026') }
                    }
                },
                [XSS.folder]: { messages: [] }
            }
        }
    };
}

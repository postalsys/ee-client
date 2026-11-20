// One test mailbox: an imapkit IMAP server with an SMTP sink, registered in EmailEngine as a new
// account. Every test gets its own, so nothing carries over between tests. The SMTP sink appends
// whatever EmailEngine sends to the INBOX of the same server, which is how a test reads back the
// MIME of a sent message.

import imapkit from 'imapkit';
import { randomBytes } from 'node:crypto';
import { OWN, standardStorage } from './seed.js';

const PLUGINS = [
    'ENABLE',
    'ID',
    'IDLE',
    'NAMESPACE',
    'UNSELECT',
    'UIDPLUS',
    'MOVE',
    'CONDSTORE',
    'SPECIAL-USE',
    'LITERALPLUS',
    'SASL-IR',
    'AUTH-PLAIN',
    'STARTTLS'
];

// Docker Desktop (macOS, Windows) forwards host.docker.internal to the host loopback; on Linux it
// is the bridge gateway, which reaches only a server listening on every interface
const LISTEN_HOST = process.env.EE_E2E_MAIL_HOST || (process.platform === 'linux' ? '0.0.0.0' : '127.0.0.1');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function waitFor(check, { timeout = 15000, interval = 200, message = 'condition' } = {}) {
    const deadline = Date.now() + timeout;
    let last;
    while (Date.now() < deadline) {
        // eslint-disable-next-line no-await-in-loop -- polling
        last = await check();
        if (last) {
            return last;
        }
        // eslint-disable-next-line no-await-in-loop -- polling
        await sleep(interval);
    }
    throw new Error(`Timed out waiting for ${message}`);
}

export class Mailbox {
    constructor({ apiUrl, token, storage }) {
        this.apiUrl = apiUrl;
        this.token = token;
        this.storage = storage || standardStorage();
        this.account = `e2e-${randomBytes(5).toString('hex')}`;
        this.address = OWN.address;
    }

    async api(method, path, body) {
        const res = await fetch(`${this.apiUrl}${path}`, {
            method,
            headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
            const error = new Error(`${method} ${path} failed with ${res.status}: ${JSON.stringify(json)}`);
            error.statusCode = res.status;
            throw error;
        }
        return json;
    }

    async start() {
        this.server = imapkit({
            plugins: PLUGINS,
            users: { testuser: { password: 'testpass' } },
            smtp: { port: 0, host: LISTEN_HOST },
            storage: this.storage
        });
        this.imapPort = await this.server.start(0, LISTEN_HOST);
        this.smtpPort = this.server.smtpServer.server.address().port;
        this.control = this.server.control;

        await this.api('POST', '/v1/account', {
            account: this.account,
            name: OWN.name,
            email: OWN.address,
            imap: {
                host: 'host.docker.internal',
                port: this.imapPort,
                secure: false,
                auth: { user: 'testuser', pass: 'testpass' },
                tls: { rejectUnauthorized: false }
            },
            smtp: {
                host: 'host.docker.internal',
                port: this.smtpPort,
                secure: false,
                auth: { user: 'testuser', pass: 'testpass' },
                tls: { rejectUnauthorized: false }
            }
        });

        await waitFor(
            async () => {
                const info = await this.api('GET', `/v1/account/${this.account}`);
                if (info.state === 'connectError' || info.state === 'authenticationError') {
                    throw new Error(`Account failed to connect: ${JSON.stringify(info.lastError)}`);
                }
                return info.state === 'connected';
            },
            { timeout: 30000, message: 'the account to connect' }
        );
        return this;
    }

    async stop() {
        try {
            await this.api('DELETE', `/v1/account/${this.account}`);
        } catch {
            // the stack may already be gone
        }
        if (this.server) {
            await this.server.stop();
        }
    }

    // The messages imapkit holds in a folder, with their raw source as text
    messages(path = 'INBOX') {
        return this.control.listMessages(path, { raw: true }).map(msg => ({ ...msg, source: msg.raw.toString('utf8') }));
    }

    // Waits until a message whose source matches the test lands in a folder (sent mail arrives in
    // INBOX through the SMTP sink, EmailEngine's copy in Sent)
    waitForMessage(path, test, options = {}) {
        const matches = typeof test === 'function' ? test : msg => msg.source.includes(test);
        return waitFor(() => this.messages(path).find(matches), { message: `a message in ${path}`, ...options });
    }

    // The EmailEngine id of a message, by subject, as the API lists it
    async messageId(path, subject) {
        return waitFor(
            async () => {
                const list = await this.api('GET', `/v1/account/${this.account}/messages?path=${encodeURIComponent(path)}&pageSize=250`);
                const found = list.messages.find(msg => msg.subject === subject);
                return found && found.id;
            },
            { message: `"${subject}" in ${path}` }
        );
    }
}

// The EmailEngine side of the end-to-end tests: a Redis container and an EmailEngine container on
// a private Docker network. EmailEngine runs unlicensed, which keeps its IMAP and submit workers
// running until the first license check 20 minutes after boot (LICENSE_CHECK_TIMEOUT in its
// server.js), far longer than the suite takes. Every run starts fresh containers, so the clock
// always starts at zero.
//
// The mail servers (imapkit) run inside the test process; EmailEngine reaches them through
// host.docker.internal, which --add-host maps to the host on Linux as Docker Desktop does on macOS.

import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const EE_IMAGE = process.env.EE_E2E_IMAGE || 'postalsys/emailengine:v2.89.0';
export const REDIS_IMAGE = process.env.EE_E2E_REDIS_IMAGE || 'redis:8.2.10-alpine';
export const ADMIN_PASSWORD = 'E2e-Admin-Password-1';

const INDEX_JS = fileURLToPath(new URL('../../index.js', import.meta.url));

async function docker(...args) {
    const { stdout } = await run('docker', args, { maxBuffer: 16 * 1024 * 1024 });
    return stdout.trim();
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Runs an EmailEngine CLI command inside the container, retried while the server is still booting
async function eeCli(container, args, attempts = 60) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            // eslint-disable-next-line no-await-in-loop -- retried one at a time on purpose
            return await docker('exec', container, 'node', '/emailengine/bin/emailengine.js', ...args);
        } catch (error) {
            lastError = error;
            // eslint-disable-next-line no-await-in-loop -- polling
            await sleep(500);
        }
    }
    throw lastError;
}

async function waitForApi(apiUrl, token) {
    for (let i = 0; i < 120; i++) {
        try {
            // eslint-disable-next-line no-await-in-loop -- polling
            const res = await fetch(`${apiUrl}/v1/stats`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                return;
            }
        } catch {
            // not listening yet
        }
        // eslint-disable-next-line no-await-in-loop -- polling
        await sleep(500);
    }
    throw new Error(`EmailEngine did not answer at ${apiUrl}`);
}

/**
 * Starts Redis and EmailEngine. The harness page origin is allowed for CORS, and the local
 * index.js is mounted over the copy EmailEngine serves to its admin browse page, so the embedded
 * client under test is this checkout's.
 *
 * @param {{ corsOrigin: string }} options
 * @returns {Promise<{ apiUrl: string, token: string, network: string, containers: string[] }>}
 */
export async function startStack({ corsOrigin }) {
    const id = `ee-client-e2e-${randomBytes(4).toString('hex')}`;
    const network = id;
    const redis = `${id}-redis`;
    const ee = `${id}-ee`;

    await docker('network', 'create', network);
    await docker('run', '-d', '--rm', '--name', redis, '--network', network, REDIS_IMAGE);
    await docker(
        'run',
        '-d',
        '--rm',
        '--name',
        ee,
        '--network',
        network,
        '--add-host',
        'host.docker.internal:host-gateway',
        '-p',
        '127.0.0.1::3000',
        '-v',
        `${INDEX_JS}:/emailengine/static/js/ee-client.js:ro`,
        '-e',
        `EENGINE_REDIS=redis://${redis}:6379/0`,
        '-e',
        'EENGINE_SECRET=ee-client e2e secret',
        '-e',
        `EENGINE_CORS_ORIGIN=${corsOrigin}`,
        '-e',
        'EENGINE_LOG_LEVEL=warn',
        EE_IMAGE
    );

    const port = (await docker('port', ee, '3000/tcp')).split('\n')[0].split(':').pop();
    const apiUrl = `http://127.0.0.1:${port}`;

    const token = (await eeCli(ee, ['tokens', 'issue'])).split('\n').pop().trim();
    if (!/^[0-9a-f]{64}$/.test(token)) {
        throw new Error(`Unexpected token output: ${token}`);
    }
    await eeCli(ee, ['password', '-p', ADMIN_PASSWORD]);
    await waitForApi(apiUrl, token);
    const stats = await (await fetch(`${apiUrl}/v1/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();

    return { apiUrl, token, version: stats.version, network, containers: [ee, redis] };
}

export async function stopStack(stack) {
    if (!stack) {
        return;
    }
    for (const container of stack.containers) {
        try {
            // eslint-disable-next-line no-await-in-loop -- EmailEngine goes before Redis
            await docker('rm', '-f', container);
        } catch {
            // already gone
        }
    }
    try {
        await docker('network', 'rm', stack.network);
    } catch {
        // already gone
    }
}

export async function containerLogs(container, tail = 200) {
    try {
        const { stdout, stderr } = await run('docker', ['logs', '--tail', String(tail), container], { maxBuffer: 16 * 1024 * 1024 });
        return stdout + stderr;
    } catch (error) {
        return String(error);
    }
}

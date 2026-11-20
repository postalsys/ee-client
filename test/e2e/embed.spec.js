// The client the way EmailEngine ships it: this checkout's index.js is mounted over the
// container's static/js/ee-client.js (see stack.js) and loaded by the admin message browser,
// under EmailEngine's Content-Security-Policy and with a sess_ token from the admin session.

import { test, expect } from './fixtures.js';
import { ADMIN_PASSWORD } from './stack.js';

async function openBrowser(page, mailbox) {
    const base = mailbox.apiUrl;
    await page.goto(`${base}/admin/login`);
    await page.fill('#loginUsername', 'admin');
    await page.fill('#loginPassword', ADMIN_PASSWORD);
    await page.click('form[action="/admin/login"] button[type="submit"]');
    await page.waitForURL(url => !url.pathname.startsWith('/admin/login'));
    await page.goto(`${base}/admin/accounts/${encodeURIComponent(mailbox.account)}/browse`);
}

test.describe('embedded in EmailEngine', () => {
    test('runs under the admin page CSP with a session token', async ({ page, mailbox }) => {
        const problems = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && /Content Security Policy|Refused to/i.test(msg.text())) {
                problems.push(msg.text());
            }
        });
        page.on('pageerror', error => problems.push(error.message));

        await openBrowser(page, mailbox);
        await expect(page.locator('.ee-message-item', { hasText: 'Quarterly report' })).toBeVisible();
        expect(await page.locator('#browse-session-token').inputValue()).toMatch(/^sess_/);

        await page.locator('.ee-message-item', { hasText: 'Quarterly report' }).click();
        await expect(page.locator('.ee-message-title')).toHaveText('Quarterly report');
        await expect(page.locator('.ee-message-body')).toContainText('The Q3 report');

        await page.locator('.ee-sidebar-compose-button').click();
        await expect(page.locator('.ee-compose-dialog')).toBeVisible();

        expect(problems).toEqual([]);
    });

    test('keeps the session token alive while the reader is idle', async ({ page, mailbox }) => {
        await page.clock.install();
        await openBrowser(page, mailbox);
        await expect(page.locator('.ee-message-item').first()).toBeVisible();

        const ping = page.waitForRequest(req => req.method() === 'GET' && new URL(req.url()).pathname === `/v1/account/${mailbox.account}`);
        await page.clock.runFor(6 * 60 * 1000);
        const request = await ping;
        expect(request.headers().authorization).toMatch(/^Bearer sess_/);
    });
});

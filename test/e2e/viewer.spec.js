import { test, expect } from './fixtures.js';
import { XSS } from './seed.js';

const body = page => page.locator('.ee-message-body');

test.describe('message viewer', () => {
    test('shows the header fields and the HTML body', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        const meta = page.locator('.ee-message-meta');
        await expect(meta).toContainText('Alice Andersson');
        await expect(meta).toContainText('<alice@example.com>');
        await expect(meta).toContainText('Bob Brown');
        await expect(meta).toContainText('Carol Chen');
        await expect(meta).toContainText('Fri, Nov 20, 2026');
        await expect(body(page).locator('b')).toHaveText('Q3 report');
    });

    test('lists attachments with their names and sizes', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await expect(page.locator('.ee-attachments-title')).toHaveText('Attachments (2)');
        await expect(page.locator('.ee-attachment-name')).toHaveText(['q3-report.pdf', 'figures.csv']);
    });

    test('shows a plain text message as preformatted text', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Welcome aboard');
        await expect(body(page)).toContainText('Your account is ready.');
    });

    test('keeps the message apart from the host page styles', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Newsletter: November edition');
        const paragraph = body(page).locator('p');
        await expect(paragraph).toContainText('Styled content');
        // the host page styles .fixed.inset-0 as a red full-page overlay; it must not apply here
        expect(await paragraph.evaluate(el => getComputedStyle(el).position)).toBe('static');
        await expect(body(page)).toHaveAttribute('data-styled', 'true');
    });

    test('shows inline images', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Newsletter: November edition');
        const img = body(page).locator('img[alt="logo"]');
        await expect(img).toBeVisible();
        await expect.poll(() => img.evaluate(el => el.naturalWidth)).toBe(1);
    });

    test('folds quoted history and labels the toggle', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Re: Project kickoff');
        const toggle = body(page).locator('summary.ee-collapsed-thread-toggle');
        await expect(toggle).toHaveText('Show quoted text');
        await expect(body(page).getByText('Shall we start the project on Monday?')).toBeHidden();
        await toggle.click();
        await expect(toggle).toHaveText('Hide quoted text');
        await expect(body(page).getByText('Shall we start the project on Monday?')).toBeVisible();
    });

    test('shows a one-time code and copies it', async ({ app, page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await app.start();
        await app.openMessage('Your sign-in code');
        const otp = page.locator('.ee-otp');
        await expect(otp.locator('.ee-otp-char')).toHaveText(['4', '8', '2', '9', '1', '3']);
        // not DKIM-signed by login.example.com, so the site is not named
        await expect(otp.locator('.ee-otp-note')).toBeVisible();
        await otp.locator('[data-action="copy-otp"]').click();
        await expect(otp.locator('.ee-otp-status')).toHaveText('Code copied to the clipboard');
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('482913');
    });

    test('renders hostile header values and bodies inert', async ({ app, page }) => {
        await app.start();
        await expect(app.listItem('Invoice').locator('.ee-message-subject-text')).toHaveText(XSS.subject);
        await app.listItem('Invoice').click();
        await expect(page.locator('.ee-message-title')).toHaveText(XSS.subject);
        await expect(page.locator('.ee-message-meta')).toContainText(XSS.name);
        await expect(page.locator('.ee-attachment-name')).toHaveText(XSS.filename);
        await expect(body(page)).toContainText('Pay now');
        expect(await body(page).evaluate(host => host.shadowRoot.querySelectorAll('script, [onerror]').length)).toBe(0);
        // the fixture checks window.__xss after the test
    });

    test('shows right-to-left text', async ({ app, page }) => {
        await app.start();
        await app.openMessage('שלום - مرحبا - Grüße');
        await expect(body(page)).toContainText('שלום עולם');
    });
});

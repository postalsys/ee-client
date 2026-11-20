import { test, expect } from './fixtures.js';
import { waitFor } from './mailbox.js';
import { decodePart, headerOf } from './mime.js';

// Whether a dotted version is above another, numerically per part
function versionAbove(version, floor) {
    const a = String(version || '0')
        .split('.')
        .map(Number);
    const b = floor.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] || 0) !== (b[i] || 0)) {
            return (a[i] || 0) > (b[i] || 0);
        }
    }
    return false;
}

test.describe('reply and forward', () => {
    test('replies to the Reply-To address with threading headers', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply').click();
        const dialog = app.compose;
        await expect(dialog.locator('.ee-compose-title')).toHaveText('Reply');
        await expect(dialog.locator('[name="to"]')).toHaveValue('Finance Team <finance@example.com>');
        await expect(dialog.locator('[name="subject"]')).toHaveValue('Re: Quarterly report');
        await dialog.locator('.ee-compose-editor').fill('Thanks, looks good.');
        await dialog.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const original = mailbox.messages('INBOX').find(m => m.source.includes('Subject: Quarterly report'));
        const reply = await mailbox.waitForMessage('INBOX', 'Subject: Re: Quarterly report');
        expect(headerOf(reply.source, 'In-Reply-To')).toBe(headerOf(original.source, 'Message-ID'));
        expect(reply.source).toContain('Thanks, looks good.');
        await waitFor(
            () =>
                mailbox
                    .messages('INBOX')
                    .find(m => m.uid === original.uid)
                    .flags.includes('\\Answered'),
            { message: '\\Answered' }
        );
    });

    test('reply all keeps everyone but the account itself', async ({ app }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply-all').click();
        const dialog = app.compose;
        await expect(dialog.locator('[name="to"]')).toHaveValue('Finance Team <finance@example.com>');
        await expect(dialog.locator('[name="cc"]')).toHaveValue('Bob Brown <bob@example.com>, Carol Chen <carol@example.com>');
    });

    test('forwards with the original attachments', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('forward').click();
        const dialog = app.compose;
        await expect(dialog.locator('[name="subject"]')).toHaveValue('Fwd: Quarterly report');
        await expect(dialog.locator('.ee-compose-chip-name')).toHaveText(['q3-report.pdf', 'figures.csv']);
        await dialog.locator('[name="to"]').fill('dave@example.com');
        await dialog.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const fwd = await mailbox.waitForMessage('INBOX', 'Subject: Fwd: Quarterly report');
        expect(fwd.source).toContain('filename=q3-report.pdf');
        expect(fwd.source).toContain('Content-Type: application/pdf');
        expect(fwd.source).toContain('filename=figures.csv');
        expect(fwd.source).toContain('Begin forwarded message');
    });

    test('shows the forwarded message with its header and drops a removed file', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('forward').click();
        const dialog = app.compose;
        const header = dialog.locator('.ee-compose-quote-header');
        await expect(header.locator('.ee-forward-title')).toHaveText('Forwarded message');
        await expect(header).toContainText('Alice Andersson');
        await expect(header).toContainText('Quarterly report');
        await expect(dialog.locator('.ee-compose-quote-toggle')).toHaveAttribute('aria-expanded', 'true');

        await dialog.locator('.ee-compose-chip', { hasText: 'q3-report.pdf' }).locator('.ee-compose-chip-remove').click();
        await expect(dialog.locator('.ee-compose-chip-name')).toHaveText(['figures.csv']);
        await dialog.locator('[name="to"]').fill('dave@example.com');
        await dialog.locator('.ee-compose-editor').fill('FYI, the figures only.');
        await dialog.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const fwd = await mailbox.waitForMessage('INBOX', 'Subject: Fwd: Quarterly report');
        expect(fwd.source).not.toContain('q3-report.pdf');
        expect(fwd.source).toContain('filename=figures.csv');
        expect(fwd.source).toContain('FYI, the figures only.');
    });

    test('folds the quote of a reply until asked', async ({ app }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply').click();
        const toggle = app.compose.locator('.ee-compose-quote-toggle');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(app.compose.locator('.ee-compose-quote-content')).toBeHidden();
        await toggle.click();
        await expect(app.compose.locator('.ee-compose-quote-content')).toContainText('The Q3 report and the figures are attached.');
    });

    // EmailEngine 2.89.0 and older quote only an HTML original into the HTML part. Runs against a
    // later version, or any image when EE_E2E_PLAIN_QUOTE is set (a local build of a fix branch).
    test('quotes a plain-text original in the HTML part as well', async ({ app, mailbox, page }) => {
        test.skip(
            !process.env.EE_E2E_PLAIN_QUOTE && !versionAbove(process.env.EE_E2E_VERSION, '2.89.0'),
            `EmailEngine ${process.env.EE_E2E_VERSION} does not quote it`
        );
        await app.start();
        await app.openMessage('Welcome aboard');
        await app.viewerButton('reply').click();
        await app.compose.locator('.ee-compose-editor').fill('Thank you!');
        await app.compose.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const reply = await mailbox.waitForMessage('INBOX', 'Subject: Re: Welcome aboard');
        const html = decodePart(reply.source, 'text/html');
        expect(html).toContain('Thank you!');
        expect(html).toContain('<blockquote');
        expect(html).toContain('Your account is ready.');
    });
});

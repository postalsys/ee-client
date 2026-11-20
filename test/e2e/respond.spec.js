import { test, expect } from './fixtures.js';
import { waitFor } from './mailbox.js';

const headerOf = (source, name) => {
    const match = source.match(new RegExp(`^${name}: ((?:.*)(?:\\r\\n[ \\t].*)*)`, 'mi'));
    return match ? match[1].replace(/\r\n[ \t]+/g, ' ') : null;
};

test.describe('reply and forward', () => {
    test('replies to the Reply-To address with threading headers', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply').click();
        const dialog = app.compose;
        await expect(dialog.locator('.ee-compose-title')).toHaveText('Reply');
        await expect(dialog.locator('[name="to"]')).toHaveValue('Finance Team <finance@example.com>');
        await expect(dialog.locator('[name="subject"]')).toHaveValue('Re: Quarterly report');
        await dialog.locator('[name="message"]').fill('Thanks, looks good.');
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
        await dialog.locator('[name="to"]').fill('dave@example.com');
        await dialog.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const fwd = await mailbox.waitForMessage('INBOX', 'Subject: Fwd: Quarterly report');
        expect(fwd.source).toContain('q3-report.pdf');
        expect(fwd.source).toContain('figures.csv');
        expect(fwd.source).toContain('Begin forwarded message');
    });
});

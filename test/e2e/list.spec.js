import { test, expect } from './fixtures.js';
import { buildMessage, bulkMessages, standardStorage } from './seed.js';

test.describe('message list', () => {
    test('shows sender, subject, unread state and attachment count', async ({ app }) => {
        await app.start();
        const report = app.listItem('Quarterly report');
        await expect(report.locator('.ee-message-from')).toHaveText('Alice Andersson');
        await expect(report).toHaveClass(/unread/);
        await expect(report.locator('.ee-unread-dot')).toBeVisible();
        await expect(report.locator('.ee-attachment-indicator')).toContainText('2');
        await expect(app.listItem('Welcome aboard')).not.toHaveClass(/unread/);
        await expect(app.listItem('Welcome aboard').locator('.ee-unread-dot')).toHaveCount(0);
        // the newsletter's only file is the image its HTML shows in place
        await expect(app.listItem('Newsletter').locator('.ee-attachment-indicator')).toHaveCount(0);
    });

    test('opens a message from the keyboard', async ({ app, page }) => {
        await app.start();
        await app.listItem('Quarterly report').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.ee-message-title')).toHaveText('Quarterly report');
        await expect(app.listItem('Quarterly report')).toHaveAttribute('aria-current', 'true');
    });

    test('names the recipients in Drafts and Sent', async ({ app }) => {
        await app.start();
        await app.openFolder('Drafts');
        await expect(app.listItem('Unfinished proposal').locator('.ee-message-from')).toHaveText('To: Carol Chen');
    });

    test('dates recent mail by time and older mail by day', async ({ app }) => {
        await app.start();
        // NOW is 10:00 UTC; the report came 30 minutes earlier, the welcome mail 30 days earlier
        await expect(app.listItem('Quarterly report').locator('.ee-message-date')).toHaveText('9:30 AM');
        await expect(app.listItem('Welcome aboard').locator('.ee-message-date')).toHaveText('Oct 21');
    });

    test('decodes non-ASCII subjects and names', async ({ app }) => {
        await app.start();
        await expect(app.listItem('Grüße').locator('.ee-message-from')).toHaveText('דוד כהן');
    });

    test.describe('with replied and forwarded mail', () => {
        test.use({
            storage: standardStorage({
                INBOX: [
                    { raw: buildMessage({ subject: 'Answered one', text: 'a' }), flags: ['\\Seen', '\\Answered'] },
                    { raw: buildMessage({ subject: 'Forwarded one', text: 'b' }), flags: ['\\Seen', '\\Answered', '$Forwarded'] }
                ]
            })
        });

        test('marks them in the list', async ({ app }) => {
            await app.start();
            await expect(app.listItem('Answered one').locator('.ee-response-marker')).toHaveAttribute('aria-label', 'Replied');
            await expect(app.listItem('Forwarded one').locator('.ee-response-marker')).toHaveAttribute('aria-label', 'Forwarded');
        });
    });

    test.describe('with many messages', () => {
        test.use({ storage: standardStorage({ INBOX: bulkMessages(45) }) });

        test('pages forward and back', async ({ app, page }) => {
            await app.start();
            const items = page.locator('.ee-message-item');
            await expect(items).toHaveCount(20);
            await expect(items.first()).toContainText('Bulk message 045');
            await expect(page.locator('.ee-list-range')).toHaveText('1-20 of 45');
            await expect(page.locator('[data-action="prev-page"]')).toBeDisabled();

            await page.locator('[data-action="next-page"]').click();
            await expect(items.first()).toContainText('Bulk message 025');
            await page.locator('[data-action="next-page"]').click();
            await expect(items).toHaveCount(5);
            await expect(page.locator('.ee-list-range')).toHaveText('41-45 of 45');
            await expect(page.locator('[data-action="next-page"]')).toBeDisabled();

            await page.locator('[data-action="prev-page"]').click();
            await expect(items.first()).toContainText('Bulk message 025');
        });

        test('changes the page size and remembers it', async ({ app, page }) => {
            await app.start();
            await page.locator('[data-action="page-size"]').selectOption('50');
            await expect(page.locator('.ee-message-item')).toHaveCount(45);
            expect(await page.evaluate(() => localStorage.getItem('ee-client-page-size'))).toBe('50');
        });
    });
});

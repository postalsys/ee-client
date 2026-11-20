import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures.js';
import { waitFor } from './mailbox.js';
import { ATTACHMENTS } from './seed.js';

const flagsOf = (mailbox, path, subject) => {
    const msg = mailbox.messages(path).find(m => m.source.includes(`Subject: ${subject}`));
    return msg ? msg.flags : null;
};

test.describe('message actions', () => {
    test('opening a message marks it read on the server', async ({ app, mailbox }) => {
        await app.start();
        await expect(app.listItem('Quarterly report')).toHaveClass(/unread/);
        await app.openMessage('Quarterly report');
        await expect(app.listItem('Quarterly report')).not.toHaveClass(/unread/);
        await waitFor(() => (flagsOf(mailbox, 'INBOX', 'Quarterly report') || []).includes('\\Seen'), { message: '\\Seen' });
    });

    test('marks a message unread and read again', async ({ app, mailbox }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('toggle-read').click();
        await expect(app.listItem('Quarterly report')).toHaveClass(/unread/);
        await waitFor(() => !flagsOf(mailbox, 'INBOX', 'Quarterly report').includes('\\Seen'), { message: '\\Seen removed' });
        await expect(app.viewerButton('toggle-read')).toHaveAttribute('aria-label', 'Mark read');
        await app.viewerButton('toggle-read').click();
        await expect(app.listItem('Quarterly report')).not.toHaveClass(/unread/);
    });

    test('deletes a message to Trash after confirming', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Welcome aboard');
        await app.viewerButton('delete').click();
        await expect(app.listItem('Welcome aboard')).toHaveCount(0);
        await expect(page.locator('.ee-toast')).toHaveText('Message moved to Trash.');
        expect((await app.dialogs())[0]).toMatchObject({ kind: 'confirm', message: 'Delete this message?' });
        await mailbox.waitForMessage('Trash', 'Subject: Welcome aboard');
    });

    test('keeps the message when the delete is cancelled', async ({ app, mailbox }) => {
        await app.start();
        await app.openMessage('Welcome aboard');
        await app.answerDialogs(false);
        await app.viewerButton('delete').click();
        await expect.poll(async () => (await app.dialogs()).length).toBe(1);
        await expect(app.listItem('Welcome aboard')).toHaveCount(1);
        expect(mailbox.messages('Trash')).toHaveLength(0);
    });

    test('moves a message to another folder', async ({ app, mailbox }) => {
        await app.start();
        await app.openMessage('Welcome aboard');
        await app.viewerButton('move').selectOption('Projects/2026');
        await expect(app.listItem('Welcome aboard')).toHaveCount(0);
        await mailbox.waitForMessage('Projects/2026', 'Subject: Welcome aboard');
        await app.openFolder('2026');
        await expect(app.listItem('Welcome aboard')).toBeVisible();
    });

    test('downloads an attachment byte for byte', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.ee-attachment-item', { hasText: 'figures.csv' }).click()]);
        expect(download.suggestedFilename()).toBe('figures.csv');
        expect(await readFile(await download.path())).toEqual(ATTACHMENTS.data.content);
    });

    test('downloads the original message', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        const [download] = await Promise.all([page.waitForEvent('download'), app.viewerButton('download-original').click()]);
        expect(download.suggestedFilename()).toMatch(/Quarterly_report\.eml$/);
        expect((await readFile(await download.path())).toString()).toContain('Subject: Quarterly report');
    });
});

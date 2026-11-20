import { test, expect } from './fixtures.js';
import { waitFor } from './mailbox.js';

test.describe('drafts', () => {
    test('sends a stored draft and removes it from Drafts', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openFolder('Drafts');
        await app.openMessage('Unfinished proposal');
        await expect(app.viewerButton('reply')).toHaveCount(0);
        await app.viewerButton('send-draft').click();
        await expect(page.locator('.ee-toast')).toHaveText('Draft queued for delivery.');

        const sent = await mailbox.waitForMessage('INBOX', 'Subject: Unfinished proposal');
        expect(sent.source).toMatch(/^To: "?Carol Chen"? <carol@example.com>/m);
        await waitFor(() => !mailbox.messages('Drafts').some(m => m.source.includes('Unfinished proposal')), { message: 'the draft to go' });
    });
});

// Captures every screen of the client for design review: desktop, tablet and phone widths, in
// light and dark mode, into test-results/screenshots/. Run with `npm run screenshots`; it is not
// part of the test suite and asserts only that each screen got to the state it is named after.

import { test, expect } from '../fixtures.js';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 1024, height: 768 },
    phone: { width: 390, height: 844 }
};

const SCREENS = [
    ['01-inbox', async () => {}],
    ['02-message-attachments', async app => app.openMessage('Quarterly report')],
    ['03-message-newsletter', async app => app.openMessage('Newsletter: November edition')],
    ['04-message-otp', async app => app.openMessage('Your sign-in code')],
    ['05-message-thread', async app => app.openMessage('Re: Project kickoff')],
    ['06-message-plain', async app => app.openMessage('Welcome aboard')],
    [
        '07-draft',
        async app => {
            await app.openFolder('Drafts');
            await app.openMessage('Unfinished proposal');
        }
    ],
    ['08-empty-folder', async app => app.openFolder('Trash')],
    [
        '09-compose-new',
        async (app, page) => {
            await (await composeButton(page)).click();
            await expect(app.compose).toBeVisible();
        }
    ],
    [
        '10-compose-error',
        async (app, page) => {
            await (await composeButton(page)).click();
            await app.compose.locator('.ee-compose-send').click();
            await expect(app.compose.locator('.ee-compose-error')).toBeVisible();
        }
    ],
    [
        '11-reply',
        async app => {
            await app.openMessage('Quarterly report');
            await app.page.locator('.ee-message-viewer [data-action="reply"]').click();
            await expect(app.compose).toBeVisible();
        }
    ],
    [
        '12-forward',
        async app => {
            await app.openMessage('Quarterly report');
            await app.page.locator('.ee-message-viewer [data-action="forward"]').click();
            await expect(app.compose).toBeVisible();
        }
    ],
    [
        '13-folders',
        async (app, page) => {
            const nav = page.locator('.ee-message-list [data-action="show-folders"]');
            if (await nav.isVisible()) {
                await nav.click();
            }
        }
    ]
];

async function composeButton(page) {
    const sidebar = page.locator('.ee-sidebar-compose-button');
    return (await sidebar.isVisible()) ? sidebar : page.locator('.ee-compose-button');
}

for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of ['light', 'dark']) {
        test.describe(`${viewportName} ${theme}`, () => {
            test.use({ viewport });

            for (const [name, setup] of SCREENS) {
                test(name, async ({ app, page }) => {
                    await app.start({ darkMode: theme === 'dark' });
                    await setup(app, page);
                    await page.waitForTimeout(300);
                    await page.screenshot({ path: `test-results/screenshots/${viewportName}-${theme}/${name}.png` });
                });
            }

            test('14-error', async ({ app, page }) => {
                await app.start({ apiUrl: 'http://127.0.0.1:9', darkMode: theme === 'dark' }, { waitForList: false });
                await expect(page.locator('.ee-message-list .ee-error')).toBeVisible();
                await page.screenshot({ path: `test-results/screenshots/${viewportName}-${theme}/14-error.png` });
            });

            test('15-loading', async ({ app, page }) => {
                await page.route('**/messages?**', () => {});
                await app.start({ darkMode: theme === 'dark' }, { waitForList: false });
                await expect(page.locator('.ee-message-list .ee-loading')).toBeVisible();
                await page.screenshot({ path: `test-results/screenshots/${viewportName}-${theme}/15-loading.png` });
            });
        });
    }
}

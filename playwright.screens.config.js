// Screenshot capture for design review (`npm run screenshots`), sharing the e2e stack and
// fixtures. See test/e2e/screens/capture.screens.js.

import base from './playwright.config.js';

export default {
    ...base,
    testDir: 'test/e2e/screens',
    testMatch: '*.screens.js',
    retries: 0,
    use: { ...base.use, trace: 'off', screenshot: 'off' }
};

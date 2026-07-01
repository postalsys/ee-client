// Config for `npm run update` (npm-check-updates).
// This file is .cjs because the package is an ES module ("type": "module").
module.exports = {
    upgrade: true,
    // eslint 9 requires migrating to flat config (eslint.config.js). Stay on the
    // 8.x line until that migration is done deliberately.
    target: name => (name === 'eslint' ? 'minor' : 'latest')
};

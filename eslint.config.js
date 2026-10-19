// Shared lint baseline for the Postal Systems / Nodemailer packages: eslint:recommended
// plus the rules of the retired eslint-config-nodemailer, with formatting left to Prettier.
// This is the ES module form of the shared config (the package is "type": "module").
// Keep the shared part identical across repos; overrides go in the "Repo-specific" block.

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', 'coverage/**', 'dist/**']
    },
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.node }
        },
        rules: {
            'no-await-in-loop': 'error',
            'no-div-regex': 'error',
            strict: ['error', 'global'],
            eqeqeq: 'error',
            'dot-notation': 'error',
            curly: 'error',
            'no-unused-expressions': ['error', { allowShortCircuit: true }],
            'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'handle-callback-err': 'error',
            'no-new': 'error',
            'new-cap': 'error',
            'no-eval': 'error',
            'no-invalid-this': 'error',
            radix: ['error', 'always'],
            'no-use-before-define': ['error', 'nofunc'],
            'callback-return': ['error', ['callback', 'cb', 'done']],
            'no-redeclare': 'error',
            'block-scoped-var': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-useless-call': 'error',
            'no-useless-concat': 'error',
            'no-void': 'error',
            yoda: 'error',
            'no-var': 'error',
            'no-bitwise': 'error',
            'no-lonely-if': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-arrow-callback': 'error',
            'object-shorthand': 'error',
            'prefer-spread': 'error',
            'no-prototype-builtins': 'off'
        }
    },
    {
        files: ['**/*.cjs'],
        languageOptions: {
            sourceType: 'commonjs'
        }
    },
    {
        files: ['test/**'],
        languageOptions: {
            globals: { ...globals.node }
        }
    },
    // Repo-specific: overrides go here, each with a one-line reason
    {
        // The library is a browser widget (bundled into EmailEngine's admin UI); Node use is API-only
        // and reaches the platform through globalThis, so the source sees browser globals, not Node's
        files: ['index.js'],
        languageOptions: {
            globals: { ...globals.browser }
        }
    },
    {
        // Kept from the previous config: this code renders untrusted email content, so string-to-code sinks stay banned
        files: ['**/*.js'],
        rules: {
            'prefer-const': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error'
        }
    },
    prettier
];

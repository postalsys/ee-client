# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@postalsys/ee-client` is the EmailEngine client library for browser and Node.js
applications. It wraps the EmailEngine REST API (`/v1/account/...`) and, when
given a DOM `container`, also renders a complete, self-contained webmail UI
(folder tree, paginated message list, message viewer, compose modal, dark mode).

It is published to npm as `@postalsys/ee-client` and is consumed both as a plain
API client (Node.js) and as a drop-in UI widget (browser).

## Project Structure

Almost all runtime code lives in a single file:

- `index.js` - the entire library: the `EmailEngineClient` class plus the
  `createEmailEngineClient` factory and a `default` export. ES module.
- `index.d.ts` - hand-maintained TypeScript declarations for the public API.
  There is no TypeScript source and this file is **not generated** - update it
  by hand whenever the public API (constructor options, public methods, exported
  interfaces) changes.
- `example.html` - a standalone browser demo that imports `./index.js` directly
  as an ES module; the reference for how the UI is embedded.
- `api.md` - large reference dump of the EmailEngine HTTP API (documentation
  only, not shipped).
- `README.md`, `LICENSE` - shipped with the package.
- `test/` - `node:test` smoke tests (not shipped).

The `files` whitelist in `package.json` (`index.js`, `index.d.ts`, `README.md`,
`LICENSE`) is what actually gets published - `.npmignore` is secondary to it.

### Architecture of `index.js`

`EmailEngineClient` has three concerns interleaved in one class:

1. **API client** - `apiRequest(method, endpoint, data)` is the choke point for
   every JSON call and `_fetchBlob(endpoint)` for binary downloads; both go
   through `_fetch`, which resolves `fetch` (native in the browser and modern
   Node; falls back to a dynamic `import('node-fetch')` when the global is
   absent) and tags transport failures with `isNetworkError`. `_responseError`
   turns a non-ok response into an Error carrying EmailEngine's own Boom payload
   on `.details`, which `_errorMessage` / `_formatSendError` read back into a
   human message. The data methods - `loadFolders`, `loadMessages`,
   `loadMessage`, `markAsRead`, `deleteMessage`, `moveMessage`, `sendMessage`,
   and attachment/source download - all go through them. Work in API-only mode
   with no `container`.
2. **UI rendering** - `createStyles`, `createLayout`, `renderFolderList`,
   `renderMessageList`, `renderMessage`, and the compose modal build the webmail
   interface by assembling HTML strings into `innerHTML`. Only active when a
   `container` is supplied. Panes are written through `_setPaneHtml(selector,
html)`, which guards the missing-container and post-`destroy()` cases;
   `_renderPaneError(selector, title, error, retry)` puts a failed request's
   reason and a Retry button into the affected pane, so no pane is ever left
   stuck on a "Loading..." placeholder.
3. **Session keep-alive** - for `sess_` access tokens the client pings the
   account endpoint on an inactivity timer to keep the token alive; `destroy()`
   clears that timer. Always call `destroy()` to avoid a leaked interval.

Dialog interactions go through the injectable `confirmMethod` / `alertMethod`
(default to the browser's `confirm`/`alert`), so the UI can be wired to a host
app's modal system.

## Technology Stack

- **Module format**: ES modules only (`"type": "module"`, `export class ...`).
  This library is **not** CommonJS - do not convert it, and `require()` will not
  work on it.
- **Runtime**: browsers and Node.js (`engines.node >= 20`). No framework. The
  main consumer is EmailEngine, whose `copy-static-files.sh` copies `index.js`
  into its admin UI as `static/js/ee-client.js`, so the code must stay
  browser-safe (ESLint checks `index.js` against browser globals).
- **HTTP**: the platform `fetch`; `node-fetch` is an **optional** peer dependency
  used only as a Node fallback when `globalThis.fetch` is missing.
- **No runtime dependencies.** Keep it that way where practical - this is a
  client library meant to drop into a page or service without pulling a tree.

## Platform constraints

These come from EmailEngine, which ships as a `@yao-pkg/pkg` binary that snapshots a CommonJS module graph and cannot load ES modules. Every package EmailEngine `require()`s must therefore be CommonJS-loadable with `--no-experimental-require-module`. This package is the exception by design, and that is safe only because of how EmailEngine uses it:

- **EmailEngine never `require()`s it.** `copy-static-files.sh` copies `index.js` alone into `static/js/ee-client.js`, and `views/accounts/browse.hbs` loads it in the browser with `import { EmailEngineClient } from '/static/js/ee-client.js'` inside a `<script type="module">`. pkg ships it as a static asset and never executes it under Node, so it stays an ES module (see Code Style Rules) and there is no `require()` test to write.
- **What that use does require:** `index.js` stays self-contained, with no static `import`/`export ... from` (the copy has no `node_modules` or sibling files beside it), and browser-safe. The only `import()` is the `node-fetch` fallback, reached only in Node when `globalThis.fetch` is missing.
- **Node.js 20 is the minimum supported version.** Code, tests and tooling must work on Node 20, 22 and 24 (`engines.node` is `>=20.0.0`).
- **Check:** `npm run test:cjs` runs `test/static-copy.test.js`, which copies `index.js` alone to a temp directory, imports it as an ES module and checks the exports. The script name is shared with the other EmailEngine dependencies, where it runs the suite with require(esm) disabled; here it checks what EmailEngine actually loads. It is also part of `npm test`, and CI runs it as its own step on Node 22 and 24.
- Do not add runtime dependencies. If a dev dependency's next major is unusable (ESM-only config tooling is fine here, needing more than Node 20 is not), pin the last working major in `.ncurc.cjs` (`reject`, or a `target` of `minor`/`patch`) with a comment giving the reason.

## Development Commands

```
npm test                # node:test smoke tests (node --test test/*.test.js)
npm run test:cjs        # only the static-copy check (see Platform constraints)
npm run test:coverage   # the same under c8
npm run lint            # eslint . (flat config in eslint.config.js)
npm run lint:fix        # eslint . --fix
npm run format          # prettier --write .
npm run format:check    # prettier --check . (runs in CI)
npm run update          # refresh dependencies with npm-check-updates (ncu)
```

Run a single test by name: `node --test --test-name-pattern="escapes HTML" test/smoke.test.js`.

There is no build step - `index.js` ships as-authored.

## Build & Packaging

- **No build/bundle step.** The published `index.js` is the source `index.js`;
  browsers and bundlers consume it directly as an ES module. Do not add a
  transpile/minify step or a `dist/` output without a deliberate decision - the
  `example.html` demo and downstream consumers import `./index.js` as-is.
- Keep `index.d.ts` in sync with the public API by hand.

## Testing

- Tests use Node's built-in `node:test` runner and `node:assert/strict`, in
  `test/*.test.js`. `test/smoke.test.js` covers only the API-only (no DOM) side:
  exports, the factory guards, request building with `globalThis.fetch` mocked
  through `mock.method`, error shaping, `escapeHtml` and the keep-alive timer.
  The UI rendering half has no automated tests (it needs a DOM).
  `test/static-copy.test.js` checks the file as EmailEngine serves it (see
  Platform constraints).
- Treat green `npm run lint`, `npm run format:check` and `npm test` as the bar
  before committing.
- CI (`.github/workflows/test.yaml`) runs all three on Node 20, 22 and 24,
  plus `npm run test:cjs` on 22 and 24.

## Release Process

Releases are automated with **release-please**
(`.github/workflows/release.yaml`) - there is **no manual `npm version` /
`npm publish`** anymore.

- Every push to `master` runs release-please, which maintains a standing
  "release" PR that accumulates changelog entries from Conventional Commits.
- **Merging that release PR** is what cuts a release: it bumps the version in
  `package.json`, updates `CHANGELOG.md`, tags `vX.Y.Z`, creates the GitHub
  release, and publishes to npm with `npm publish --provenance --access public`.
- release-please state lives in `release-please-config.json` and
  `.release-please-manifest.json` (the manifest tracks the last released
  version). Do not hand-edit the version in `package.json` - release-please owns
  it.
- npm publishing uses **trusted publishing (OIDC)**: no npm token is stored. The
  `@postalsys/ee-client` package must have a trusted publisher on npmjs.com
  pointing at this repo's `release.yaml` workflow, or the publish step fails.

## Conventional Commits (required)

Commit messages drive releases, so use
[Conventional Commits](https://www.conventionalcommits.org/):

- `fix: ...` -> patch release (e.g. 1.3.0 -> 1.3.1)
- `feat: ...` -> minor release (e.g. 1.3.0 -> 1.4.0)
- `feat!: ...` / `fix!: ...`, or a `BREAKING CHANGE:` footer -> major release
- `chore:`, `docs:`, `test:`, `ci:`, `refactor:`, `style:` -> **no release**

Only `fix:` and `feat:` commits produce a release, so reserve them for
user-facing runtime changes. A non-conventional commit subject (no recognized
type) will not appear in the changelog and will not trigger a release - if a
user-facing change lands under such a subject, add a follow-up `fix:`/`feat:`
commit to release it.

For commits that do not change runtime behavior (docs, comments, CI/workflow
tweaks, formatting), append `[skip ci]` to the commit subject to avoid spending
CI minutes. **Exception:** never add `[skip ci]` to a `fix:`/`feat:` commit -
those must run so the release workflow fires.

## CI / GitHub Actions

- `test.yaml` - runs lint, format:check and `npm test` on Node 20, 22 and 24
  (plus `npm run test:cjs` on 22 and 24) for pushes to `master` and PRs.
- `release.yaml` - release-please + npm publish on pushes to `master`.

After pushing, check the runs (`gh run list --branch master`) and report their
status. If a run fails for an infrastructure reason (checkout "account
suspended", HTTP 403, other auth/infra errors unrelated to the change), check
https://www.githubstatus.com/ for an active incident before assuming the code is
at fault.

## Code Style Rules

- **Keep it ESM.** Use `import`/`export`; do not introduce CommonJS.
- **Escape all untrusted data before it reaches `innerHTML`.** This library
  renders attacker-controlled email content (subjects, addresses, names,
  filenames, folder names). Every such value must go through `escapeHtml()`.
  The single intentional exception is the message's own HTML body
  (`msg.text.html`), which `_renderMessageBody()` inserts as-is into a shadow
  root on `.ee-message-body` so host CSS classes and ids cannot reach it; do not
  add new raw-HTML sinks, and do not move the body back into the light DOM. When editing rendering code, confirm interpolated values
  are escaped.
- Formatting follows `.prettierrc` (4-space indent, single quotes, semicolons,
  160-column width, no trailing commas, `arrowParens: avoid`, `lf` line
  endings), the shared Postal Systems config. Run `npm run format` before
  committing.
- Linting uses the shared Postal Systems flat config (`eslint.config.js`, ES
  module form); repo-specific overrides go in its "Repo-specific" block with a
  one-line reason.
- Never use emojis in code or documentation; use printable ASCII. Use a single
  hyphen-minus (`-`) as a dash in user-facing strings - no em/en dashes.
- When composing git commit messages, do not include Claude or any AI
  assistant as a co-author (no `Co-Authored-By` trailer).

## Before committing code changes

1. `npm run format` and `npm run lint`
2. `npm test`
3. For non-trivial changes, consider `/simplify` and `/security-review` - this
   library renders untrusted email content, so rendering code is
   security-sensitive.

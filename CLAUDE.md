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

The `files` whitelist in `package.json` (`index.js`, `index.d.ts`, `README.md`,
`LICENSE`) is what actually gets published - `.npmignore` is secondary to it.

### Architecture of `index.js`

`EmailEngineClient` has three concerns interleaved in one class:

1. **API client** - `apiRequest(method, endpoint, data)` is the single choke
   point for every HTTP call. It resolves `fetch` (native in the browser and
   modern Node; falls back to a dynamic `import('node-fetch')` when the global
   is absent) and centralizes auth headers and error normalization
   (`_parseApiError` / `_formatSendError`). The data methods -
   `loadFolders`, `loadMessages`, `loadMessage`, `markAsRead`, `deleteMessage`,
   `moveMessage`, `sendMessage`, and attachment/source download - all go through
   it. Work in API-only mode with no `container`.
2. **UI rendering** - `createStyles`, `createLayout`, `renderFolderList`,
   `renderMessageList`, `renderMessage`, and the compose modal build the webmail
   interface by assembling HTML strings into `innerHTML`. Only active when a
   `container` is supplied.
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
- **Runtime**: browsers and Node.js (`engines.node >= 14`). No framework.
- **HTTP**: the platform `fetch`; `node-fetch` is an **optional** peer dependency
  used only as a Node fallback when `globalThis.fetch` is missing.
- **No runtime dependencies.** Keep it that way where practical - this is a
  client library meant to drop into a page or service without pulling a tree.

## Development Commands

```
npm run lint            # eslint *.js
npm run format          # prettier --write  (apply formatting)
npm run format:check    # prettier --check  (verify formatting; runs in CI)
npm test                # lint + format:check (there is no unit-test suite)
npm run update          # refresh dependencies with npm-check-updates (ncu)
```

There is no build step - `index.js` ships as-authored.

## Build & Packaging

- **No build/bundle step.** The published `index.js` is the source `index.js`;
  browsers and bundlers consume it directly as an ES module. Do not add a
  transpile/minify step or a `dist/` output without a deliberate decision - the
  `example.html` demo and downstream consumers import `./index.js` as-is.
- Keep `index.d.ts` in sync with the public API by hand.

## Testing

- There is **no unit-test suite** in this repository. `npm test` runs `lint` and
  `format:check` - treat a green `npm test` as the bar before committing.
- CI (`.github/workflows/test.yaml`) runs `npm test` on Node 22 and 24.
- If you add real tests, name them so a `test` script can find them and update
  this section plus the workflow.

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

- `test.yaml` - runs `npm test` (lint + format:check) on Node 22 and 24 for
  pushes to `master` and PRs.
- `codeql.yml` - CodeQL security/quality scanning of the JavaScript and the
  workflows (`example.html` is excluded via `.github/codeql/codeql-config.yml`).
  Review and resolve CodeQL alerts - this is a browser library that renders
  untrusted email content, so injection findings matter.
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
  (`msg.text.html`) in `renderMessage()`, which is inserted as-is; do not add
  new raw-HTML sinks. When editing rendering code, confirm interpolated values
  are escaped.
- Formatting follows `.prettierrc.json` (4-space indent, single quotes,
  semicolons, 120-column width, no trailing commas, `arrowParens: avoid`, `lf`
  line endings). Run `npm run format` before committing.
- Never use emojis in code or documentation; use printable ASCII. Use a single
  hyphen-minus (`-`) as a dash in user-facing strings - no em/en dashes.
- When composing git commit messages, do not include Claude as a co-author.
  </content>
  </invoke>

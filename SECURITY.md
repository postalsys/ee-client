# Security Policy

`@postalsys/ee-client` is the EmailEngine client library for browsers and
Node.js. In the browser it renders untrusted email content (subjects, sender and
recipient addresses, attachment names, folder names, and message bodies) into
the DOM, so its primary security surface is **cross-site scripting (XSS)** in the
message browser UI. It also handles EmailEngine access tokens. We take security
reports seriously and aim to respond quickly.

## Supported Versions

Security fixes are released only against the latest version. We do not backport
patches to older releases - upgrading to the current release line is the
supported way to receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

If you are on an older version, please upgrade. See the release notes at
<https://github.com/postalsys/ee-client/releases> before updating.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Report privately through one of the following channels:

1. **GitHub Security Advisories (preferred).** Open a private report at
   <https://github.com/postalsys/ee-client/security/advisories/new>. This keeps
   the discussion private until a fix is published and lets us credit you.
2. **Email.** Send details to **andris@postalsys.com** (the contact listed in
   [`SECURITY.txt`](SECURITY.txt)). Encrypt sensitive details if possible.

When reporting, please include as much of the following as you can:

- The affected version(s) and environment (`@postalsys/ee-client` version,
  browser or Node.js version, OS).
- The component involved (e.g. message list or message viewer rendering, the
  compose modal, attachment/source download, the API request layer, or session
  token keep-alive handling).
- A clear description of the issue and its impact (e.g. stored or reflected XSS,
  HTML/attribute injection, token leakage, SSRF, information disclosure).
- A minimal proof of concept - for XSS, the specific email field and payload
  (subject, address, filename, folder name, etc.) that is not correctly escaped.
- Any suggested remediation, if you have one.

We are a small team, so there is no guaranteed response time - sometimes reports
are handled within hours, sometimes they take longer. Accepted issues are fixed
in a new release and coordinated through a GitHub Security Advisory, and
reporters who wish to be named are credited.

## CVEs

We track and disclose vulnerabilities through GitHub Security Advisories. We do
not request or manage CVE identifiers ourselves. If you need a CVE assigned for a
reported issue, please request one yourself - for example, through GitHub's own
CVE request flow on the published advisory, or another CNA.

## Scope

In scope: the `@postalsys/ee-client` library source in this repository - the
message browser UI rendering (folder list, message list, message viewer, compose
modal), the escaping of untrusted email fields before insertion into the DOM,
the API request layer, attachment and message-source download, and access token
handling including the `sess_` keep-alive mechanism.

Out of scope:

- Vulnerabilities in your own application code that embeds this library.
- The behavior of the EmailEngine server itself, or any API it exposes - report
  those against EmailEngine, not this client.
- Rendering of a message's own HTML body: the client displays the HTML part of
  an email as delivered. Sanitizing or sandboxing hostile HTML mail (e.g. via an
  iframe or a sanitizer) is the responsibility of the embedding application and
  its deployment; this is a documented design boundary, not a client bug. Report
  a concrete bypass of the fields the client _does_ escape instead.
- Misconfiguration of your deployment - for example, serving the client over
  plain HTTP, or exposing access tokens in a shared or logged context.
- Social-engineering reports and missing security headers without a
  demonstrated, concrete impact.

Thank you for helping keep `@postalsys/ee-client` and its users safe.

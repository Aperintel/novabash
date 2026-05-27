# Security policy

NovaBash holds encrypted credentials for the services every team it serves runs on. A subtle bug in the vault, the token-rotation path, the audit log, or the SDK key-fetch flow can silently weaken the integrity guarantees an operator believes they have. We take security reports seriously and respond fast.

## Reporting a vulnerability

Please do not file a public GitHub issue for a security report.

Report security issues by email to **`enquiries@aperintel.com`** with the subject line `[NovaBash Security]`. Encrypt sensitive details with the maintainer's public key if you have it; otherwise plaintext is acceptable for an initial contact. Alternatively, open a private GitHub Security Advisory at `github.com/aperintel/novabash/security/advisories/new`.

Include in your report:

- The affected version or versions (the value of `version` in the relevant `package.json`, or the commit SHA if you are testing `main` or `develop`).
- A clear description of the issue and the impact you observed.
- A minimal reproducer if you have one.
- Whether you have publicly disclosed any part of the issue already (and where).
- Any proposed fix or mitigation, if you have one in mind.

You will receive an acknowledgement within **72 hours**. We aim to confirm whether the report reproduces and to share a preliminary fix timeline within **7 days**. For critical issues affecting the vault, signing path, token-rotation flow, or any credential leak, we will prioritise a patch release within **14 days** of confirmation.

## Disclosure policy

We follow coordinated disclosure. Once a fix is released, we will:

- Publish a GitHub Security Advisory describing the issue, the affected versions, the fix, and any required operator action (notably credential rotation if a leak vector existed).
- Credit the reporter in the advisory by name and link, unless the reporter requests anonymity.
- Bump the affected package or packages and note the security fix in the changelog.

We do not run a paid bug-bounty programme at this time. We are happy to acknowledge reporters publicly and to provide a written reference for security researchers who help us.

## Scope

In scope:

- The `apps/web` Next.js application (dashboard, marketing, community catalogue).
- The `apps/api` Fastify service (vault, validation, audit log, rotation endpoints).
- The `@novabash/cli` package (init, login, pull, status, rotate).
- The `@novabash/sdk` libraries.
- The `gh-action` GitHub Action.
- The `vscode-ext` Visual Studio Code extension.
- The `@novabash/db` Drizzle schema and migrations.

Out of scope:

- Operator misconfiguration (for example, committing a workspace key to a public repo).
- Vulnerabilities in dependencies that we cannot fix from our side; please report those upstream and let us know so we can pin or work around.
- Generic denial-of-service issues against any service the operator chooses to provision through NovaBash.

## Supported versions

Security fixes are backported to the current minor line on Phase A. Once Phase B ships, we will publish a fuller support matrix.

| Version line | Supported |
|---|---|
| 0.1.x         | Yes |
| `main`        | Tracking |

## Vault and credential guarantees

NovaBash uses well-established primitives from established libraries for the credential plane. We do not roll our own crypto. The vault performs envelope encryption with KMS-owned data keys; per-secret values are never written to disk in plaintext.

If you find a soundness issue in a primitive itself, please report it upstream first; we will track the fix and bump our pin.

## Thank you

Independent reviewers and security researchers materially improve the integrity guarantees the platform offers. If you have spent time investigating, please tell us. We would rather hear about a problem than not.

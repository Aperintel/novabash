# Contributing to NovaBash

Thank you for considering a contribution. NovaBash is the BYOK developer-infrastructure platform that wraps the services every team needs around one vault, one `.env`, and one workspace. The most useful contributions are usually one of: a clear bug report, a focused pull request against an existing open issue, a new service adapter for the catalogue, a documentation fix, or a question on a design decision that we should write up.

## Before you start

1. **Read the README.** Understand the workspace, vault, CLI, and bundle catalogue model before proposing changes.
2. **Check the open issues.** If your idea overlaps an existing one, comment on that thread rather than opening a duplicate.
3. **For larger changes, open an issue first.** A new service adapter, a new bundle in the first-party catalogue, a new CLI subcommand, or anything that touches the vault, the rotation flow, or the audit log needs a design discussion before code. We are happy to scope the work with you so the PR lands cleanly.

## How to file a good bug report

Use the bug report issue template. The information the template asks for is the information we need to reproduce; please fill it in even if the answer is "default".

The three highest-signal items are:

- A minimal reproducer. Even three lines that fail is better than a verbal description.
- The CLI command line, plus the full output (use `--debug` if available).
- The relevant package version (the `version` field in the package's `package.json`).

## How to file a good feature request

Use the feature request issue template. The two highest-signal items there are:

- What you are trying to do at the workspace-or-service level, not the API level. We can often satisfy the use case with an existing primitive plus a docs example.
- Whether you would accept building it yourself with guidance, or whether you are asking us to build it. Both are fine; we just need to know.

## How to propose a new service adapter for the catalogue

A service adapter is a small TypeScript module under `packages/adapters/` that implements the standard adapter interface (provision, deprovision, rotate, status). Adapter PRs are welcome.

For a new adapter:

1. Open an issue first describing the service (vendor, what it provides, whether the provider already publishes an SDK).
2. Confirm the service exposes a key-rotation path (NovaBash's rotation guarantees depend on it).
3. Implement the four interface methods plus the unit test fixture that lives in `packages/adapters/__fixtures__/`.
4. Add the adapter to the registry in `packages/adapters/src/index.ts`.
5. Add an entry to `apps/web/src/lib/community-mock.ts` under the relevant first-party bundle if the adapter belongs in one of the launch bundles.

## Pull requests

Keep PRs focused. One adapter, one feature, or one fix per PR. If you find yourself touching unrelated code, that is a separate PR.

Local development setup:

```bash
git clone https://github.com/aperintel/novabash.git
cd novabash
pnpm install
pnpm dev
```

Before pushing, please run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

A PR is ready for review when:

1. CI is green on every supported workspace package.
2. New code has tests. Adapters in particular must have happy-path plus failure-mode tests.
3. Public API changes update the README and the relevant docstring.
4. The PR description names the issue it closes, summarises the change in plain English, and notes any operator-visible impact (changes to CLI flags, env variable names, vault schema, audit-log shape).

We use small, clean commits. Squash if your branch history is messy; we will squash on merge if not.

## Coding style

Code follows the rules `eslint` and `tsc --strict` enforce. We do not add stylistic comments beyond those tools' expectations. Comments are reserved for non-obvious decisions that a future reader would otherwise have to reverse-engineer.

British English in user-facing strings (CLI output, web copy, error messages). American English is fine inside variable names that follow third-party convention (for example, `color` if it appears in a library we depend on).

No em-dashes (`—`), no stylistic en-dashes (`–`), and no `--` used as a sentence dash in any user-facing string. Compound-word hyphens (`real-time`, `BYOK`, `tamper-evident`) are fine and expected. CLI flags (`--rotate`, `--no-cache`) are literal command syntax and obviously fine.

## Vault, audit, and rotation changes

Any PR that touches the vault encryption path, the audit-log append protocol, the rotation flow, or the workspace-key handling requires extra care. Please:

- Open an issue first to discuss the change.
- Provide test cases that cover the new behaviour and that demonstrate existing workspaces still decrypt under the change.
- Include a paragraph in the PR description explaining why the change is sound and what the new threat-model coverage is.

We do not roll our own crypto. If you propose adding a new primitive, point us at the standard or the audited library that provides it.

## Code of Conduct

This project follows the Contributor Covenant v2.1. Read it in `CODE_OF_CONDUCT.md`. Contact the maintainer at `enquiries@aperintel.com` for any concerns.

## Licence

By submitting a contribution, you agree that your work will be licensed under the project's licence (see `LICENSE`). The `CONTRIBUTORS.md` file lists everyone whose work has shipped in a release.

## Questions

If something is not covered here, open a GitHub Discussion or a low-priority issue tagged `question`. We would rather answer a question than have you guess.

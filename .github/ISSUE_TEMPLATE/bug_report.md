---
name: Bug report
about: Report a defect in the platform, CLI, SDK, or any adapter
title: "[Bug] "
labels: bug
assignees: ''
---

## What happened

A clear description of the unexpected behaviour.

## What you expected

A clear description of what you thought should happen.

## How to reproduce

Minimal code or command (ideally five to ten lines) that triggers the bug. Even better: a self-contained repro a maintainer can paste into a fresh workspace.

```bash
# paste the command line that fails, plus the full output
$ novabash ...
```

If the bug is in the web app, paste the URL plus the steps the user took plus what they saw versus what they expected.

If the bug is in the CLI, paste the command line, the flags, the env, and the output (use `--debug` if available).

If the bug is in an adapter, name the adapter and paste the relevant rotation or validation output.

## Environment

- Affected package: `@novabash/cli` / `@novabash/sdk-node` / `apps/web` / etc.
- Version: paste the value of `version` in the package's `package.json`, or the commit SHA if you are on `main` or `develop`.
- Node version: `node --version`
- Operating system and version:
- Workspace ID or vault region (do NOT paste the workspace key itself):

## Logs or traceback

If the platform raised, paste the full traceback inside a code block. Redact any tokens or workspace keys before pasting.

```
paste the full traceback or error output here
```

## Anything else

Context, screenshots, related issues, links to the application you are integrating into.

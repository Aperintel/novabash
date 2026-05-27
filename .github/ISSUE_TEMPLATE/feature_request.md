---
name: Feature request
about: Propose a new capability, adapter, or bundle
title: "[Feature] "
labels: enhancement
assignees: ''
---

## Use case

What are you trying to accomplish at the workspace or service level? Describe the user problem first, not the API shape you have in mind. A good test is whether someone reading just this paragraph would understand why this matters.

## Proposed shape

How you would expect to interact with the feature. Concrete is better than abstract. If you have an API or CLI sketch:

```bash
# show the command line or call site you wish you could write
novabash ...
```

If the request is for a new service adapter, include the vendor name, what the service provides, and the link to their key-rotation API documentation.

If the request is for a new bundle in the first-party catalogue, name the bundle and list the services it would include.

## Alternatives considered

If you have already tried something with the current platform, describe what you tried and why it did not fit. This helps avoid suggesting things you have already ruled out.

## Scope question

- Could this be solved with an existing primitive plus a docs example, instead of new platform code?
- Is this a thin layer on top of NovaBash, or does it require a change to the vault, the rotation flow, or the audit-log shape?
- Would you be willing to implement it with maintainer guidance, or are you asking us to build it? Both are fine; we just need to know.

## Related issues or PRs

Link any prior discussion that touches the same ground.

# NovaBash

[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)

BYOK developer infrastructure platform. One workspace, one encrypted vault, one `.env`, every third-party service your stack runs on. Phase A complete; tagged at [`v0.1.0-phase-a`](https://github.com/aperintel/novabash/releases/tag/v0.1.0-phase-a).

NovaBash sits between a development team and the long tail of services they sign up for (Supabase, Vercel, Stripe, Resend, OpenRouter, Upstash, Cloudflare, and the rest). The workspace owns the keys; NovaBash provisions, rotates, and audits them; the team pulls a single `.env` and gets to work.

## What it gives you

- **One vault for every service the project consumes.** Envelope-encrypted with KMS-owned data keys. The platform never sees plaintext credentials.
- **One `.env` to pull.** The CLI fetches the workspace's current credentials into a project-local `.env` you can commit to `.gitignore` but never to source control.
- **Curated stack bundles.** Six first-party bundles (Launchpad, Builder AI, Edge Stack, Data Stack, Mobile First, Enterprise Ready) plus a community catalogue, each a vetted combination of services that ship together.
- **Audit log over every key event.** Every provision, rotation, and pull writes to a tamper-evident append-only log, so the team can answer "when did this credential last change" without grepping their inbox.
- **Native rotation flow.** `novabash rotate <service>` rotates the key at the vendor, updates the vault, writes the audit entry, and notifies any tooling that uses the key. The team rotates without redeploying.

## Layout

```
apps/
  web/                 Next.js 14 app router. Marketing site, sign-in,
                       dashboard, community catalogue, and the API routes
                       that back the vault and the rotation flow.
packages/
  cli/                 @novabash/cli. CLI for init, login, pull, status, rotate.
  sdk-node/            @novabash/sdk-node. Programmatic access for Node apps.
  adapters/            One module per third-party service. provision, deprovision,
                       rotate, status.
  db/                  Drizzle schema and migrations.
  ui/                  Shared design primitives consumed by apps/web.
  brand/               Logo, icon set, design tokens.
  gh-action/           GitHub Action that pulls the workspace .env at CI time.
  vscode-ext/          Visual Studio Code extension for in-editor pull / status.
```

The platform deploys as a single Vercel project; there is no separate API host. Phase A consolidated the formerly-separate Fastify API into the Next.js app routes under `apps/web`.

## Quick start

```bash
# install the CLI globally
npm install -g @novabash/cli

# create a workspace (one-time)
novabash init

# log in to the workspace
novabash login

# pull the current credentials into ./.env
novabash pull

# check live state
novabash status

# rotate one credential
novabash rotate supabase
```

The workspace homepage and bundle catalogue live at [novabash.dev](https://novabash.dev).

## Development

```bash
git clone https://github.com/aperintel/novabash.git
cd novabash
pnpm install
pnpm dev
```

Before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

The build plan, deploy runbook, and Phase B roadmap live in private planning files outside the repo. The public-facing roadmap is the [open issues](https://github.com/aperintel/novabash/issues) on this repo.

## Contributing

Bug reports, feature requests, and adapter PRs all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the shape of a clean PR, the adapter interface, and the cryptographic-change review process. Security disclosure policy is in [SECURITY.md](SECURITY.md).

NovaBash is maintained by [Aperintel](https://github.com/aperintel). It is one of several products under the Aperintel umbrella, alongside the [Nexuscone](https://github.com/aperintel/nexuscone) audit substrate and other governance-first AI infrastructure.

## Licence

Apache 2.0. See [LICENSE](LICENSE).

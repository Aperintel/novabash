# NovaBash

Phase A BYOK developer infrastructure platform. One workspace, one encrypted vault,
one `.env`, six curated stack bundles, plus a community catalogue.

## Layout

```
apps/
  web/          Next.js 14 app router. Marketing site, sign-in, dashboard.
  api/          Fastify on Railway. Vault, validation, audit log.
packages/
  cli/          @novabash/cli. CLI for init, login, pull, status, rotate.
  db/           Drizzle schema and migrations.
  ui/           Shared design primitives consumed by apps/web.
  brand/        Logo, icon set, design tokens.
```

## Status

Pre-launch holding-page-and-skeleton stage. Real auth, real vault, and real
provisioning land per `NovaBash_Build_Plan_v1.2.txt`.

## Development

```
pnpm install
pnpm dev
```

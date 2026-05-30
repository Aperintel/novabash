# NovaBash

[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)

A local-first vault for the API keys and service credentials your projects run
on. Your keys are encrypted in your browser and never leave your machine. There
is no account to create and no server holding your secrets.

> **v0.2, local-first.** NovaBash started as a hosted, multi-user platform. It is
> being rebuilt as a local-first tool: no backend, no logins, no subscription. If
> you are looking at the older hosted design, it has been retired. This README
> describes the local-first product.

## What it does

- **An encrypted vault that stays on your device.** Keys are encrypted in the
  browser with AES-256-GCM, under a key derived from a passphrase you choose. The
  encrypted vault lives in your browser's local storage. NovaBash has no server
  and never sees your secrets.
- **One `.env`, generated locally.** Pick the services a project needs and
  download a single `.env`. Nothing is uploaded.
- **Multiple environments.** Keep separate values per environment (development,
  staging, and production by default, plus any you add) and generate the right
  `.env` for each.
- **A 24-word recovery phrase.** Set when you create the vault, it is the way
  back in if you forget your passphrase, and it powers changing your passphrase.
  Lose both the passphrase and the phrase and the vault is gone, by design.
- **Curated stack bundles.** Common combinations of services (a starter stack, an
  edge stack, a data stack, and more) ship as ready-made templates you can apply
  and fill in.
- **A tamper-evident audit trail, kept locally.** Every change to the vault is
  recorded in a hash-chained log inside the vault itself, so you can verify that
  your own history has not been altered. No telemetry, no phone-home.
- **Encrypted backup and transfer.** Export the vault as a single encrypted file
  to back it up or move it to another machine, then import it there.

## Why local-first

A small team or a solo developer does not need a third party to hold their API
keys. Keeping the vault on your own device removes the account, the monthly bill,
and the question of who else can read your secrets. The trade is that you manage
your own backups (the encrypted export file) rather than relying on a server.

## Quick start

NovaBash runs entirely in your browser.

1. Open the app (the live build is on Cloudflare Pages; the URL is in the repo
   description).
2. Set a vault passphrase. This derives the encryption key. It is never stored
   and never sent anywhere, so keep it safe; without it the vault cannot be
   decrypted.
3. Add your services and their keys, or apply a stack bundle and fill in the
   values.
4. Click generate to download a `.env` for the project you are working on.
5. Export the encrypted vault file whenever you want a backup.

To run it yourself:

```bash
git clone https://github.com/aperintel/novabash.git
cd novabash
pnpm install
pnpm dev      # local dev server
pnpm build    # static build, output ready for any static host
```

## How the encryption works

- The vault is encrypted with AES-256-GCM using the Web Crypto API.
- The encryption key is derived from your passphrase with a slow key-derivation
  function, so the passphrase is never stored and a stolen vault file is useless
  without it.
- The encrypted blob is held in your browser's IndexedDB and, on export, written
  to a single encrypted file.

## Security

Read [SECURITY.md](SECURITY.md) before you trust NovaBash with real keys. The
short version: a browser-based vault is a convenience tool with a real threat
model. The main risk is cross-site scripting, which on any client-side vault can
expose decrypted secrets while the vault is unlocked. NovaBash mitigates this
with a strict Content-Security-Policy, no third-party scripts, no analytics, and
encryption at rest, but it is not a substitute for a hardware-backed secrets
manager in a high-security setting. For the strongest posture, use the local
command-line mode (on the roadmap), which keeps the vault off the browser
entirely.

## Stack bundles

Bundles are static templates, a named set of services that commonly ship
together, with the environment variables each one needs. Apply a bundle, fill in
your own values, and generate the `.env`. You can also import a bundle file
someone has shared.

## Roadmap

- A command-line mode that operates on a local encrypted vault file, for users
  who would rather not keep secrets in a browser at all.
- More first-party bundles.
- Optional rotation helpers that call a vendor's own rotation API directly from
  your machine using your own credentials.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
NovaBash is maintained by [Aperintel](https://github.com/aperintel).

## Licence

Apache 2.0. See [LICENSE](LICENSE).

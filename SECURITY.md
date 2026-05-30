# Security

NovaBash is local-first. There is no NovaBash server, no account, and no database
holding your secrets. The vault is encrypted in your browser and stored on your
own device. This page explains the threat model honestly so you can decide what
to trust it with.

## How your data is protected

- The vault is encrypted with AES-256-GCM using the Web Crypto API.
- The encryption key is derived from your passphrase with a slow key-derivation
  function. The passphrase is never stored and never transmitted.
- The encrypted vault is held in your browser's IndexedDB, and any export is a
  single encrypted file. Without the passphrase, a copied vault or export file is
  useless.
- NovaBash sends no telemetry and loads no third-party scripts. There is nowhere
  for your keys to be sent.

## The honest threat model

A vault that decrypts secrets in a browser has a real exposure: cross-site
scripting. If malicious script runs in the page while your vault is unlocked, it
can read decrypted secrets, the same as any client-side secrets tool. NovaBash
reduces this risk but cannot remove it:

- A Content-Security-Policy that confines scripts, styles, fonts, and network
  calls to the app's own origin and blocks third-party code, plugins, and
  framing (shipped as the Cloudflare Pages `_headers` file).
- No analytics, no external trackers, no remote fonts or scripts.
- Subresource integrity on anything served from outside the app.
- The vault stays locked until you enter the passphrase, and the derived key is
  held only in memory for the session.

This makes NovaBash a good convenience vault for a developer's own keys. It is
not a hardware-backed enterprise secrets manager, and you should not treat it as
one for high-value production credentials. For the strongest posture, use the
command-line mode (on the roadmap), which keeps the vault out of the browser
entirely.

## Your responsibilities

- Choose a strong passphrase and keep it safe. If you lose it, the vault cannot
  be recovered.
- Keep your own backups by exporting the encrypted vault file. There is no server
  copy.
- Run NovaBash only on a device and browser you trust.

## Reporting a vulnerability

This is an early, experimental project. If you find a security issue, please open
a GitHub issue describing it, or email enquiries@aperintel.com with the subject
`[NovaBash Security]`. Do not include real secrets or live keys in the report.

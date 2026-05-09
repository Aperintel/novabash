# NovaBash brand system

## Position

NovaBash is a BYOK developer infrastructure platform. The brand has to read as
a serious tool a senior engineer would trust with their workspace credentials,
not as a startup landing page. The visual language is closer to a high-end
terminal emulator or a piece of audio mastering software than to a
consumer SaaS.

## What is unique to NovaBash

The blueprint and prototype share the dev-infra genre with Vercel, Resend,
Linear, Trigger.dev, Inngest, Railway, and Cursor. Inside that genre,
NovaBash distinguishes itself on three axes:

1. The mark is a brace pair with a key-line through the gap, not a single
   character in an accent square.
2. The mono is Commit Mono, not JetBrains Mono.
3. The palette is enforced down to six functional colours (bg, fg ladder, gold,
   ember, mint), with all other hues banned from the product surface.

These three constraints are the brand's fingerprint. They are deliberately
small but they are inviolable.

## The mark

The mark is two geometric braces, `{` and `}`, pulled apart, with a hairline
key-line bridging the gap and a key-cap dot at the centre.

Readings:
- Literal: `{ key }`. The product holds your service keys inside your
  workspace braces.
- Architectural: a sealed vault with a single bridge in.
- Negative-space: an N silhouette when the eye joins the brace tips.

Geometry, on a 24x24 grid:

- Left brace: `M 8,4 L 6,4 L 6,11 L 4,12 L 6,13 L 6,20 L 8,20`
- Right brace: `M 16,4 L 18,4 L 18,11 L 20,12 L 18,13 L 18,20 L 16,20`
- Key-line: `M 7,12 L 17,12` (1px, gold)
- Key-cap dot: circle r=1.5 at (12,12), ember

Colour rules:
- Mark on dark surface: braces in `--gold`, key-line in `--gold`, dot in `--ember`.
- Mark on light surface: braces in `--bg`, key-line in `--bg`, dot in `--gold-deep`.
- Monochrome variant: everything in single colour, dot becomes the only solid fill.

Minimum size: 16px. Below 16px, drop the key-line and keep braces + dot only.

## The wordmark

"NovaBash" set in **Onest 800** at -0.04em letterspacing, optical kerning between
"v" and "a", "B" and "a". The "N" cap-height matches the mark height. The gap
between mark and wordmark equals one stroke width of the mark (~1.5px at base).

Capitalisation rule: always written `NovaBash` in body copy (one word, two caps).
Never `Novabash`, never `novabash` except in CLI commands and URL paths where
lowercase is forced by the medium.

Lockup variants:
- `mark-only` — favicon, app icon, loading states, avatar
- `horizontal` — default lockup, top bar, marketing hero
- `stacked` — square avatars where horizontal does not fit
- `wordmark-only` — footers, watermarks, very wide hairline rules

## Typography

| Use                    | Font            | Weight  | Tracking  |
| ---------------------- | --------------- | ------- | --------- |
| Display headlines      | Onest           | 800     | -0.045em  |
| Section headings       | Onest           | 700     | -0.03em   |
| UI labels              | Onest           | 500     | -0.005em  |
| Body prose             | Onest           | 400     | -0.005em  |
| Body emphasis          | Onest           | 600     | -0.005em  |
| Technical UI / code    | Commit Mono     | 400-600 | 0         |
| Eyebrows / numerals    | Commit Mono     | 500     | +0.1em    |

Onest is loaded via `next/font` at weights 400/500/600/700/800/900.
Commit Mono is loaded via the open `@fontsource/commit-mono` package
(weights 400/500/600), with JetBrains Mono retained as a fallback for users
on locked-down corporate networks where the Commit Mono stylesheet fails.

## Palette

Functional only. No decorative hues. Anything outside this list is a bug.

### Surfaces

| Token             | Hex       | Use                                                      |
| ----------------- | --------- | -------------------------------------------------------- |
| `--bg`            | `#0A0A0A` | Page background, default surface                          |
| `--bg-elev`       | `#111111` | First-elevation cards, the terminal hero, modals          |
| `--bg-elev-2`     | `#161616` | Second-elevation surfaces, table rows on hover            |
| `--bg-elev-3`     | `#1C1C1C` | Inset surfaces, code blocks, vendor tile insets           |
| `--hairline`      | `#1F1F1F` | Default 1px borders                                       |
| `--hairline-bright` | `#2A2A2A` | Borders on hover, focused inputs, separators near content |

### Text

| Token         | Hex       | Use                                              |
| ------------- | --------- | ------------------------------------------------ |
| `--fg`        | `#FAFAFA` | Primary text, headlines                          |
| `--fg-mid`    | `#A0A0A0` | Body prose, supporting copy                      |
| `--fg-dim`    | `#606060` | Eyebrows, captions, disabled labels              |
| `--fg-fade`   | `#3A3A3A` | Numeric prefixes, very low-emphasis chrome       |

### Brand

| Token           | Hex         | Use                                                              |
| --------------- | ----------- | ---------------------------------------------------------------- |
| `--gold`        | `#C9A84C`   | Primary brand colour, mark, primary CTA, brand text accents       |
| `--gold-bright` | `#E2C070`   | Hover state on gold, focus rings                                  |
| `--gold-deep`   | `#8A6E2A`   | Pressed state on gold, mark on light surfaces                     |
| `--gold-fade`   | `rgba(201,168,76,0.10)` | Tinted backgrounds, selection on gold rows         |

### Signal

| Token         | Hex         | Use                                                            |
| ------------- | ----------- | -------------------------------------------------------------- |
| `--ember`     | `#FF7A2E`   | The brand-fingerprint signal. Active workspace, live key-rotation, key-cap dot in the mark, pulse on the validating state |
| `--ember-fade` | `rgba(255,122,46,0.12)` | Tinted active-row background, active dot halo        |
| `--mint`      | `#5BD9C2`   | OK / healthy signal. Connected services, validated keys, completed steps |
| `--mint-fade` | `rgba(91,217,194,0.12)` | Tinted OK background                                  |

Banned from product surfaces: blue, purple, magenta, red, green, amber, cyan,
any colour outside the list above. The legacy blueprint coral/amber/green
are retired from Phase A.

### Status mapping

| State        | Surface       | Text       |
| ------------ | ------------- | ---------- |
| connected    | `--mint-fade` | `--mint`   |
| validating   | `--ember-fade` | `--ember` |
| key rotating | `--ember-fade` | `--ember` |
| free-tier near limit | `--ember-fade` | `--ember` |
| disconnected | `--bg-elev-3` | `--fg-dim` |
| error        | `--ember-fade` | `--ember` (error and warning collapse to ember; failure is a workflow state, not a colour family) |

## Iconography

A custom 24x24 line-icon set lives at `packages/brand/icons/`. Rules:

- 24x24 viewBox, 1.5px stroke, butt linecaps, miter linejoins, no rounding.
- Only 0, 45, 90, 135, 180, 225, 270, 315 degree angles. No arbitrary curves
  except where the geometry of the represented object demands it (key-tooth,
  vault dial).
- Stroke colour is `currentColor` so the icon picks up its parent's colour.
- Filled fills are forbidden in navigation icons. Status icons use a single
  filled dot inside an outline ring.
- Credential-related icons (vault, key, rotate, validate, regenerate, env)
  carry the same single-tooth notch as the brand mark, so the geometry
  threads through the whole product.

Catalogue (v0):

```
nav/        overview, stacks, workspace, vault, services, community, billing, settings
status/     ok, validating, rotating, idle, error
action/     download-env, copy, rotate, validate, regenerate, fork, star, share, delete, expand, search
data/       database, function, queue, email, payment, model, edge, storage, log
```

No emoji is permitted in any product surface (UI, marketing site, app shell,
emails, CLI output). This is a hard rule.

## Motion

- Duration: 150ms for state changes, 250ms for entry, 600ms for the mark
  intro on the holding page.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` for everything. No bouncing,
  no overshoot.
- The cursor blink in terminal hero is the only continuous animation
  permitted in default state. The ember key-cap dot pulses only when
  the workspace is actively rotating.

## Voice (for any user-facing copy that ships under the NovaBash brand)

NovaBash inherits the global Julius/Osi voice rules from
`C:/Users/juliu/.claude/CLAUDE.md`. Concretely for product copy:

- No em-dashes, no en-dashes used as breaks, no double-hyphens.
- No banned vocabulary list (delve, leverage, harness, robust, seamless,
  empower, transform, redefine, paradigm, ecosystem, etc.).
- No banned paragraph-turn templates ("Here's the thing", "The truth is",
  "Here's why", "But wait", etc.).
- Long flowing sentences with conjunctions, not staccato chains.
- British English, Oxford comma.
- Direct and technically confident, slightly sardonic about how
  unnecessarily hard the current state of the world is.
- No marketing clichés: no "infrastructure operating system", no "X tax"
  framing, no "[X] layer" feature naming, no "Built for [audience]",
  no "Ready to X?" CTAs.

If a sentence could appear unchanged on five other SaaS landing pages, it
does not ship.

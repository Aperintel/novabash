/**
 * Transactional email templates. Plain string + minimal-HTML pair per
 * email. Resend prefers both bodies and falls back to text for clients
 * that block HTML.
 *
 * Voice rules apply: no em-dashes, no banned vocab, no AI paragraph turns.
 * Each email opens with a sentence that does not sound like a marketing
 * automation greeting.
 *
 * The day-N cadence below comes from build guide line 871 (5 emails over
 * 14 days).
 */

export interface EmailTemplate {
  id: string;
  subject: string;
  preheader: string;
  text: (ctx: TemplateContext) => string;
  html: (ctx: TemplateContext) => string;
  sendOnDay: number; // days after sign-up
}

export interface TemplateContext {
  recipientName?: string;
  workspaceSlug?: string;
  workspaceKeyMasked?: string;
  bundleName?: string;
  envFileCount?: number;
  totalServices?: number;
  daysOnPlatform?: number;
  monthlyCostEstimate?: string;
  rotationsDue?: number;
}

const baseUrl = 'https://novabash.dev';
const greeting = (name?: string) => (name ? `${name},` : 'Hi,');

const wrapHtml = (body: string) => `<!doctype html>
<html lang="en-GB">
  <body style="background:#0a0a0a;color:#a0a0a0;font-family:'Onest',-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.65;margin:0;padding:32px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;">
      <tr><td style="padding:28px 32px;border-bottom:1px solid #1f1f1f;">
        <span style="display:inline-block;width:18px;height:18px;background:#c9a84c;color:#0a0a0a;font-family:monospace;font-size:11px;text-align:center;line-height:18px;">{ }</span>
        <span style="color:#fafafa;font-weight:800;letter-spacing:-0.03em;margin-left:8px;font-size:15px;">NovaBash</span>
      </td></tr>
      <tr><td style="padding:28px 32px;color:#a0a0a0;">${body}</td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #1f1f1f;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:#606060;">
        © 2026 Aperintel · <a href="${baseUrl}/privacy" style="color:#606060;">privacy</a> · <a href="${baseUrl}/terms" style="color:#606060;">terms</a>
      </td></tr>
    </table>
  </body>
</html>`;

export const onboardingEmails: EmailTemplate[] = [
  {
    id: 'welcome',
    subject: 'Workspace ready · {{workspaceSlug}}',
    preheader: 'Where to find your workspace key, and what to do first.',
    sendOnDay: 0,
    text: (ctx) =>
      `${greeting(ctx.recipientName)}

Your NovaBash workspace ${ctx.workspaceSlug ?? ''} is live. The workspace key has been generated and shown to you once on the activation screen, and the only place it now exists in plaintext is wherever you stored it (a password manager is the right answer).

A few things you can already do today:

  1. Pull the .env from your terminal:
     npm i -g @novabash/cli && novabash login
     novabash pull --env development

  2. Check the dashboard at ${baseUrl}/dashboard for live usage from every connected service.

  3. Set rotation reminders for any key that is older than the default ninety-day cycle, on the same dashboard.

If anything in the connect flow tripped you up, write back to this email and one of us reads it.

Osi, NovaBash`,
    html: (ctx) =>
      wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>Your NovaBash workspace <code>${ctx.workspaceSlug ?? ''}</code> is live. The workspace key has been generated and shown to you once on the activation screen, and the only place it now exists in plaintext is wherever you stored it (a password manager is the right answer).</p>
<p>A few things you can already do today:</p>
<ol>
<li>Pull the .env from your terminal: <code>npm i -g @novabash/cli &amp;&amp; novabash login &amp;&amp; novabash pull</code>.</li>
<li>Check the dashboard at <a href="${baseUrl}/dashboard" style="color:#c9a84c;">${baseUrl}/dashboard</a> for live usage from every connected service.</li>
<li>Set rotation reminders for any key older than the default ninety-day cycle, on the same dashboard.</li>
</ol>
<p>If anything in the connect flow tripped you up, write back to this email and one of us reads it.</p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
  },
  {
    id: 'cli-tour',
    subject: 'Three CLI commands worth knowing',
    preheader: 'pull, status, rotate. That is most of it.',
    sendOnDay: 2,
    text: (ctx) =>
      `${greeting(ctx.recipientName)}

If you only ever learn three NovaBash CLI commands, these are the right three.

  novabash pull               write the .env for the active environment
  novabash status             every service's health, key age, and burn rate
  novabash rotate <service>   rotate the credential and regenerate every .env

The CLI is open source and lives at github.com/novabash/cli. Pull requests welcome, issues read.

Osi, NovaBash`,
    html: (ctx) =>
      wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>If you only ever learn three NovaBash CLI commands, these are the right three.</p>
<pre style="background:#0a0a0a;border:1px solid #1f1f1f;padding:16px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#fafafa;">novabash pull               write the .env for the active environment
novabash status             every service's health, key age, and burn rate
novabash rotate &lt;service&gt;   rotate the credential and regenerate every .env</pre>
<p>The CLI is open source and lives at <a href="https://github.com/novabash/cli" style="color:#c9a84c;">github.com/novabash/cli</a>. Pull requests welcome, issues read.</p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
  },
  {
    id: 'rotation-and-health',
    subject: 'Key Health is on by default',
    preheader: 'What the four signals mean and what to do about red.',
    sendOnDay: 5,
    text: (ctx) =>
      `${greeting(ctx.recipientName)}

Every credential in your vault is graded on four signals: age, validity, scope, and exposure. The dashboard shows them as a single traffic-light status with a chevron-expand for the breakdown.

If anything goes red:
  age      rotate via the CLI or the dashboard rotate button
  validity check the vendor side; the key was likely rotated outside NovaBash
  scope    your key has more permission than the bundle needs; recommend tightening it
  exposure (Phase B) we received a leak alert from GitHub or a similar source

Yellow means take a look. Green means do nothing.

You currently have ${ctx.rotationsDue ?? 0} rotation${ctx.rotationsDue === 1 ? '' : 's'} due in the next thirty days.

Osi, NovaBash`,
    html: (ctx) =>
      wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>Every credential in your vault is graded on four signals: <strong>age, validity, scope, exposure</strong>. The dashboard shows them as a single traffic-light status with a chevron-expand for the breakdown.</p>
<table cellspacing="0" cellpadding="6" style="font-family:'JetBrains Mono',monospace;font-size:12px;">
<tr><td style="color:#5bd9c2;">age</td><td>rotate via the CLI or the dashboard rotate button</td></tr>
<tr><td style="color:#5bd9c2;">validity</td><td>vendor side; the key was likely rotated outside NovaBash</td></tr>
<tr><td style="color:#5bd9c2;">scope</td><td>key has more permission than the bundle needs; recommend tightening it</td></tr>
<tr><td style="color:#5bd9c2;">exposure</td><td>(Phase B) leak alert from GitHub or a similar source</td></tr>
</table>
<p>Yellow means take a look. Green means do nothing.</p>
<p>You currently have <strong>${ctx.rotationsDue ?? 0}</strong> rotation${ctx.rotationsDue === 1 ? '' : 's'} due in the next thirty days.</p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
  },
  {
    id: 'community',
    subject: 'Bundles other people are forking',
    preheader: 'Star a bundle, fork a stack, publish your own.',
    sendOnDay: 9,
    text: (ctx) =>
      `${greeting(ctx.recipientName)}

If your stack is something other developers might want to copy, you can publish it from /workspace as a bundle. Forks copy the architecture into a new workspace and keep a lineage link to your original. Stars and reviews get weighted by reviewer experience, so the trending feed surfaces what actually works rather than what gets the most attention.

Worth a look this week:
  /b/builder-ai     Builder AI, the AI-native starter
  /b/edge           Cloudflare-native edge stack
  /b/data           Pipelines and queues with Neon and Trigger.dev

If you publish your bundle, reply to this email so we can feature it on the changelog.

Osi, NovaBash`,
    html: (ctx) =>
      wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>If your stack is something other developers might want to copy, you can publish it from <code>/workspace</code> as a bundle. Forks copy the architecture into a new workspace and keep a lineage link to your original. Stars and reviews get weighted by reviewer experience, so the trending feed surfaces what actually works rather than what gets the most attention.</p>
<p>Worth a look this week:</p>
<ul>
<li><a href="${baseUrl}/b/builder-ai" style="color:#c9a84c;">/b/builder-ai</a> Builder AI, the AI-native starter</li>
<li><a href="${baseUrl}/b/edge" style="color:#c9a84c;">/b/edge</a> Cloudflare-native edge stack</li>
<li><a href="${baseUrl}/b/data" style="color:#c9a84c;">/b/data</a> Pipelines and queues with Neon and Trigger.dev</li>
</ul>
<p>If you publish your bundle, reply to this email so we can feature it on the changelog.</p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
  },
  {
    id: 'first-paid-decision',
    subject: 'Pro pays for itself when polling matters',
    preheader: 'Why we built the Pro tier the way we did.',
    sendOnDay: 14,
    text: (ctx) =>
      `${greeting(ctx.recipientName)}

You have been on NovaBash for two weeks. The free tier covers fifty active projects, all six bundles, three environments per project, and fifteen-minute usage polling. That is enough for almost everyone.

The reason Pro exists is not to gate features, it is to fund the cost of polling cadence. Sub-minute polling on every connected vendor, across every workspace, is genuinely expensive on the API side. Pro at fifteen pounds a month covers it for one developer.

If your stack is past the point where a fifteen-minute lag is too long, Pro is worth it. If it is not, the free tier stays free.

  ${baseUrl}/pricing

Osi, NovaBash`,
    html: (ctx) =>
      wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>You have been on NovaBash for two weeks. The free tier covers fifty active projects, all six bundles, three environments per project, and fifteen-minute usage polling. That is enough for almost everyone.</p>
<p>The reason Pro exists is not to gate features, it is to fund the cost of polling cadence. Sub-minute polling on every connected vendor, across every workspace, is genuinely expensive on the API side. Pro at fifteen pounds a month covers it for one developer.</p>
<p>If your stack is past the point where a fifteen-minute lag is too long, Pro is worth it. If it is not, the free tier stays free.</p>
<p><a href="${baseUrl}/pricing" style="color:#c9a84c;">${baseUrl}/pricing</a></p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
  },
];

export const monthlyDigest: EmailTemplate = {
  id: 'monthly-digest',
  subject: 'Monthly infra digest · {{workspaceSlug}}',
  preheader: 'What changed, what burned, what to rotate.',
  sendOnDay: 30,
  text: (ctx) =>
    `${greeting(ctx.recipientName)}

This is the NovaBash monthly digest for ${ctx.workspaceSlug ?? 'your workspace'}.

  services connected     ${ctx.totalServices ?? 0}
  estimated monthly cost ${ctx.monthlyCostEstimate ?? '£0.00'}
  rotations due          ${ctx.rotationsDue ?? 0}
  .env files generated   ${ctx.envFileCount ?? 0}

If anything in the breakdown looks wrong, write back. The digest is generated from the same audit log you can export at any time.

Osi, NovaBash`,
  html: (ctx) =>
    wrapHtml(`<p>${greeting(ctx.recipientName)}</p>
<p>This is the NovaBash monthly digest for <code>${ctx.workspaceSlug ?? 'your workspace'}</code>.</p>
<table cellspacing="0" cellpadding="6" style="font-family:'JetBrains Mono',monospace;font-size:12.5px;border:1px solid #1f1f1f;">
<tr><td style="color:#606060;">services connected</td><td style="color:#fafafa;">${ctx.totalServices ?? 0}</td></tr>
<tr><td style="color:#606060;">estimated monthly cost</td><td style="color:#fafafa;">${ctx.monthlyCostEstimate ?? '£0.00'}</td></tr>
<tr><td style="color:#606060;">rotations due</td><td style="color:${(ctx.rotationsDue ?? 0) > 0 ? '#ff7a2e' : '#fafafa'};">${ctx.rotationsDue ?? 0}</td></tr>
<tr><td style="color:#606060;">.env files generated</td><td style="color:#fafafa;">${ctx.envFileCount ?? 0}</td></tr>
</table>
<p>If anything in the breakdown looks wrong, write back. The digest is generated from the same audit log you can export at any time.</p>
<p style="color:#fafafa;">Osi, NovaBash</p>`),
};

export function renderEmail(template: EmailTemplate, ctx: TemplateContext) {
  const subject = template.subject.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const v = (ctx as Record<string, string | number | undefined>)[k];
    return v === undefined ? '' : String(v);
  });
  return {
    subject,
    text: template.text(ctx),
    html: template.html(ctx),
  };
}

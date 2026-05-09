import Link from 'next/link';

export const metadata = { title: 'Pricing' };

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: Array<{ text: string; locked?: boolean }>;
  cta: string;
  ctaHref: string;
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    id: '/free',
    name: 'free',
    price: '£0',
    period: 'forever, no expiry',
    blurb:
      'Everything an individual developer needs to run a real product. No card required, no usage trap, no feature crippling.',
    features: [
      { text: '50 active projects per workspace' },
      { text: 'All 6 stack bundles available' },
      { text: 'Encrypted credential vault, AES-256' },
      { text: 'Three environments per project' },
      { text: 'Cross-service usage dashboard' },
      { text: 'Burn rate alerts, every 15 minutes' },
      { text: 'Bundle forking and publishing' },
      { text: 'Open source CLI, VS Code extension' },
      { text: 'GitHub Actions plugin' },
      { text: 'Team workspaces and shared seats', locked: true },
      { text: 'Real-time polling and audit log', locked: true },
      { text: 'Compliance export and policy templates', locked: true },
    ],
    cta: 'claim free tier',
    ctaHref: '/sign-up',
  },
  {
    id: '/pro',
    name: 'pro',
    price: '£15',
    period: 'per month, billed monthly',
    blurb:
      'When you go from solo to small team, or when you need things to react in seconds rather than minutes.',
    features: [
      { text: 'Everything in Free' },
      { text: 'Unlimited projects per workspace' },
      { text: 'Team workspaces, up to 5 seats' },
      { text: 'Real-time usage polling, sub-minute' },
      { text: 'Stack drift detection' },
      { text: 'Cost optimisation suggestions' },
      { text: 'Advanced rotation scheduling' },
      { text: 'Priority email support' },
      { text: 'Webhook event bus' },
      { text: 'Custom alert thresholds' },
      { text: 'Compliance export and policy templates', locked: true },
      { text: 'SLA, audit log, approval workflows', locked: true },
    ],
    cta: 'start pro →',
    ctaHref: '/sign-up?tier=pro',
    featured: true,
  },
  {
    id: '/studio',
    name: 'studio',
    price: '£39',
    period: 'per month, billed monthly',
    blurb:
      'For agencies, studios, and any product operating in a regulated industry where audit trails are not optional.',
    features: [
      { text: 'Everything in Pro' },
      { text: 'Unlimited team seats' },
      { text: 'Hash-chained immutable audit log' },
      { text: 'Compliance export, signed JSON' },
      { text: 'Policy templates: SOC 2, GDPR, ISO 27001' },
      { text: 'Team approval workflows' },
      { text: 'Environment variable versioning' },
      { text: 'SSO via SAML or OIDC' },
      { text: 'Dedicated support channel' },
      { text: '99.9% uptime SLA' },
      { text: 'Custom retention policies' },
      { text: 'Service-level reporting' },
    ],
    cta: 'start studio →',
    ctaHref: '/sign-up?tier=studio',
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">03</span>
        <span>pricing</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Free for fifty projects.
        <br />
        <span className="text-fg-dim">Honest about what is paid.</span>
      </h1>
      <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        Solo developers run their entire careers on the free tier. Pay starts when you add a
        teammate or need governance for regulated work. Nothing artificial in between.
      </p>

      <div className="grid border-t border-l border-hairline lg:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.id}
            className={`flex flex-col gap-6 border-b border-r border-hairline p-9 ${
              tier.featured ? 'bg-gold-fade' : 'bg-bg'
            }`}
          >
            <header>
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[12px] tracking-[0.04em] text-gold">{tier.id}</span>
                {tier.featured && (
                  <span className="border border-gold px-2 py-0.5 font-mono text-[10px] uppercase tracking-caps text-gold">
                    most picked
                  </span>
                )}
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-[64px] font-extrabold leading-none tracking-display text-fg">
                  {tier.price}
                </span>
              </div>
              <span className="font-mono text-[11px] text-fg-dim">{tier.period}</span>
              <p className="mt-5 text-[14px] leading-[1.55] text-fg-mid">{tier.blurb}</p>
            </header>

            <ul className="flex flex-col gap-2.5 border-t border-hairline pt-6 text-[13.5px]">
              {tier.features.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 ${f.locked ? 'text-fg-fade' : 'text-fg-mid'}`}
                >
                  <span className={`mt-1 block h-1 w-1 ${f.locked ? 'bg-fg-fade' : 'bg-mint'}`} />
                  {f.text}
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={`mt-2 py-3 text-center text-[13.5px] font-semibold transition-colors duration-150 ease-nb ${
                tier.featured
                  ? 'bg-gold text-bg hover:bg-gold-bright'
                  : 'border border-hairline-bright text-fg hover:border-gold hover:text-gold'
              }`}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 max-w-[760px] font-mono text-[12.5px] leading-[1.7] text-fg-dim">
        <span className="text-gold">// note</span> &nbsp; NovaBash never resells third-party
        services. You own every Supabase, Vercel, and OpenRouter account in your stack. Your bills
        go directly to those vendors. We charge for the orchestration layer, not for what it
        orchestrates.
      </p>
    </div>
  );
}

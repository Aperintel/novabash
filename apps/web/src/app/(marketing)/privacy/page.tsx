import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy Notice',
  description:
    'What NovaBash collects about you, why, how long we keep it, and how to exercise your rights.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="privacy notice"
      effective="2026-05-09"
      title={
        <>
          What we hold,
          <br />
          <span className="text-fg-dim">why, and for how long.</span>
        </>
      }
      intro={
        <>
          <p className="mb-4">
            Aperintel is the controller for personal data processed in connection with the
            NovaBash service. This notice explains what data we collect from you when you use
            NovaBash, the lawful bases we rely on, how long we keep each category, who else
            handles it on our behalf, and how to exercise your rights under UK GDPR and EU GDPR.
          </p>
          <p>
            We have written this notice in the same plain English we use everywhere else in
            NovaBash because the trust architecture only works if you can read what it actually
            does. If anything below is unclear, write to{' '}
            <a className="text-gold hover:underline" href="mailto:privacy@novabash.dev">
              privacy@novabash.dev
            </a>{' '}
            and we will explain it without legalese.
          </p>
        </>
      }
      sections={[
        {
          num: '/01',
          heading: 'Who we are',
          body: (
            <>
              <p>
                Aperintel, a sole proprietorship registered in the United Kingdom and based in
                London, operates NovaBash. The Information Commissioner&apos;s Office is our
                supervisory authority. Our ICO registration is filed against the Aperintel
                trading name and the registration reference will be published on this page once
                we have it.
              </p>
            </>
          ),
        },
        {
          num: '/02',
          heading: 'What we collect, and why',
          body: (
            <>
              <p>
                We collect only what we need to operate the product, support you, and meet our
                legal obligations. The categories below are exhaustive at the time of writing.
                If we add a new category, this notice updates and you receive a heads-up via
                email.
              </p>
              <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[13px]">
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Email address</span>
                  <span className="text-fg-mid">
                    Required to create a workspace, send the magic link, and reach you for
                    billing or security notices. Lawful basis: contract performance.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">OAuth profile data</span>
                  <span className="text-fg-mid">
                    Username and avatar URL from GitHub or Google when you sign in via OAuth.
                    Used only to populate the workspace owner field. Lawful basis: contract
                    performance.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Workspace metadata</span>
                  <span className="text-fg-mid">
                    Workspace name, bundle choice, environment names, and the configuration of
                    each connected service (which service, which fields). Lawful basis: contract
                    performance.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Encrypted credentials</span>
                  <span className="text-fg-mid">
                    The values you paste into the connect flow are stored only as ciphertext
                    under envelope encryption. Aperintel staff cannot read them. Lawful basis:
                    contract performance.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Audit log entries</span>
                  <span className="text-fg-mid">
                    A hash-chained record of every read, write, validation, and rotation against
                    the credentials in your workspace. Lawful basis: legitimate interests
                    (security, integrity).
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Billing data</span>
                  <span className="text-fg-mid">
                    For paid plans, your name, country, VAT status, and a Stripe customer ID.
                    The card itself is held by Stripe, not by Aperintel. Lawful basis: legal
                    obligation (tax) plus contract performance.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Product analytics</span>
                  <span className="text-fg-mid">
                    Anonymous events on key flows (sign-up, first .env download, rotation) via
                    Plausible. No cookies, no personal identifiers, no IP addresses retained.
                    Lawful basis: legitimate interests.
                  </span>
                </li>
                <li className="grid grid-cols-[160px_1fr] items-baseline gap-3">
                  <span className="text-fg-dim">Error reports</span>
                  <span className="text-fg-mid">
                    Stack traces and request metadata captured by Sentry when something breaks.
                    Personal data is scrubbed before transmission where reasonably possible.
                    Lawful basis: legitimate interests.
                  </span>
                </li>
              </ul>
            </>
          ),
        },
        {
          num: '/03',
          heading: 'What we never do',
          body: (
            <>
              <p>
                We do not sell your data. We do not train any model, internal or external, on
                the contents of your vault or on your audit log. We do not embed third-party
                advertising trackers on novabash.dev. We do not use the contents of magic-link
                emails for any purpose beyond the magic link.
              </p>
            </>
          ),
        },
        {
          num: '/04',
          heading: 'How long we keep things',
          body: (
            <>
              <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[13px]">
                <li className="grid grid-cols-[260px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Active workspace data</span>
                  <span className="text-fg-mid">
                    For as long as the workspace exists.
                  </span>
                </li>
                <li className="grid grid-cols-[260px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Deleted workspace data</span>
                  <span className="text-fg-mid">
                    Encrypted blobs purged within 24 hours, data keys destroyed, audit log kept
                    for 30 days for security investigation, then deleted.
                  </span>
                </li>
                <li className="grid grid-cols-[260px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Billing records</span>
                  <span className="text-fg-mid">
                    Six years from the end of the relevant tax year, as required by HMRC.
                  </span>
                </li>
                <li className="grid grid-cols-[260px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                  <span className="text-fg-dim">Product analytics</span>
                  <span className="text-fg-mid">Twenty-four months, then aggregated.</span>
                </li>
                <li className="grid grid-cols-[260px_1fr] items-baseline gap-3">
                  <span className="text-fg-dim">Error reports</span>
                  <span className="text-fg-mid">Ninety days.</span>
                </li>
              </ul>
            </>
          ),
        },
        {
          num: '/05',
          heading: 'Where your data lives',
          body: (
            <>
              <p>
                Encrypted credentials and audit log entries live in Supabase Postgres in the
                eu-west-2 region (London). Backups are encrypted at rest and stored in the same
                region. Magic-link and transactional email is sent via Resend, which routes
                globally for delivery but does not retain message bodies past delivery
                confirmation. Error reports and analytics are aggregated in the EU.
              </p>
              <p>
                If we ever have to transfer personal data outside the UK or EEA, we rely on
                Standard Contractual Clauses or the UK Data Bridge mechanism, and we tell you
                here before we make the transfer.
              </p>
            </>
          ),
        },
        {
          num: '/06',
          heading: 'Sub-processors',
          body: (
            <>
              <p>
                We rely on a small set of third parties to operate. Each is a data processor
                under UK GDPR Article 28, with a written agreement in place. The current list:
              </p>
              <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[12.5px]">
                {[
                  ['Supabase', 'Database, encrypted vault storage, authentication'],
                  ['Vercel', 'Web hosting for novabash.dev'],
                  ['Railway', 'API hosting'],
                  ['Resend', 'Transactional email'],
                  ['Stripe', 'Payment processing'],
                  ['Sentry', 'Error monitoring'],
                  ['Plausible', 'Privacy-first analytics'],
                  ['Cloudflare', 'DNS and edge'],
                ].map(([name, role]) => (
                  <li
                    key={name}
                    className="grid grid-cols-[160px_1fr] items-baseline gap-3 border-b border-hairline pb-3 last:border-b-0"
                  >
                    <span className="text-fg-dim">{name}</span>
                    <span className="text-fg-mid">{role}</span>
                  </li>
                ))}
              </ul>
              <p>
                We give thirty days notice on this page before adding or replacing a
                sub-processor. If you object to a planned change you can cancel before it takes
                effect with a pro-rata refund of any prepaid period.
              </p>
            </>
          ),
        },
        {
          num: '/07',
          heading: 'Your rights',
          body: (
            <>
              <p>Under UK GDPR and EU GDPR you have the right to:</p>
              <ul className="list-disc space-y-2 pl-6 text-[14.5px]">
                <li>access the personal data we hold about you,</li>
                <li>have it corrected if it is wrong,</li>
                <li>have it deleted in many circumstances,</li>
                <li>restrict or object to certain processing,</li>
                <li>receive your data in a portable JSON format,</li>
                <li>withdraw any consent you previously gave,</li>
                <li>complain to the Information Commissioner&apos;s Office.</li>
              </ul>
              <p>
                To exercise any of these rights, write to{' '}
                <a className="text-gold hover:underline" href="mailto:privacy@novabash.dev">
                  privacy@novabash.dev
                </a>{' '}
                from the email tied to your workspace. We respond within thirty days, usually
                much sooner. There is no charge unless a request is manifestly unfounded or
                excessive.
              </p>
              <p>
                If you are unhappy with our response you can complain to the ICO at{' '}
                <a
                  className="text-gold hover:underline"
                  href="https://ico.org.uk/make-a-complaint/"
                  rel="noopener noreferrer"
                >
                  ico.org.uk/make-a-complaint
                </a>
                . We would much prefer to hear from you first so we can fix whatever has gone
                wrong.
              </p>
            </>
          ),
        },
        {
          num: '/08',
          heading: 'Automated decision-making',
          body: (
            <>
              <p>
                NovaBash does not make automated decisions that produce legal or similarly
                significant effects on you. Burn-rate alerts and rotation reminders are
                automated, but they only ever notify you, never act on your behalf without
                explicit confirmation.
              </p>
            </>
          ),
        },
        {
          num: '/09',
          heading: 'Children',
          body: (
            <>
              <p>
                NovaBash is not aimed at children under sixteen and we do not knowingly
                process personal data of anyone under sixteen. If you believe we have, write to{' '}
                <a className="text-gold hover:underline" href="mailto:privacy@novabash.dev">
                  privacy@novabash.dev
                </a>{' '}
                and we will delete it.
              </p>
            </>
          ),
        },
        {
          num: '/10',
          heading: 'Changes to this notice',
          body: (
            <>
              <p>
                We update this notice when the product or the law changes. For material changes
                we email you at least fourteen days before the change takes effect, and the
                effective date at the top of the page is updated. Earlier versions are kept in
                an archive at novabash.dev/privacy/archive so you can see what changed and when.
              </p>
            </>
          ),
        },
      ]}
      contactLine={
        <p>
          Privacy questions go to{' '}
          <a className="text-gold hover:underline" href="mailto:privacy@novabash.dev">
            privacy@novabash.dev
          </a>
          . Security disclosures go to{' '}
          <a className="text-gold hover:underline" href="mailto:security@novabash.dev">
            security@novabash.dev
          </a>
          .
        </p>
      }
    />
  );
}

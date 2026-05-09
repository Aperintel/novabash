import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Terms of Service',
  description: 'The agreement between you and Aperintel for using NovaBash.',
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="terms of service"
      effective="2026-05-09"
      title={
        <>
          The agreement between you
          <br />
          <span className="text-fg-dim">and Aperintel for using NovaBash.</span>
        </>
      }
      intro={
        <>
          <p className="mb-4">
            NovaBash is a developer infrastructure product operated by Aperintel, a sole
            proprietorship registered in the United Kingdom and headquartered in London. These
            Terms describe how you and Aperintel agree to use NovaBash together. We have written
            them in plain English because legal language that nobody reads protects nobody, and
            because the product itself is plain enough that the contract should be too.
          </p>
          <p>
            By creating a NovaBash workspace, downloading the CLI, or otherwise using the
            service, you accept these Terms. If you are using NovaBash on behalf of an employer
            or a client, you are confirming you have the authority to bind that organisation to
            these Terms.
          </p>
        </>
      }
      sections={[
        {
          num: '/01',
          heading: 'What NovaBash is, and what it is not',
          body: (
            <>
              <p>
                NovaBash is an orchestration layer for the SaaS accounts your application
                already uses. You bring your own credentials for services like Supabase, Vercel,
                Resend, and others, and NovaBash holds those credentials in an encrypted vault,
                generates the .env files your project needs, watches usage across each service,
                and helps you rotate keys when the time comes.
              </p>
              <p>
                NovaBash is not a reseller of any third-party service. Your relationship with
                Supabase, Vercel, OpenRouter, or any other vendor in your stack is governed by
                that vendor&apos;s own terms, and Aperintel is not a party to those agreements.
                Your bills go directly to those vendors. NovaBash charges only for the
                orchestration layer described in the pricing page.
              </p>
            </>
          ),
        },
        {
          num: '/02',
          heading: 'Your account',
          body: (
            <>
              <p>
                You sign in via GitHub, Google, or an email magic link. You are responsible for
                the security of the device that receives the magic link and for the OAuth
                provider account you sign in with. If you lose access to that account you can
                recover the workspace by writing to support@novabash.dev with proof of ownership
                that we can verify against the workspace metadata.
              </p>
              <p>
                You agree to provide a working email address, to keep it current, and to use
                NovaBash only for activity that is lawful in the United Kingdom and in the
                jurisdiction you are based in. NovaBash is not aimed at children under sixteen
                and we do not knowingly create accounts for them.
              </p>
            </>
          ),
        },
        {
          num: '/03',
          heading: 'Plans and payment',
          body: (
            <>
              <p>
                The Free plan is permanent for individual developers within the limits posted on
                the pricing page. The Pro and Studio plans bill monthly via Stripe. Prices are
                in pounds sterling and exclude VAT, which is added at checkout where applicable.
                We can change prices on at least thirty days notice, and the new price applies
                from your next billing cycle.
              </p>
              <p>
                If a payment fails, your workspace continues to function for a seven-day grace
                period during which we will attempt to reach you. After the grace period the
                workspace downgrades to the Free plan and any features above Free are paused
                until billing is restored. Your data and credentials are not deleted on
                downgrade.
              </p>
              <p>
                Refunds: if you cancel within fourteen days of an upgrade and have not used the
                paid features in a way we can evidence (a CLI rotation, a real-time poll, a
                team-seat invite), we will refund pro-rata. After fourteen days, paid time on a
                tier is non-refundable, but you keep access until the end of the period you have
                paid for.
              </p>
            </>
          ),
        },
        {
          num: '/04',
          heading: 'Acceptable use',
          body: (
            <>
              <p>
                NovaBash is designed for legitimate development and operations work. You agree
                not to use NovaBash to store credentials for services or activities that breach
                applicable law, the terms of the underlying vendor, or any sanctions regime.
                Examples of activity that will get a workspace suspended without refund:
                resale of NovaBash itself or of credentials it holds, automated abuse of vendor
                APIs, distribution of malware, access to systems you are not authorised to
                access.
              </p>
              <p>
                We do not police the vendors you connect, but we will respond to credible
                reports of abuse routed through abuse@novabash.dev. Where a vendor instructs us
                to suspend a connection because of a violation of their terms, we will comply.
              </p>
            </>
          ),
        },
        {
          num: '/05',
          heading: 'Intellectual property',
          body: (
            <>
              <p>
                Aperintel owns the NovaBash brand, the website, the dashboard, the API, and the
                proprietary parts of the codebase. The CLI is open source under the licence
                stated in its repository. You retain full ownership of every bundle, stack, and
                workspace configuration you create on NovaBash, including the right to export it
                at any time as portable JSON.
              </p>
              <p>
                If you publish a stack bundle to the community catalogue, you grant other
                NovaBash users a non-exclusive, royalty-free licence to fork it inside their own
                workspace, with attribution preserved. You can withdraw a published bundle at
                any time, which prevents new forks but does not delete forks already in
                existence.
              </p>
            </>
          ),
        },
        {
          num: '/06',
          heading: 'How we handle your credentials',
          body: (
            <>
              <p>
                Every credential you paste into NovaBash is encrypted with AES-256-GCM under
                envelope encryption. The data key encrypts the credential value, the master key
                encrypts the data key, and the master key is stored separately from the
                ciphertext. Plain-text credentials never sit on disk and never appear in our
                logs. The full architecture lives on the security page.
              </p>
              <p>
                We do not access the contents of your vault except where we are technically
                required to (such as during a key rotation that the user has initiated) or where
                we are legally compelled. Every such access is logged to the hash-chained audit
                trail that you can read and export.
              </p>
            </>
          ),
        },
        {
          num: '/07',
          heading: 'Service availability',
          body: (
            <>
              <p>
                We aim for high availability, but the Free and Pro plans are offered without a
                formal uptime guarantee. The Studio plan carries a 99.9 percent monthly uptime
                SLA, with service credits set out separately in the SLA addendum that
                accompanies a Studio agreement. Planned maintenance is announced at least
                seventy-two hours in advance via the status page.
              </p>
              <p>
                We may make changes to the product that improve, modify, or occasionally
                deprecate features. Where a change removes a paid feature, we will give at least
                thirty days notice and a clear migration path.
              </p>
            </>
          ),
        },
        {
          num: '/08',
          heading: 'Termination',
          body: (
            <>
              <p>
                You can cancel a paid plan from the billing page at any time, and the
                cancellation takes effect at the end of the current period. You can delete your
                workspace at any time, which triggers a full credential and audit purge inside
                twenty-four hours, with the encrypted blobs overwritten and the data keys
                destroyed.
              </p>
              <p>
                Aperintel may suspend or terminate a workspace where there is a serious breach
                of these Terms, where we are legally required to, or where we have credible
                reason to believe the workspace is being used for harm to others. Where
                termination is for cause we are not obliged to refund the unused portion of any
                paid period.
              </p>
            </>
          ),
        },
        {
          num: '/09',
          heading: 'Warranty and liability',
          body: (
            <>
              <p>
                NovaBash is provided on an as-is basis. To the extent permitted by law, Aperintel
                excludes all implied warranties of merchantability, fitness for a particular
                purpose, and non-infringement.
              </p>
              <p>
                Nothing in these Terms limits liability for death, personal injury caused by
                negligence, fraud, or any other liability that cannot be limited under English
                law. Subject to that, Aperintel&apos;s total liability to you under or in
                connection with these Terms in any twelve-month period is capped at the greater
                of one hundred pounds sterling and the fees you paid Aperintel in that period.
                Aperintel is not liable for indirect, consequential, or special losses, including
                loss of profit, loss of business opportunity, or loss of data that you had the
                ability to back up via the export tools.
              </p>
            </>
          ),
        },
        {
          num: '/10',
          heading: 'Indemnity',
          body: (
            <>
              <p>
                You agree to indemnify Aperintel against any third-party claim that arises from
                your use of NovaBash in breach of these Terms, including claims by vendors whose
                terms you have violated through the credentials you connected, and claims by
                people whose data you stored in services connected to NovaBash without a lawful
                basis. This indemnity does not extend to claims arising from Aperintel&apos;s own
                breach of these Terms.
              </p>
            </>
          ),
        },
        {
          num: '/11',
          heading: 'Changes to these Terms',
          body: (
            <>
              <p>
                We may update these Terms to reflect changes in the product, the law, or the
                way Aperintel operates. For material changes we will notify you at the email on
                file at least fourteen days before they take effect. Your continued use of
                NovaBash after the effective date means you accept the updated Terms. If you do
                not, you can cancel and export your workspace before the change lands.
              </p>
            </>
          ),
        },
        {
          num: '/12',
          heading: 'Governing law',
          body: (
            <>
              <p>
                These Terms are governed by the laws of England and Wales. Any dispute arising
                under or in connection with them is subject to the exclusive jurisdiction of the
                courts of England and Wales, except that Aperintel may bring proceedings in any
                jurisdiction necessary to protect its intellectual property.
              </p>
            </>
          ),
        },
      ]}
      contactLine={
        <p>
          Questions about these Terms go to{' '}
          <a className="text-gold hover:underline" href="mailto:legal@novabash.dev">
            legal@novabash.dev
          </a>
          . The latest version of this page lives at{' '}
          <span className="font-mono text-fg">novabash.dev/terms</span>.
        </p>
      }
    />
  );
}

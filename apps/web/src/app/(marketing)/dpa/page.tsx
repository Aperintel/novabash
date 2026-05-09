import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Data Processing Agreement',
  description:
    'How Aperintel processes personal data on your behalf when you use NovaBash, written in plain English to satisfy UK GDPR Article 28.',
};

export default function DpaPage() {
  return (
    <LegalPage
      eyebrow="data processing agreement"
      effective="2026-05-09"
      title={
        <>
          The Article 28 agreement,
          <br />
          <span className="text-fg-dim">in plain English.</span>
        </>
      }
      intro={
        <>
          <p className="mb-4">
            When you use NovaBash to manage credentials for an application that processes
            personal data of your own users, NovaBash is processing some of that personal data
            on your behalf. UK GDPR and EU GDPR Article 28 require a written agreement between
            controller (you) and processor (Aperintel) covering specific points. This page is
            that agreement, written so a non-lawyer can read it and so the obligations are
            still binding.
          </p>
          <p>
            This DPA forms part of the Terms of Service. By using NovaBash for any workspace
            that processes personal data on behalf of identifiable users, you accept this DPA.
            If your organisation needs a counter-signed bilateral version on letterhead, write
            to{' '}
            <a className="text-gold hover:underline" href="mailto:legal@novabash.dev">
              legal@novabash.dev
            </a>{' '}
            and we will arrange it.
          </p>
        </>
      }
      sections={[
        {
          num: '/01',
          heading: 'Roles',
          body: (
            <>
              <p>
                You are the controller of any personal data that ends up inside your NovaBash
                workspace because of how you have configured your application. Aperintel is the
                processor for that data, processing only on your documented instructions.
                Aperintel acts as an independent controller for the small set of personal data
                described in the Privacy Notice (your email, billing data, OAuth profile,
                product analytics, error reports), and that handling is governed by the
                Privacy Notice rather than by this DPA.
              </p>
            </>
          ),
        },
        {
          num: '/02',
          heading: 'Subject matter and duration',
          body: (
            <>
              <p>
                Aperintel processes personal data only as necessary to provide the NovaBash
                service to you, for as long as your subscription remains active and for any
                short retention period set out in the Privacy Notice. When you delete a
                workspace or terminate the agreement, Aperintel returns or deletes the data as
                set out in section 09.
              </p>
            </>
          ),
        },
        {
          num: '/03',
          heading: 'Nature and purpose of processing',
          body: (
            <>
              <p>
                Aperintel processes personal data for the purpose of operating the NovaBash
                service, which includes encrypted storage of credentials, generation of .env
                files, validation of credentials against vendor APIs, polling of vendor APIs for
                usage telemetry, and maintenance of the hash-chained audit log. No other
                processing is performed without further written instructions from you.
              </p>
            </>
          ),
        },
        {
          num: '/04',
          heading: 'Categories of data subjects and personal data',
          body: (
            <>
              <p>
                Data subjects are the natural persons whose personal data passes through your
                application and ends up referenced in your NovaBash workspace. Categories of
                personal data depend entirely on your application, but typically include
                identifiers (email, user IDs), credential metadata (workspace IDs, environment
                names), and indirectly any data that the credentials we hold can decrypt or
                authenticate against on the vendor side.
              </p>
              <p>
                Aperintel does not control which categories of personal data you store in the
                services you connect. If your application processes special category data
                under Article 9, you are responsible for the additional safeguards required by
                law.
              </p>
            </>
          ),
        },
        {
          num: '/05',
          heading: 'Aperintel obligations',
          body: (
            <>
              <p>Aperintel agrees to:</p>
              <ul className="list-disc space-y-2 pl-6 text-[14.5px]">
                <li>process personal data only on your documented instructions;</li>
                <li>
                  ensure that personnel authorised to process personal data are bound by
                  appropriate confidentiality;
                </li>
                <li>
                  implement the technical and organisational measures described in section 06;
                </li>
                <li>
                  assist you in responding to requests from data subjects exercising their
                  rights;
                </li>
                <li>
                  assist you in meeting your obligations under Articles 32 to 36 of UK GDPR;
                </li>
                <li>
                  notify you without undue delay after becoming aware of a personal data
                  breach;
                </li>
                <li>
                  make available all information necessary to demonstrate compliance with
                  Article 28, and allow for and contribute to audits.
                </li>
              </ul>
            </>
          ),
        },
        {
          num: '/06',
          heading: 'Technical and organisational measures',
          body: (
            <>
              <p>
                The measures listed below are minimums that Aperintel commits to maintain. The
                full security architecture is described on the security page and updates as the
                product hardens through to v1.0.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-[14.5px]">
                <li>
                  Envelope encryption of all stored credentials with AES-256-GCM, master keys
                  separated from ciphertext, KMS-backed at v1.0.
                </li>
                <li>
                  Hash-chained audit log of every credential access, exportable as signed JSON.
                </li>
                <li>
                  Workspace isolation: per-workspace data keys, no cross-workspace
                  decryption path.
                </li>
                <li>
                  TLS 1.2+ on all transport, HSTS preload on novabash.dev, restricted CORS.
                </li>
                <li>
                  Principle of least privilege for staff access, multi-factor authentication
                  required, no credential read access to the vault.
                </li>
                <li>
                  Background checks and confidentiality undertakings for any future hires.
                </li>
                <li>
                  Vulnerability disclosure inbox at security@novabash.dev with a 24-hour
                  acknowledgement target.
                </li>
              </ul>
            </>
          ),
        },
        {
          num: '/07',
          heading: 'Sub-processors',
          body: (
            <>
              <p>
                You give Aperintel general written authorisation to engage the sub-processors
                listed on the Privacy Notice. Aperintel will give at least thirty days notice
                of any intended addition or replacement. If you reasonably object to a change
                you may terminate the affected workspace before the change takes effect with a
                pro-rata refund of any prepaid period covering services that can no longer be
                provided.
              </p>
              <p>
                Each sub-processor is bound by data protection obligations no less protective
                than those in this DPA, by written agreement or by reference to their own
                published DPA which Aperintel has reviewed.
              </p>
            </>
          ),
        },
        {
          num: '/08',
          heading: 'International transfers',
          body: (
            <>
              <p>
                Aperintel stores credentials and audit log entries in eu-west-2. Where a
                sub-processor or a delivery path requires a transfer of personal data outside
                the UK or EEA, Aperintel relies on the UK Standard Contractual Clauses, the
                International Data Transfer Addendum, the EU Standard Contractual Clauses, or
                an applicable adequacy decision, as appropriate. The list of relevant
                mechanisms per sub-processor is available on request.
              </p>
            </>
          ),
        },
        {
          num: '/09',
          heading: 'Return and deletion',
          body: (
            <>
              <p>
                On termination or on your written instruction, Aperintel returns or deletes
                personal data processed on your behalf, at your choice. Encrypted credential
                blobs are overwritten and the corresponding data keys destroyed within
                twenty-four hours of a workspace deletion. The hash-chained audit log is
                retained for thirty days for security purposes, unless you instruct earlier
                deletion. Backup retention windows are listed in the Privacy Notice and the
                same deletion guarantees apply once each window expires.
              </p>
            </>
          ),
        },
        {
          num: '/10',
          heading: 'Audit',
          body: (
            <>
              <p>
                Aperintel makes available to you on request a current SOC 2 Type II report or,
                until that exists, the equivalent self-attested control documentation, plus
                penetration test summaries, plus the architectural overview from the security
                page. You may also conduct your own audit on reasonable notice no more than
                once per calendar year, at your expense, subject to confidentiality and to
                Aperintel&apos;s ability to safeguard the data of other customers.
              </p>
            </>
          ),
        },
        {
          num: '/11',
          heading: 'Liability',
          body: (
            <>
              <p>
                The liability provisions in the Terms of Service apply equally to this DPA.
                Nothing in this DPA increases or reduces a party&apos;s liability under
                applicable data protection law to data subjects.
              </p>
            </>
          ),
        },
      ]}
      contactLine={
        <p>
          For a counter-signed bilateral DPA on letterhead, write to{' '}
          <a className="text-gold hover:underline" href="mailto:legal@novabash.dev">
            legal@novabash.dev
          </a>
          . For breach notifications and security questions write to{' '}
          <a className="text-gold hover:underline" href="mailto:security@novabash.dev">
            security@novabash.dev
          </a>
          .
        </p>
      }
    />
  );
}

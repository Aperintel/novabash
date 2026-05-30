import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Data Processing',
  description: 'NovaBash processes no personal data on your behalf, so there is no DPA to sign.',
};

export default function DpaPage() {
  return (
    <LegalPage
      eyebrow="data processing"
      effective="2026-05-30"
      title={
        <>
          There is no data
          <br />
          <span className="text-fg-dim">for us to process.</span>
        </>
      }
      intro={
        <p>
          A Data Processing Agreement governs a provider that processes personal data
          on a customer&apos;s behalf. NovaBash does not do that. There is no server and
          no database, and your vault never reaches us, so there is no processing
          relationship to paper over.
        </p>
      }
      sections={[
        {
          num: '/01',
          heading: 'Why no DPA is needed',
          body: (
            <p>
              Under UK and EU GDPR Article 28, a DPA applies where a processor handles
              personal data for a controller. NovaBash handles none on your behalf:
              everything you put in stays encrypted on your own device. With no data
              flowing to us, there is nothing for a DPA to cover.
            </p>
          ),
        },
        {
          num: '/02',
          heading: 'What about the host',
          body: (
            <p>
              The website is served as static files by Cloudflare Pages, which keeps its
              own request logs as any host does. That is a matter between you, as a
              visitor, and Cloudflare under their terms; it is not a NovaBash processing
              activity. The{' '}
              <a className="text-gold hover:underline" href="/privacy">
                privacy note
              </a>{' '}
              covers it.
            </p>
          ),
        },
        {
          num: '/03',
          heading: 'If your situation genuinely differs',
          body: (
            <p>
              If a procurement process insists on a signed agreement, write to{' '}
              <a className="text-gold hover:underline" href="mailto:enquiries@aperintel.com">
                enquiries@aperintel.com
              </a>{' '}
              and we will talk it through. In almost every case there is simply nothing
              to process.
            </p>
          ),
        },
      ]}
      contactLine={
        <p>
          Questions go to{' '}
          <a className="text-gold hover:underline" href="mailto:enquiries@aperintel.com">
            enquiries@aperintel.com
          </a>
          .
        </p>
      }
    />
  );
}

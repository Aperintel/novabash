import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Terms of Use',
  description: 'NovaBash is free, open-source, and provided as-is. No account, no payment.',
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="terms of use"
      effective="2026-05-30"
      title={
        <>
          Use it freely.
          <br />
          <span className="text-fg-dim">It is provided as-is.</span>
        </>
      }
      intro={
        <p>
          NovaBash is a free, open-source tool that runs in your browser. There is no
          account to create and nothing to pay. These terms are short because the
          arrangement is simple: you run an open-source app on your own device, and
          you look after your own keys and backups.
        </p>
      }
      sections={[
        {
          num: '/01',
          heading: 'The licence',
          body: (
            <p>
              NovaBash is released under the Apache License 2.0. You may use, modify,
              and distribute it under those terms. The full text and the source are at{' '}
              <a
                className="text-gold hover:underline"
                href="https://github.com/aperintel/novabash"
                rel="noopener noreferrer"
              >
                github.com/aperintel/novabash
              </a>
              .
            </p>
          ),
        },
        {
          num: '/02',
          heading: 'No account, no fee',
          body: (
            <p>
              There is nothing to sign up for and nothing to pay. We do not promise to
              keep the hosted copy online forever, but the app is open source, so you
              can always run your own copy from the repository.
            </p>
          ),
        },
        {
          num: '/03',
          heading: 'Provided as-is',
          body: (
            <p>
              NovaBash is provided without warranty of any kind. To the fullest extent
              permitted by law, Aperintel is not liable for any loss arising from its
              use, including lost or exposed secrets and a forgotten passphrase. It is a
              convenience tool, not a guaranteed system of record. Keep backups and use
              judgement about what you store in it.
            </p>
          ),
        },
        {
          num: '/04',
          heading: 'Your side of it',
          body: (
            <ul className="list-disc space-y-2 pl-6 text-[14.5px]">
              <li>You choose your passphrase and keep it safe. There is no reset.</li>
              <li>You keep your own backups by exporting the encrypted vault.</li>
              <li>You are responsible for the keys you store and how you use them.</li>
              <li>You do not use NovaBash for anything unlawful.</li>
            </ul>
          ),
        },
        {
          num: '/05',
          heading: 'Security limits',
          body: (
            <p>
              NovaBash is a browser-based vault. The{' '}
              <a className="text-gold hover:underline" href="/security">
                security note
              </a>{' '}
              explains the threat model honestly, including the cross-site-scripting
              risk that applies to any client-side vault. Read it and decide what is
              appropriate to store.
            </p>
          ),
        },
        {
          num: '/06',
          heading: 'Changes and governing law',
          body: (
            <p>
              We may update these terms and the app over time; the source code and the
              effective date above are the record. These terms are governed by the laws
              of England and Wales.
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

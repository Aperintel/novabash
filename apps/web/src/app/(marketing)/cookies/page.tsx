import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Cookie Note',
  description: 'NovaBash sets no cookies and runs no trackers. The only storage it uses is local to your device.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="cookie note"
      effective="2026-05-30"
      title={
        <>
          We do not set cookies.
          <br />
          <span className="text-fg-dim">The banner is just being polite.</span>
        </>
      }
      intro={
        <p>
          NovaBash sets no cookies, runs no analytics, and loads no third-party
          scripts. The only browser storage it uses is local storage and IndexedDB,
          to hold your encrypted vault and a couple of small preferences on your own
          device. None of it tracks you and none of it leaves the browser.
        </p>
      }
      sections={[
        {
          num: '/01',
          heading: 'What we keep on your device',
          body: (
            <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[13px]">
              <li className="grid grid-cols-[200px_1fr] items-baseline gap-3 border-b border-hairline pb-3">
                <span className="text-fg-dim">IndexedDB</span>
                <span className="text-fg-mid">
                  Your encrypted vault. Ciphertext only, decrypted in memory after you enter your passphrase.
                </span>
              </li>
              <li className="grid grid-cols-[200px_1fr] items-baseline gap-3">
                <span className="text-fg-dim">Local storage</span>
                <span className="text-fg-mid">
                  A tiny flag recording that you dismissed the cookie note, so it does not nag you again. Nothing more.
                </span>
              </li>
            </ul>
          ),
        },
        {
          num: '/02',
          heading: 'No third-party anything',
          body: (
            <p>
              No analytics, no advertising networks, no embedded trackers, no remote
              fonts. Fonts are bundled with the app, not fetched from a third party.
              There is nothing here that reports your behaviour to anyone.
            </p>
          ),
        },
        {
          num: '/03',
          heading: 'The host keeps its own logs',
          body: (
            <p>
              The site is served by Cloudflare Pages, which keeps standard request logs
              at the hosting layer, as any web host does. That is covered in the{' '}
              <a className="text-gold hover:underline" href="/privacy">
                privacy note
              </a>
              . NovaBash adds nothing on top of it.
            </p>
          ),
        },
        {
          num: '/04',
          heading: 'Clearing it',
          body: (
            <p>
              Clear this site&apos;s data in your browser to remove the local storage and
              the vault. Export an encrypted backup first, because that wipe is final.
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

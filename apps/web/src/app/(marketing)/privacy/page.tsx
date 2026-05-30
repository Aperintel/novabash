import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy Notice',
  description: 'NovaBash collects no personal data. There is no account, no server, and no database.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="privacy notice"
      effective="2026-05-30"
      title={
        <>
          We do not collect your data.
          <br />
          <span className="text-fg-dim">There is nowhere for it to go.</span>
        </>
      }
      intro={
        <>
          <p className="mb-4">
            NovaBash runs entirely in your browser. There is no NovaBash account, no
            NovaBash server, and no NovaBash database. We do not collect, receive, or
            store your personal data, because there is no backend to send it to. Your
            vault stays on your own device.
          </p>
          <p>
            This notice exists to be honest about the few edges that remain (mainly
            how the website itself is served) and to be clear that the data you put
            into NovaBash is yours and stays with you. Questions go to{' '}
            <a className="text-gold hover:underline" href="mailto:enquiries@aperintel.com">
              enquiries@aperintel.com
            </a>
            .
          </p>
        </>
      }
      sections={[
        {
          num: '/01',
          heading: 'Who we are',
          body: (
            <p>
              Aperintel, based in London, United Kingdom, makes NovaBash. Because
              NovaBash does not collect personal data through a service, there is no
              controller-to-data-subject relationship to manage here. The source code
              is public at{' '}
              <a
                className="text-gold hover:underline"
                href="https://github.com/aperintel/novabash"
                rel="noopener noreferrer"
              >
                github.com/aperintel/novabash
              </a>
              , so you can verify everything below for yourself.
            </p>
          ),
        },
        {
          num: '/02',
          heading: 'What we collect',
          body: (
            <>
              <p>
                Nothing on a NovaBash server, because there is not one. Your vault, the
                services and keys you add, and the audit log are encrypted in your
                browser and stored on your device. They are never transmitted to us.
                There is no sign-up, so we hold no email address, no profile, and no
                billing details.
              </p>
              <p>
                Your passphrase is never stored and never leaves the page. We could not
                read your vault if we wanted to, and we do not want to.
              </p>
            </>
          ),
        },
        {
          num: '/03',
          heading: 'The one honest edge: hosting',
          body: (
            <p>
              The website is a set of static files served by Cloudflare Pages. Like any
              web host or CDN, Cloudflare processes standard request information (such as
              your IP address, the file requested, and your browser user agent) in its
              own logs in order to deliver the page and protect against abuse. That
              happens at the hosting layer under Cloudflare&apos;s own terms. NovaBash
              neither controls nor receives those logs, and we add no analytics, no
              tracking pixels, and no third-party scripts on top of them.
            </p>
          ),
        },
        {
          num: '/04',
          heading: 'No cookies, no tracking',
          body: (
            <p>
              We set no cookies. We run no analytics and load no third-party scripts. The
              only browser storage NovaBash uses is local storage and IndexedDB, which
              hold your encrypted vault on your device. See the{' '}
              <a className="text-gold hover:underline" href="/cookies">
                cookie note
              </a>{' '}
              for the short version.
            </p>
          ),
        },
        {
          num: '/05',
          heading: 'Your data is yours, and it is local',
          body: (
            <>
              <p>
                Because everything lives on your device, you exercise control directly,
                without asking us:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-[14.5px]">
                <li>Export the encrypted vault to a file at any time, for backup or to move machines.</li>
                <li>Delete it instantly with the app&apos;s destroy action, or by clearing this site&apos;s data in your browser.</li>
              </ul>
              <p>
                There is nothing held by us to request, correct, or erase. If you ever
                think otherwise, write to{' '}
                <a className="text-gold hover:underline" href="mailto:enquiries@aperintel.com">
                  enquiries@aperintel.com
                </a>{' '}
                and we will look into it.
              </p>
            </>
          ),
        },
        {
          num: '/06',
          heading: 'Children',
          body: (
            <p>
              NovaBash is a developer tool and is not aimed at children. Since we collect
              no personal data from anyone, we hold none on children either.
            </p>
          ),
        },
        {
          num: '/07',
          heading: 'Changes to this notice',
          body: (
            <p>
              If the product changes in a way that affects this notice, we update it and
              change the effective date at the top. The public source code is always the
              definitive record of what NovaBash actually does.
            </p>
          ),
        },
      ]}
      contactLine={
        <p>
          Privacy or security questions go to{' '}
          <a className="text-gold hover:underline" href="mailto:enquiries@aperintel.com">
            enquiries@aperintel.com
          </a>
          , or open an issue on the public repository.
        </p>
      }
    />
  );
}

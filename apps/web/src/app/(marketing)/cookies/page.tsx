import { LegalPage } from '@/components/LegalPage';

export const metadata = {
  title: 'Cookie Notice',
  description:
    'What NovaBash sets in your browser, why, and how to opt out where it makes sense.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="cookie notice"
      effective="2026-05-09"
      title={
        <>
          Cookies, in three categories,
          <br />
          <span className="text-fg-dim">none of them tracking you across sites.</span>
        </>
      }
      intro={
        <>
          <p className="mb-4">
            NovaBash uses a small number of first-party cookies and similar storage to keep you
            signed in and to make the dashboard work. We do not use third-party advertising
            cookies, we do not embed cross-site trackers, and the analytics we run is cookieless
            by design. This notice lists exactly what is set and why, and how to opt out where
            opting out is meaningful.
          </p>
        </>
      }
      sections={[
        {
          num: '/01',
          heading: 'Strictly necessary',
          body: (
            <>
              <p>
                These keep the product working. Disabling them in your browser breaks the
                product, so we do not ask for consent for them.
              </p>
              <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[12.5px]">
                {[
                  ['sb-access-token', 'Supabase Auth · keeps you signed in', 'Session'],
                  ['sb-refresh-token', 'Supabase Auth · refreshes the session', '7 days'],
                  ['nb-csrf', 'Cross-site request forgery protection on form posts', 'Session'],
                  ['nb-workspace', 'Currently selected workspace, for the dashboard', '30 days'],
                ].map(([name, role, retention]) => (
                  <li
                    key={name}
                    className="grid grid-cols-[180px_1fr_100px] items-baseline gap-3 border-b border-hairline pb-3 last:border-b-0"
                  >
                    <span className="text-fg">{name}</span>
                    <span className="text-fg-mid">{role}</span>
                    <span className="text-right text-fg-dim">{retention}</span>
                  </li>
                ))}
              </ul>
            </>
          ),
        },
        {
          num: '/02',
          heading: 'Functional preferences',
          body: (
            <>
              <p>
                These remember small UI choices so the product feels less amnesiac between
                visits. They are first-party only and they are not shared with any third party.
              </p>
              <ul className="list-none space-y-3 border-t border-hairline pt-4 font-mono text-[12.5px]">
                {[
                  ['nb-env', 'Last selected environment in the dashboard', '90 days'],
                  ['nb-density', 'Compact or comfortable table density', '365 days'],
                  ['nb-cmdk-recent', 'Recent commands in the ⌘K palette', '30 days'],
                ].map(([name, role, retention]) => (
                  <li
                    key={name}
                    className="grid grid-cols-[180px_1fr_100px] items-baseline gap-3 border-b border-hairline pb-3 last:border-b-0"
                  >
                    <span className="text-fg">{name}</span>
                    <span className="text-fg-mid">{role}</span>
                    <span className="text-right text-fg-dim">{retention}</span>
                  </li>
                ))}
              </ul>
              <p>
                You can clear these from your browser at any time without breaking the product,
                only losing the small preference they remember.
              </p>
            </>
          ),
        },
        {
          num: '/03',
          heading: 'Analytics (cookieless)',
          body: (
            <>
              <p>
                Product analytics is provided by Plausible, which intentionally does not use
                cookies and does not collect personal data. Page views are aggregated based on a
                daily salted hash that does not persist across days, so we cannot link sessions,
                we cannot track you across sites, and there is no opt-out to operate because
                there is nothing identifying you to opt out of. The Plausible policy is at{' '}
                <a
                  className="text-gold hover:underline"
                  href="https://plausible.io/privacy-focused-web-analytics"
                  rel="noopener noreferrer"
                >
                  plausible.io/privacy-focused-web-analytics
                </a>
                .
              </p>
            </>
          ),
        },
        {
          num: '/04',
          heading: 'Local storage and other browser storage',
          body: (
            <>
              <p>
                In addition to cookies, the dashboard uses localStorage for non-sensitive UI
                state (which sections are expanded, last viewed bundle), and uses sessionStorage
                for short-lived form drafts during the connect flow. Neither contains
                credentials or personal data, both clear when you sign out, and clearing your
                browser storage at any time only resets UI state.
              </p>
            </>
          ),
        },
        {
          num: '/05',
          heading: 'How to control cookies',
          body: (
            <>
              <p>
                The strictly necessary cookies cannot be disabled without breaking sign-in. The
                functional cookies can be disabled by your browser&apos;s site-data controls
                without breaking anything other than the small preference they remember. The
                analytics is cookieless and there is nothing to disable on your side.
              </p>
              <p>
                If you want to clear everything NovaBash has set in your browser, use your
                browser&apos;s site-data controls for novabash.dev. We do not run a separate
                consent banner because we do not set non-essential cookies that would require
                one under PECR.
              </p>
            </>
          ),
        },
        {
          num: '/06',
          heading: 'Changes to this notice',
          body: (
            <>
              <p>
                When we add or remove a cookie, this page updates and the effective date moves.
                For any change that introduces a non-essential cookie or similar tracking, we
                will add a consent prompt at the same time.
              </p>
            </>
          ),
        },
      ]}
      contactLine={
        <p>
          Cookie or tracking questions go to{' '}
          <a className="text-gold hover:underline" href="mailto:privacy@novabash.dev">
            privacy@novabash.dev
          </a>
          .
        </p>
      }
    />
  );
}

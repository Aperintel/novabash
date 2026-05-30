import type { Metadata } from 'next';
import { Onest, JetBrains_Mono } from 'next/font/google';
import { VaultProvider } from '@/lib/vault';
import { CookieNotice } from '@/components/CookieNotice';
import { Pwa } from '@/components/Pwa';
import './globals.css';

export const viewport = {
  themeColor: '#0a0a0a',
};

const DESCRIPTION =
  'A local-first vault for the API keys your projects run on. Encrypted in your browser, never sent to a server.';

const onest = Onest({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-onest',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://novabash.dev'),
  title: {
    default: 'NovaBash',
    template: '%s · NovaBash',
  },
  description: DESCRIPTION,
  applicationName: 'NovaBash',
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'Aperintel' }],
  keywords: ['local-first', 'secrets vault', 'env management', 'BYOK', 'developer tools'],
  openGraph: {
    title: 'NovaBash',
    description: DESCRIPTION,
    url: 'https://novabash.dev',
    siteName: 'NovaBash',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaBash',
    description: DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${onest.variable} ${mono.variable}`}>
      <body>
        <VaultProvider>{children}</VaultProvider>
        <Pwa />
        <CookieNotice />
      </body>
    </html>
  );
}

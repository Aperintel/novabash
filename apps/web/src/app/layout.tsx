import type { Metadata } from 'next';
import { Onest, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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
  description:
    'One workspace, one encrypted vault, one .env file. NovaBash provisions and watches the services your stack actually runs on.',
  applicationName: 'NovaBash',
  authors: [{ name: 'Aperintel' }],
  keywords: ['developer infrastructure', 'env management', 'BYOK', 'stack bundles'],
  openGraph: {
    title: 'NovaBash',
    description:
      'One workspace, one encrypted vault, one .env file. NovaBash provisions and watches the services your stack actually runs on.',
    url: 'https://novabash.dev',
    siteName: 'NovaBash',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaBash',
    description:
      'One workspace, one encrypted vault, one .env file. NovaBash provisions and watches the services your stack actually runs on.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${onest.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

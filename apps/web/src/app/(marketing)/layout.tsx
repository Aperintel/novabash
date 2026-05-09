import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-bg/85 px-7 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-fg" aria-label="NovaBash home">
          <span className="text-gold">
            <Logo size={22} />
          </span>
          <span className="text-[18px] font-extrabold tracking-heading">NovaBash</span>
          <span className="ml-1 border border-hairline-bright px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-caps text-fg-dim">
            preview
          </span>
        </Link>
        <nav className="flex justify-self-center gap-1 font-mono text-[12px]">
          <Link
            href="/"
            className="px-3 py-2 text-fg-dim transition-colors duration-150 ease-nb hover:text-fg"
          >
            <span className="mr-2 text-fg-fade">01</span>overview
          </Link>
          <Link
            href="/changelog"
            className="px-3 py-2 text-fg-dim transition-colors duration-150 ease-nb hover:text-fg"
          >
            <span className="mr-2 text-fg-fade">02</span>changelog
          </Link>
        </nav>
        <div className="flex justify-end">
          <Link
            href="/sign-in"
            className="border border-hairline-bright px-3 py-1.5 font-mono text-[11px] text-fg-mid transition-colors duration-150 ease-nb hover:border-gold hover:text-gold"
          >
            sign in
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-32 border-t border-hairline">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-7 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-fg-dim">
            <span className="text-gold">
              <Logo size={18} />
            </span>
            <span className="font-mono text-[11px]">© 2026 Aperintel · NovaBash</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] text-fg-dim">
            <Link href="/changelog" className="hover:text-fg">
              changelog
            </Link>
            <Link href="/security" className="hover:text-fg">
              security
            </Link>
            <Link href="/privacy" className="hover:text-fg">
              privacy
            </Link>
            <a
              href="https://github.com/novabash"
              className="hover:text-fg"
              rel="noopener noreferrer"
            >
              github
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { Logo } from '@/components/Logo';

const tabs: Array<{ href: string; num: string; label: string }> = [
  { href: '/', num: '01', label: 'overview' },
  { href: '/stacks', num: '02', label: 'stacks' },
  { href: '/pricing', num: '03', label: 'pricing' },
  { href: '/dashboard', num: '04', label: 'dashboard' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-bg/85 px-7 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-fg" aria-label="NovaBash home">
          <span className="text-gold">
            <Logo size={22} />
          </span>
          <span className="text-[18px] font-extrabold tracking-heading">NovaBash</span>
          <span className="ml-2 border border-hairline-bright px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-caps text-fg-dim">
            v0.1 beta
          </span>
        </Link>
        <nav className="flex justify-self-center gap-0">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex items-center gap-2 px-3.5 py-2 font-mono text-[12px] text-fg-dim transition-colors duration-150 ease-nb hover:text-fg"
            >
              <span className="text-fg-fade">{t.num}</span>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 border border-hairline-bright px-2.5 py-1.5 font-mono text-[11px] text-fg-mid transition-colors duration-150 ease-nb hover:border-gold hover:text-gold"
          >
            <span className="font-mono">⌘</span>
            <kbd className="border border-hairline-bright bg-bg-elev-2 px-1 text-[10px]">⌘K</kbd>
          </button>
          <Link
            href="/dashboard"
            className="bg-gold px-4 py-1.5 text-[12px] font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright"
          >
            launch app
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-32 border-t border-hairline">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-3 px-7 py-6 text-[12px] text-fg-dim">
          <span className="flex items-center gap-2">
            <span className="text-gold-deep">
              <Logo size={14} />
            </span>
            © 2026 Aperintel
          </span>
          <Link href="/terms" className="hover:text-fg">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <Link href="/dpa" className="hover:text-fg">
            DPA
          </Link>
          <Link href="/cookies" className="hover:text-fg">
            Cookies
          </Link>
          <Link href="/security" className="hover:text-fg">
            Security
          </Link>
          <Link href="/changelog" className="hover:text-fg">
            Build log
          </Link>
          <a
            href="https://github.com/osiabu/novabash"
            className="hover:text-fg"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://x.com/novabash"
            className="hover:text-fg"
            rel="noopener noreferrer"
          >
            X
          </a>
          <span className="ml-auto flex items-center gap-2 font-mono text-[11px]">
            <span className="block h-1.5 w-1.5 animate-glow bg-mint shadow-[0_0_6px_var(--mint)]" />
            All systems normal
          </span>
        </div>
      </footer>
    </div>
  );
}

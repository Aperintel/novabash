import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import type { IconName } from '@novabash/brand';

const tabs: Array<{ href: string; num: string; label: string; icon: IconName }> = [
  { href: '/dashboard', num: '01', label: 'overview', icon: 'overview' },
  { href: '/stacks', num: '02', label: 'stacks', icon: 'stacks' },
  { href: '/vault', num: '03', label: 'vault', icon: 'vault' },
  { href: '/services', num: '04', label: 'services', icon: 'services' },
  { href: '/community', num: '05', label: 'community', icon: 'community' },
  { href: '/settings', num: '06', label: 'settings', icon: 'settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-bg/85 px-7 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-fg" aria-label="NovaBash home">
          <span className="text-gold">
            <Logo size={22} />
          </span>
          <span className="text-[18px] font-extrabold tracking-heading">NovaBash</span>
          <span className="ml-1 border border-hairline-bright px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-caps text-fg-dim">
            workspace
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
              <Icon name={t.icon} size={14} />
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 border border-hairline-bright px-2.5 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
          >
            <Icon name="search" size={12} />
            <span>command</span>
            <kbd className="border border-hairline-bright bg-bg-elev-2 px-1 text-[10px]">⌘K</kbd>
          </button>
          <span
            className="block h-7 w-7 border border-hairline-bright bg-bg-elev-2"
            aria-label="Account avatar placeholder"
          />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

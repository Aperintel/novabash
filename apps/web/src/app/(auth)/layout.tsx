import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="grid h-14 grid-cols-3 items-center border-b border-hairline px-7">
        <Link href="/" className="flex items-center gap-2.5 text-fg" aria-label="NovaBash home">
          <span className="text-gold">
            <Logo size={22} />
          </span>
          <span className="text-[18px] font-extrabold tracking-heading">NovaBash</span>
        </Link>
        <span className="justify-self-center font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          authenticate
        </span>
        <Link
          href="/"
          className="justify-self-end font-mono text-[11px] text-fg-dim transition-colors hover:text-fg"
        >
          ← back
        </Link>
      </header>
      <main className="mx-auto flex max-w-[480px] flex-col px-7 py-16">{children}</main>
    </div>
  );
}

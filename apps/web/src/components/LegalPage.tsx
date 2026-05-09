import Link from 'next/link';

export interface LegalSection {
  num: string;
  heading: string;
  body: React.ReactNode;
}

export interface LegalPageProps {
  eyebrow: string;
  title: React.ReactNode;
  effective: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  contactLine?: React.ReactNode;
  draftNote?: boolean;
}

export function LegalPage({
  eyebrow,
  title,
  effective,
  intro,
  sections,
  contactLine,
  draftNote = true,
}: LegalPageProps) {
  return (
    <div className="mx-auto max-w-[860px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">legal</span>
        <span>{eyebrow}</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        <span>effective {effective}</span>
      </div>

      <h1 className="mb-6 text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-heading">
        {title}
      </h1>

      <div className="mb-12 max-w-[680px] text-[16px] leading-[1.65] text-fg-mid">{intro}</div>

      {draftNote && (
        <div className="mb-12 border border-hairline-bright bg-bg-elev p-5">
          <p className="font-mono text-[11.5px] leading-[1.7] text-fg-dim">
            <span className="text-gold">// note</span> &nbsp; This page is a working draft for
            v0.1. Before NovaBash takes its first paying customer, every legal page on this
            domain goes through a UK technology solicitor for review. Until that pass, treat the
            text below as an honest description of what NovaBash does, not a binding contract.
            The final reviewed versions will replace these drafts ahead of the v1.0 launch and
            will be archived here with the original effective dates so the trail stays intact.
          </p>
        </div>
      )}

      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.num} id={s.num.replace('/', '').toLowerCase()}>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-mono text-[12px] tracking-[0.06em] text-gold">{s.num}</span>
              <h2 className="text-[22px] font-bold tracking-heading">{s.heading}</h2>
            </div>
            <div className="space-y-4 text-[15px] leading-[1.7] text-fg-mid">{s.body}</div>
          </section>
        ))}
      </div>

      {contactLine && (
        <div className="mt-16 border-t border-hairline pt-8 text-[14px] leading-[1.6] text-fg-mid">
          {contactLine}
        </div>
      )}

      <div className="mt-12 flex items-center gap-4 font-mono text-[11px] text-fg-dim">
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
      </div>
    </div>
  );
}

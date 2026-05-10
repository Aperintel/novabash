import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { trending } from '@/lib/community-mock';

export const metadata = {
  title: 'Community catalogue',
  description:
    'Forkable, starred, attribution-tracked stack bundles published by NovaBash developers.',
};

export default function CommunityPage() {
  const items = trending();
  return (
    <div className="mx-auto max-w-[1400px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">community</span>
        <span>catalogue</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        <span>{items.length} bundles</span>
      </div>

      <h1 className="mb-5 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Bundles other people&apos;s teams already run.
        <br />
        <span className="text-fg-dim">Fork them, star them, ship.</span>
      </h1>
      <p className="mb-14 max-w-[640px] text-[17px] leading-[1.55] text-fg-mid">
        Every bundle below was published by a developer like you. Forking copies the architecture
        into your own workspace and keeps a lineage link to the original. Stars and reviews are
        weighted by reviewer experience so the trending feed surfaces what actually works.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <Link
            key={b.id}
            href={`/b/${b.slug}`}
            className="group flex flex-col gap-3 border border-hairline-bright bg-bg-elev p-6 transition-colors duration-200 ease-nb hover:border-gold hover:bg-gold-fade"
          >
            <header className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-hairline-bright bg-bg-elev-2 text-fg-mid transition-colors group-hover:border-gold group-hover:text-gold">
                <Icon name={b.icon} size={16} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
                {b.tagline}
              </span>
            </header>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[20px] font-bold tracking-heading">{b.name}</h3>
              {b.parentSlug && (
                <span className="font-mono text-[10px] text-fg-dim">
                  fork of /{b.parentSlug}
                </span>
              )}
            </div>
            <p className="text-[14px] leading-[1.55] text-fg-mid">{b.description}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {b.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="border border-hairline-bright bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-dim"
                >
                  {t}
                </span>
              ))}
            </div>
            <footer className="mt-3 flex items-center justify-between border-t border-hairline pt-3 font-mono text-[11px] text-fg-dim">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Icon name="star" size={11} />
                  {b.starCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="fork" size={11} />
                  {b.forkCount}
                </span>
                <span className="text-fg-mid">★ {b.averageRating.toFixed(1)}</span>
              </span>
              <span>by @{b.authorHandle}</span>
            </footer>
          </Link>
        ))}
      </div>
    </div>
  );
}

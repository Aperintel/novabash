import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { bundleBySlug } from '@/lib/community-mock';

interface PageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: PageProps) {
  const b = bundleBySlug(params.slug);
  if (!b) return { title: 'Bundle not found' };
  return {
    title: `${b.name} · Bundle`,
    description: b.description,
  };
}

export default function BundleDetailPage({ params }: PageProps) {
  const b = bundleBySlug(params.slug);
  if (!b) notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <Link href="/community" className="text-gold hover:underline">
          community
        </Link>
        <span>/</span>
        <span>{b.slug}</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>

      <div className="mb-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-hairline-bright bg-bg-elev-2 text-gold">
              <Icon name={b.icon} size={18} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
              {b.tagline}
            </span>
          </div>
          <h1 className="mb-3 text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-heading">
            {b.name}
          </h1>
          {b.parentSlug && (
            <p className="mb-4 font-mono text-[11px] text-fg-dim">
              fork of{' '}
              <Link href={`/b/${b.parentSlug}`} className="text-gold hover:underline">
                /{b.parentSlug}
              </Link>{' '}
              · attribution preserved on every commit
            </p>
          )}
          <p className="mb-8 text-[17px] leading-[1.6] text-fg-mid">{b.description}</p>

          <div className="mb-8 flex items-center gap-2 font-mono text-[11px]">
            {b.tags.map((t) => (
              <span
                key={t}
                className="border border-hairline-bright bg-bg-elev-2 px-2 py-0.5 text-fg-dim"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mb-12 border border-hairline-bright bg-bg-elev p-6">
            <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              <span>services in this bundle</span>
              <span>{b.services.length} keys</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {b.services.map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[12.5px]"
                >
                  <span className="text-fg">{s}</span>
                  <span className="text-fg-dim">→ connect step ready</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="mb-4 text-[20px] font-bold tracking-heading">Reviews</h2>
            <div className="border border-hairline-bright bg-bg-elev">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                <span className="font-mono text-[12px] text-fg-dim">
                  {b.reviewCount} reviews · weighted avg
                </span>
                <span className="text-[20px] font-bold tracking-heading">
                  {b.averageRating.toFixed(1)} <span className="text-gold">★</span>
                </span>
              </div>
              <div className="px-5 py-4 text-[13.5px] leading-[1.6] text-fg-mid">
                Reviews are weighted by how many bundles a reviewer has shipped that other
                developers forked, so the average rating is not a popularity score, it is a
                "would another senior trust this stack" score. Be the first to review.
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="border border-hairline-bright bg-bg-elev p-5">
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="stars" value={String(b.starCount)} />
              <Stat label="forks" value={String(b.forkCount)} />
              <Stat label="rating" value={b.averageRating.toFixed(1)} />
            </div>
            <Link
              href={`/connect?bundle=${b.slug}`}
              className="mb-2 flex items-center justify-center gap-2 bg-gold py-3 text-[13.5px] font-semibold text-bg transition-colors hover:bg-gold-bright"
            >
              <Icon name="fork" size={14} />
              Fork into workspace
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 border border-hairline-bright py-2.5 text-[13px] text-fg transition-colors hover:border-gold hover:text-gold"
            >
              <Icon name="star" size={12} />
              Star
            </button>
          </div>
          <div className="border border-hairline-bright bg-bg-elev p-5">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              author
            </div>
            <Link
              href={`/u/${b.authorHandle}`}
              className="flex items-center gap-3 text-[14px] text-fg hover:text-gold"
            >
              <span className="grid h-8 w-8 place-items-center border border-hairline-bright bg-bg-elev-2 font-mono text-[10px] uppercase text-fg-dim">
                {b.authorHandle.slice(0, 2)}
              </span>
              <span>
                <span className="block font-semibold">{b.authorName}</span>
                <span className="block font-mono text-[11px] text-fg-dim">
                  @{b.authorHandle}
                </span>
              </span>
            </Link>
          </div>
          <div className="border border-hairline-bright bg-bg-elev p-5">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              changelog
            </div>
            <p className="font-mono text-[11px] leading-[1.7] text-fg-dim">
              published {new Date(b.createdAt).toLocaleDateString('en-GB')}
              <br />
              service set unchanged since publish
              <br />
              author has not opened a v2
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-hairline last:border-r-0">
      <div className="text-[20px] font-extrabold tracking-display text-fg">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">{label}</div>
    </div>
  );
}

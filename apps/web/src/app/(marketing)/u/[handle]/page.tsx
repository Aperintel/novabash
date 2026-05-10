import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { bundlesByAuthor, seededBundles } from '@/lib/community-mock';

interface PageProps {
  params: { handle: string };
}

const profiles: Record<string, { name: string; bio: string; website?: string; githubLogin?: string }> = {
  osi: {
    name: 'Osi Abu',
    bio: 'Founder of Aperintel, building NovaBash. Senior Test Analyst at TPR. Writes about AI governance, ships AI-assisted, lives in London.',
    website: 'https://osiabu.vercel.app',
    githubLogin: 'osiabu',
  },
  priya: {
    name: 'Priya Iyer',
    bio: 'RAG-native engineer. Forked Builder AI for documentation chat at a B2B SaaS in Bangalore.',
    githubLogin: 'priyaiyer',
  },
  leo: {
    name: 'Leo Adesanya',
    bio: 'Solo SaaS builder, ex-fintech engineer, moved to Lagos in 2025 to ship a freight invoicing product.',
    githubLogin: 'leo-ades',
  },
};

export function generateMetadata({ params }: PageProps) {
  const profile = profiles[params.handle];
  if (!profile) return { title: 'Profile not found' };
  return {
    title: `${profile.name} (@${params.handle})`,
    description: profile.bio,
  };
}

export default function ProfilePage({ params }: PageProps) {
  const profile = profiles[params.handle];
  if (!profile) notFound();

  const published = bundlesByAuthor(params.handle);
  const totalForks = published.reduce((acc, b) => acc + b.forkCount, 0);
  const totalStars = published.reduce((acc, b) => acc + b.starCount, 0);

  return (
    <div className="mx-auto max-w-[1100px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <Link href="/community" className="text-gold hover:underline">
          community
        </Link>
        <span>/</span>
        <span>profile</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>

      <header className="mb-10 grid items-center gap-7 sm:grid-cols-[auto_1fr_auto]">
        <span className="grid h-20 w-20 place-items-center border border-hairline-bright bg-bg-elev-2 font-mono text-[20px] uppercase text-fg">
          {params.handle.slice(0, 2)}
        </span>
        <div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
            @{params.handle}
          </div>
          <h1 className="mb-2 text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.05] tracking-heading">
            {profile.name}
          </h1>
          <p className="max-w-[640px] text-[15px] leading-[1.6] text-fg-mid">{profile.bio}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] text-fg-dim">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.githubLogin && (
              <a
                href={`https://github.com/${profile.githubLogin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                github · {profile.githubLogin}
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 border border-hairline-bright bg-bg-elev sm:grid-cols-1">
          <Stat label="published" value={String(published.length)} />
          <Stat label="forks received" value={String(totalForks)} />
          <Stat label="stars received" value={String(totalStars)} />
        </div>
      </header>

      <section className="mb-12">
        <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">01</span>
          <span>published bundles</span>
          <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        </div>
        {published.length === 0 ? (
          <p className="text-[14px] text-fg-mid">No published bundles yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {published.map((b) => (
              <Link
                key={b.id}
                href={`/b/${b.slug}`}
                className="group flex flex-col gap-2 border border-hairline-bright bg-bg-elev p-5 transition-colors hover:border-gold hover:bg-gold-fade"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-bold tracking-heading">{b.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
                    {b.tagline}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.55] text-fg-mid">{b.description}</p>
                <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-fg-dim">
                  <span className="flex items-center gap-1.5">
                    <Icon name="star" size={11} />
                    {b.starCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="fork" size={11} />
                    {b.forkCount}
                  </span>
                  <span>★ {b.averageRating.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">02</span>
          <span>recent forks of bundles by @{params.handle}</span>
          <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        </div>
        <div className="border border-hairline-bright bg-bg-elev">
          {seededBundles
            .filter((b) => b.parentSlug && published.some((p) => p.slug === b.parentSlug))
            .map((b) => (
              <Link
                key={b.id}
                href={`/b/${b.slug}`}
                className="flex items-center justify-between border-b border-hairline px-5 py-3 last:border-b-0 hover:bg-bg-elev-2"
              >
                <span className="font-mono text-[12.5px] text-fg">/{b.slug}</span>
                <span className="font-mono text-[11px] text-fg-dim">
                  fork of /{b.parentSlug} by @{b.authorHandle} ·{' '}
                  {new Date(b.createdAt).toLocaleDateString('en-GB')}
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-hairline px-5 py-4 text-center last:border-r-0 sm:border-r-0 sm:border-b sm:last:border-b-0">
      <div className="text-[22px] font-extrabold leading-none tracking-display text-fg">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-caps text-fg-dim">{label}</div>
    </div>
  );
}

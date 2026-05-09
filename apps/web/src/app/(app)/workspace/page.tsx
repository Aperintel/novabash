import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EnvPreview } from '@/components/EnvPreview';
import { WorkspaceKeyReveal } from '@/components/WorkspaceKeyReveal';
import { Icon } from '@/components/Icon';
import { bundleById } from '@/lib/bundles';

export const metadata = { title: 'Workspace' };

export default function WorkspacePage({
  searchParams,
}: {
  searchParams: { bundle?: string };
}) {
  const bundleId = searchParams.bundle;
  const bundle = bundleId ? bundleById(bundleId) : undefined;
  if (!bundle) redirect('/onboarding');

  // Stub workspace key. Real implementation: CSPRNG, hashed for lookup, never
  // re-derivable from the database row. Generated on vault seal.
  const workspaceKey = 'nbk_dev_' + Math.random().toString(36).slice(2, 30) + '_demo';

  return (
    <div className="mx-auto max-w-[1100px] px-7 py-12">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-mint">activated</span>
        <span>{bundle.name}</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        <span>{bundle.keyCount} keys validated</span>
      </div>
      <h1 className="mb-3 text-[40px] font-extrabold leading-[1.05] tracking-heading">
        Workspace ready. .env in three flavours.
      </h1>
      <p className="mb-10 max-w-[640px] text-[15px] leading-[1.6] text-fg-mid">
        Development for your laptop, staging for the preview deploy, production for the live one.
        Variable names follow the convention of {bundle.name}&apos;s primary framework. Everything
        regenerates on rotation.
      </p>

      <div className="mb-12">
        <WorkspaceKeyReveal workspaceKey={workspaceKey} />
      </div>

      <section className="mb-12">
        <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">.env</span>
          <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        </div>
        <EnvPreview bundleId={bundle.id} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <NextStepCard
          icon="overview"
          title="Open the dashboard"
          body="Live usage from every connected service, on one screen."
          href="/dashboard"
        />
        <NextStepCard
          icon="rotate"
          title="Set rotation reminders"
          body="Default ninety-day cycles per service. You can soften or tighten them."
          href="/vault?tab=rotation"
        />
        <NextStepCard
          icon="downloadEnv"
          title="Pull from the CLI"
          body="npm install -g @novabash/cli && novabash login"
          href="/docs/cli"
        />
      </section>
    </div>
  );
}

function NextStepCard({
  icon,
  title,
  body,
  href,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2.5 border border-hairline-bright bg-bg-elev p-5 transition-colors duration-150 ease-nb hover:border-gold hover:bg-gold-fade"
    >
      <span className="text-fg-dim transition-colors group-hover:text-gold">
        <Icon name={icon} size={18} />
      </span>
      <span className="text-[15px] font-bold tracking-heading">{title}</span>
      <span className="text-[13px] leading-[1.55] text-fg-mid">{body}</span>
    </Link>
  );
}

import { redirect } from 'next/navigation';
import { ConnectFlow } from './ConnectFlow';
import { bundleById } from '@/lib/bundles';

export const metadata = { title: 'Connect services' };

export default function ConnectPage({
  searchParams,
}: {
  searchParams: { bundle?: string };
}) {
  const bundleId = searchParams.bundle;
  const bundle = bundleId ? bundleById(bundleId) : undefined;
  if (!bundle) redirect('/onboarding');

  return (
    <div className="mx-auto max-w-[920px] px-7 py-12">
      <div className="mb-8 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">connect</span>
        <span>{bundle.name}</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        <span>{bundle.keyCount} keys</span>
      </div>
      <h1 className="mb-3 text-[36px] font-extrabold leading-[1.05] tracking-heading">
        Hand the keys over, get a workspace back.
      </h1>
      <p className="mb-10 max-w-[600px] text-[15px] leading-[1.6] text-fg-mid">
        Each step opens the vendor&apos;s key page. Paste the credential, validate, store. The
        vault encrypts on write and the value never round-trips back to the browser as plaintext.
      </p>
      <ConnectFlow bundleId={bundle.id} />
    </div>
  );
}

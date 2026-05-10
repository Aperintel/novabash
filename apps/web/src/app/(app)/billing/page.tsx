import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Billing' };

export default function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; plan?: string };
}) {
  const justSubscribed = searchParams.success === '1';

  return (
    <div className="mx-auto max-w-[1100px] px-7 py-12">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">settings</span>
        <span>billing</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-3 text-[36px] font-extrabold leading-[1.05] tracking-heading">
        Billing and plan.
      </h1>
      <p className="mb-10 max-w-[640px] text-[15px] leading-[1.6] text-fg-mid">
        Free is permanent. Pro and Studio bill monthly via Stripe with VAT
        added at checkout where applicable. Cancellations take effect at the end of the current
        period.
      </p>

      {justSubscribed && (
        <div className="mb-8 flex items-center gap-3 border border-mint bg-mint-fade px-5 py-3 text-[13.5px] text-fg">
          <Icon name="ok" size={14} />
          <span>
            Subscribed to {searchParams.plan ?? 'a paid plan'}. Receipt has been emailed.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
            <span className="text-gold">01</span>
            <span>current plan</span>
            <span className="h-px max-w-[80px] flex-1 bg-hairline" />
          </div>
          <div className="border border-hairline-bright bg-bg-elev p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-[12px] tracking-[0.04em] text-gold">/free</span>
              <span className="text-[40px] font-extrabold leading-none tracking-display">£0</span>
            </div>
            <p className="text-[14px] leading-[1.6] text-fg-mid">
              Fifty active projects, three environments per project, AES-256 vault, all six
              first-party stack bundles, the open-source CLI. Move to Pro when you need
              sub-minute polling or a teammate.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <CheckoutButton plan="pro" label="Upgrade to Pro · £15/mo" />
              <CheckoutButton plan="studio" label="Upgrade to Studio · £39/mo" muted />
              <Link
                href="/pricing"
                className="ml-auto font-mono text-[11px] text-fg-dim hover:text-gold"
              >
                compare plans →
              </Link>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="border border-hairline-bright bg-bg-elev p-5">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              payment method
            </div>
            <p className="text-[13.5px] leading-[1.6] text-fg-mid">
              Once you upgrade, manage card, address, VAT number, and invoices through the
              Stripe billing portal.
            </p>
            <button
              type="button"
              className="mt-3 w-full border border-hairline-bright py-2 text-[12px] text-fg transition-colors hover:border-gold hover:text-gold"
            >
              Open billing portal
            </button>
          </div>
          <div className="border border-hairline-bright bg-bg-elev p-5">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              invoices
            </div>
            <p className="text-[13px] text-fg-mid">No invoices yet.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutButton({
  plan,
  label,
  muted = false,
}: {
  plan: 'pro' | 'studio';
  label: string;
  muted?: boolean;
}) {
  return (
    <form action="/api/billing/checkout" method="post">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 ease-nb ${
          muted
            ? 'border border-hairline-bright text-fg hover:border-gold hover:text-gold'
            : 'bg-gold text-bg hover:bg-gold-bright'
        }`}
      >
        {label}
      </button>
    </form>
  );
}

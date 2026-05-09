import { Icon } from '@/components/Icon';
import { DashboardActions } from '@/components/DashboardActions';
import { KeyHealthRow } from '@/components/KeyHealthRow';
import { ServiceGraph } from '@/components/ServiceGraph';
import { BurnRateBanner } from '@/components/BurnRateBanner';
import { mockServices, monthlyCostEstimate, type ServiceUsage } from '@/lib/usage-mock';
import { mockHealthRecords } from '@/lib/health-mock';

export const metadata = { title: 'Overview' };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7 py-10">
      <Header />
      <BurnRateBanner services={mockServices} threshold={90} />
      <Summary />
      <Grid services={mockServices} />
      <KeyHealthSection />
      <GraphSection />
      <Activity />
    </div>
  );
}

function KeyHealthSection() {
  const summary = mockHealthRecords.reduce(
    (acc, r) => {
      acc[r.health.overall] = (acc[r.health.overall] ?? 0) + 1;
      return acc;
    },
    { green: 0, amber: 0, red: 0 } as Record<string, number>,
  );
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">03</span>
          <span>key health</span>
          <span className="h-px w-20 bg-hairline" />
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-fg-dim">
          <span className="flex items-center gap-2">
            <span className="block h-1.5 w-1.5 bg-mint" />
            {summary.green ?? 0} green
          </span>
          <span className="flex items-center gap-2">
            <span className="block h-1.5 w-1.5 bg-ember" />
            {(summary.amber ?? 0) + (summary.red ?? 0)} need attention
          </span>
        </div>
      </div>
      <div className="border border-hairline-bright bg-bg-elev">
        {mockHealthRecords.map((r) => (
          <KeyHealthRow key={r.id} record={r} />
        ))}
      </div>
    </section>
  );
}

function GraphSection() {
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">04</span>
        <span>service graph</span>
        <span className="h-px w-20 bg-hairline" />
      </div>
      <div className="border border-hairline-bright bg-bg-elev p-7">
        <ServiceGraph
          services={mockServices.map((s) => ({
            id: s.id,
            name: s.name,
            health: s.health === 'ok' ? 'green' : 'amber',
          }))}
        />
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="mb-9 flex items-end justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="block h-1.5 w-1.5 animate-glow bg-mint shadow-[0_0_8px_var(--mint)]" />
          <span>workspace · acid-thrush-04</span>
          <span className="h-3 w-px bg-hairline-bright" />
          <span>region eu-west-2</span>
        </div>
        <h1 className="text-[36px] font-extrabold leading-[1] tracking-heading">
          All eight services, one screen.
        </h1>
      </div>
      <DashboardActions />
    </div>
  );
}

function Summary() {
  const items = [
    { label: 'connected services', value: '8 / 8', tone: 'mint' as const },
    { label: 'monthly cost estimate', value: monthlyCostEstimate, tone: 'fg' as const },
    { label: 'keys near rotation', value: '1', tone: 'ember' as const },
    { label: 'audit events (24h)', value: '142', tone: 'fg' as const },
  ];
  const toneClass = {
    mint: 'text-mint',
    ember: 'text-ember',
    fg: 'text-fg',
  };
  return (
    <div className="-mx-7 mb-10 grid grid-cols-2 border-y border-hairline px-7 sm:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="border-r border-hairline px-6 py-5 last:border-r-0 sm:[&:nth-child(2)]:border-r"
        >
          <div className={`text-[28px] font-extrabold leading-none tracking-heading ${toneClass[item.tone]}`}>
            {item.value}
          </div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Grid({ services }: { services: ServiceUsage[] }) {
  return (
    <div className="mb-10 grid border-l border-t border-hairline sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceUsage }) {
  const healthInfo = healthMap[service.health];
  return (
    <article className="group flex flex-col justify-between border-b border-r border-hairline bg-bg p-5 transition-colors duration-150 ease-nb hover:bg-bg-elev">
      <header className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-hairline-bright bg-bg-elev-2 text-fg-mid group-hover:border-gold group-hover:text-gold">
            <Icon name={service.icon} size={16} />
          </span>
          <div>
            <div className="text-[14.5px] font-bold tracking-heading">{service.name}</div>
            <div className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
              {service.region}
            </div>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-caps ${healthInfo.text}`}>
          <span className={`block h-1.5 w-1.5 ${healthInfo.bg}`} />
          {healthInfo.label}
        </span>
      </header>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {service.primary.label}
          </span>
          {typeof service.primary.pct === 'number' && (
            <span
              className={`font-mono text-[10px] uppercase tracking-caps ${
                service.primary.pct > 90
                  ? 'text-ember'
                  : service.primary.pct > 70
                    ? 'text-gold'
                    : 'text-fg-dim'
              }`}
            >
              {service.primary.pct.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="mb-3 text-[15px] font-semibold text-fg">{service.primary.value}</div>
        {typeof service.primary.pct === 'number' && (
          <div className="mb-4 h-1 w-full bg-hairline">
            <div
              className={`h-full ${
                service.primary.pct > 90
                  ? 'bg-ember'
                  : service.primary.pct > 70
                    ? 'bg-gold'
                    : 'bg-mint'
              }`}
              style={{ width: `${service.primary.pct}%` }}
            />
          </div>
        )}
        {service.secondary && (
          <div className="flex items-baseline justify-between font-mono text-[11px]">
            <span className="text-fg-dim">{service.secondary.label}</span>
            <span className="text-fg-mid">{service.secondary.value}</span>
          </div>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-3 font-mono text-[10px] uppercase tracking-caps text-fg-dim">
          <span>key age</span>
          <span className={service.keyAgeDays > 90 ? 'text-ember' : 'text-fg-mid'}>
            {service.keyAgeDays}d
          </span>
        </div>
      </div>
    </article>
  );
}

const healthMap = {
  ok: { label: 'healthy', text: 'text-mint', bg: 'bg-mint' },
  rotating: { label: 'rotating', text: 'text-ember', bg: 'bg-ember' },
  idle: { label: 'idle', text: 'text-fg-dim', bg: 'bg-fg-fade' },
  error: { label: 'error', text: 'text-ember', bg: 'bg-ember' },
} as const;

function Activity() {
  const events: Array<{ ts: string; service: string; event: string }> = [
    { ts: '12:48', service: 'OpenRouter', event: 'rotation reminder · key 92 days old' },
    { ts: '12:21', service: 'Vercel', event: 'function invocations crossed 90% of free tier' },
    { ts: '11:04', service: 'Supabase', event: 'service role key read · CLI · pull staging' },
    { ts: '09:50', service: 'Resend', event: 'email key validated against /api-keys' },
    { ts: '09:50', service: 'Lemon Squeezy', event: 'store ID confirmed · 12345' },
  ];

  return (
    <section>
      <div className="mb-5 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">02</span>
        <span>recent activity</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <div className="border border-hairline-bright bg-bg-elev">
        {events.map((e, i) => (
          <div
            key={i}
            className="grid grid-cols-[80px_180px_1fr] items-center gap-4 border-b border-hairline px-5 py-3 last:border-b-0 font-mono text-[12.5px]"
          >
            <span className="text-fg-dim">{e.ts}</span>
            <span className="text-fg">{e.service}</span>
            <span className="text-fg-mid">{e.event}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

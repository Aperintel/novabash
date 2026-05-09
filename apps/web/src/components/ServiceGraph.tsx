'use client';

import { useMemo } from 'react';

export interface GraphService {
  id: string;
  name: string;
  health: 'green' | 'amber' | 'red';
}

interface Edge {
  from: string;
  to: string;
}

/**
 * Static dependency map between services. Each edge means "data flows from
 * source to target". Edges that involve services not present in the
 * workspace are dropped at render time, so the graph is always coherent.
 *
 * Kept as a flat list rather than a database table so the bundle picker
 * can publish a graph hint at fork time. Real flows still come from
 * runtime tracing in week 11+.
 */
const FLOWS: Edge[] = [
  { from: 'vercel', to: 'supabase' },
  { from: 'vercel', to: 'openrouter' },
  { from: 'vercel', to: 'upstash-redis' },
  { from: 'vercel', to: 'upstash-vector' },
  { from: 'vercel', to: 'resend' },
  { from: 'vercel', to: 'inngest' },
  { from: 'vercel', to: 'lemon-squeezy' },
  { from: 'inngest', to: 'openrouter' },
  { from: 'inngest', to: 'supabase' },
  { from: 'openrouter', to: 'upstash-vector' },
];

const HEALTH_TO_STROKE: Record<GraphService['health'], string> = {
  green: 'var(--mint)',
  amber: 'var(--ember)',
  red: 'var(--ember)',
};

const HEALTH_TO_DOT: Record<GraphService['health'], string> = {
  green: 'var(--mint)',
  amber: 'var(--ember)',
  red: 'var(--ember)',
};

/**
 * Lays nodes out on a circle so the graph is always legible regardless of
 * how many services are in the bundle. Vercel (or whatever the apex node
 * is) gets the top slot, then the rest fan out clockwise.
 */
function layoutCircle(services: GraphService[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2.6;
  const apexId = services.find((s) => s.id === 'vercel')?.id ?? services[0]?.id;
  const ordered = [...services].sort((a, b) => {
    if (a.id === apexId) return -1;
    if (b.id === apexId) return 1;
    return a.name.localeCompare(b.name);
  });
  const positions = new Map<string, { x: number; y: number; idx: number }>();
  ordered.forEach((s, i) => {
    const angle = (i / ordered.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(s.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), idx: i });
  });
  return positions;
}

export function ServiceGraph({ services }: { services: GraphService[] }) {
  const width = 880;
  const height = 360;

  const positions = useMemo(() => layoutCircle(services, width, height), [services]);
  const edges = FLOWS.filter((e) => positions.has(e.from) && positions.has(e.to));
  const byId = new Map(services.map((s) => [s.id, s]));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Service dependency graph"
        className="block"
      >
        <defs>
          <marker
            id="nb-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10" stroke="var(--fg-dim)" fill="none" strokeWidth="1.4" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const a = positions.get(e.from)!;
          const b = positions.get(e.to)!;
          // Shorten so the line stops outside the node radius
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const ax = a.x + (dx / len) * 26;
          const ay = a.y + (dy / len) * 26;
          const bx = b.x - (dx / len) * 28;
          const by = b.y - (dy / len) * 28;
          return (
            <line
              key={i}
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="var(--hairline-bright)"
              strokeWidth="1"
              markerEnd="url(#nb-arrow)"
            />
          );
        })}

        {services.map((s) => {
          const p = positions.get(s.id)!;
          return (
            <g key={s.id} transform={`translate(${p.x}, ${p.y})`}>
              <rect
                x={-22}
                y={-22}
                width={44}
                height={44}
                fill="var(--bg-elev-2)"
                stroke="var(--hairline-bright)"
                strokeWidth="1"
              />
              <circle
                cx={0}
                cy={-30}
                r={3}
                fill={HEALTH_TO_DOT[byId.get(s.id)?.health ?? 'green']}
              />
              <text
                x={0}
                y={56}
                textAnchor="middle"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize="11"
                letterSpacing="0.04em"
                fill="var(--fg-mid)"
              >
                {s.name}
              </text>
              <line
                x1={-8}
                y1={0}
                x2={8}
                y2={0}
                stroke={HEALTH_TO_STROKE[byId.get(s.id)?.health ?? 'green']}
                strokeWidth="1.2"
              />
              <circle
                cx={0}
                cy={0}
                r={1.4}
                fill="var(--ember)"
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-5 font-mono text-[11px] text-fg-dim">
        <span className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 bg-mint" />
          healthy
        </span>
        <span className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 bg-ember" />
          attention
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-4 bg-hairline-bright" />
          observed dependency
        </span>
      </div>
    </div>
  );
}

import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge middleware: per-IP rate limit on /api/v1/* routes.
 *
 * Backed by Upstash Redis REST when configured, no-op otherwise. Edge
 * runtime constraints: only Web Fetch APIs, no Node built-ins, so the
 * Upstash REST client (which is just `fetch`) is the right shape here.
 *
 * Default policy: 200 requests per IP per minute. Tunable via env.
 */

export const config = {
  matcher: ['/api/v1/:path*'],
};

interface PipelineResult {
  result?: number | string;
}

const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 200);

export async function middleware(request: NextRequest) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // No rate-limit configured in this environment. Let the request through.
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anon';
  const key = `novabash:rl:${ip}:${Math.floor(Date.now() / (WINDOW_SECONDS * 1000))}`;

  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(WINDOW_SECONDS), 'NX'],
      ]),
    });
    if (!res.ok) {
      // Upstash unhealthy: fail open, do not block traffic on infra blip.
      return NextResponse.next();
    }
    const data = (await res.json()) as PipelineResult[];
    const count = Number(data[0]?.result ?? 0);
    if (count > MAX_REQUESTS) {
      return new NextResponse(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'retry-after': String(WINDOW_SECONDS),
          'x-ratelimit-limit': String(MAX_REQUESTS),
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(Math.ceil(Date.now() / 1000) + WINDOW_SECONDS),
        },
      });
    }
    const response = NextResponse.next();
    response.headers.set('x-ratelimit-limit', String(MAX_REQUESTS));
    response.headers.set('x-ratelimit-remaining', String(Math.max(0, MAX_REQUESTS - count)));
    return response;
  } catch {
    // Network error reaching Upstash: fail open.
    return NextResponse.next();
  }
}

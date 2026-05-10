import { json } from '@/lib/server/responses';

export const runtime = 'nodejs';

export async function GET() {
  return json({
    ok: true,
    service: 'novabash-api',
    version: process.env.APP_VERSION ?? '0.0.0',
    ts: new Date().toISOString(),
  });
}

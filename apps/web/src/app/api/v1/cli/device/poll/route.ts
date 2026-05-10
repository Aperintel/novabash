import { z } from 'zod';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Body = z.object({ device_code: z.string().min(20) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return err(400, 'invalid_request');
  // Real grant lookup lands when device-code persistence is wired.
  return json({ status: 'authorization_pending' }, { status: 202 });
}

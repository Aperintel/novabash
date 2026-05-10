import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';

const Body = z.object({
  customerId: z.string().min(1),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'billing_unconfigured' }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: parsed.data.customerId,
    return_url: `${origin}/billing`,
  });
  return NextResponse.json({ url: portal.url });
}

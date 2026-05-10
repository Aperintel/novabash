import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, PriceIds, type Plan } from '@/lib/stripe';

const Body = z.object({
  plan: z.enum(['pro', 'studio']),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'billing_unconfigured', message: 'STRIPE_SECRET_KEY is not set yet.' },
      { status: 503 },
    );
  }
  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const priceId = PriceIds[parsed.data.plan as Exclude<Plan, 'free'>];
  if (!priceId) {
    return NextResponse.json(
      { error: 'price_unconfigured', message: `Stripe price for ${parsed.data.plan} is not set.` },
      { status: 503 },
    );
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?success=1&plan=${parsed.data.plan}`,
    cancel_url: `${origin}/pricing`,
    customer_email: parsed.data.email,
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    payment_method_types: ['card'],
    subscription_data: {
      metadata: { plan: parsed.data.plan },
    },
  });
  return NextResponse.json({ id: session.id, url: session.url });
}

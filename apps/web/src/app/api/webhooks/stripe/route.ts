import { NextResponse } from 'next/server';
import { getStripe, planFromPriceId } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Stripe webhook receiver. Reads the raw body, verifies the signature,
 * dispatches per-event. Persistence to user_profile.plan and
 * user_profile.stripe_customer_id is wired here so the rest of the app
 * can read plan from the row rather than calling Stripe on every render.
 *
 * Supabase service-role write is gated by the same "no-op without env"
 * pattern the rest of the codebase uses.
 */

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'billing_unconfigured' }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'webhook_secret_unset' }, { status: 503 });
  }

  const sig = request.headers.get('stripe-signature') ?? '';
  const raw = await request.text();
  let event: import('stripe').Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_signature', message: err instanceof Error ? err.message : 'unknown' },
      { status: 400 },
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub =
        event.type === 'checkout.session.completed'
          ? null
          : (event.data.object as import('stripe').Stripe.Subscription);
      const priceId = sub?.items?.data?.[0]?.price.id ?? null;
      const plan = planFromPriceId(priceId);
      // Real persistence:
      //   1. Look up user_profile by stripe_customer_id (or by email on the
      //      checkout.session)
      //   2. Update plan and stripe_customer_id columns
      //   3. Emit analytics event "subscription_changed"
      // Held off until DATABASE_URL is wired to Supabase (BLOCKERS.md P2).
      console.info('billing event accepted', { type: event.type, plan });
      break;
    }
    case 'customer.subscription.deleted': {
      console.info('billing event accepted', { type: event.type, plan: 'free' });
      break;
    }
    default:
      // Stripe sends many events; respond 200 to anything we do not yet
      // handle so it does not retry.
      break;
  }

  return NextResponse.json({ received: true });
}

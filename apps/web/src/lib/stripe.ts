/**
 * Stripe client singleton, lazily constructed so the web app still builds
 * and renders when STRIPE_SECRET_KEY is unset (the same pattern Supabase
 * Auth uses elsewhere in the codebase).
 */

import 'server-only';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

export const PriceIds = {
  pro: process.env.STRIPE_PRICE_PRO,
  studio: process.env.STRIPE_PRICE_STUDIO,
} as const;

export type Plan = 'free' | 'pro' | 'studio';

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (priceId === PriceIds.pro) return 'pro';
  if (priceId === PriceIds.studio) return 'studio';
  return 'free';
}

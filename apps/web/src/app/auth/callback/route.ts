import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/onboarding';

  if (!code) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_code', url.origin));
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL('/sign-in?error=auth_not_configured', url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

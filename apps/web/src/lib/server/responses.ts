import 'server-only';
import { NextResponse } from 'next/server';

export function json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(data, init);
}

export function err(status: number, code: string, message?: string) {
  return NextResponse.json(
    message ? { error: code, message } : { error: code },
    { status },
  );
}

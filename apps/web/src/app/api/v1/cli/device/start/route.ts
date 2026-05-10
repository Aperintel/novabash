import { json } from '@/lib/server/responses';

export const runtime = 'nodejs';

function randomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function cryptoRandom(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST() {
  const code = randomCode();
  return json({
    device_code: cryptoRandom(40),
    user_code: code,
    verification_uri: `https://novabash.dev/cli/${code}`,
    expires_in: 600,
    interval: 2,
  });
}

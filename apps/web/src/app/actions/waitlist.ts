'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const Schema = z.object({
  email: z.string().email().max(254),
});

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'waitlist.jsonl');

export async function joinWaitlist(input: {
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'That email looks off. Try again.' };
  }

  // Until the Supabase project is provisioned, persist locally so no signups
  // are lost. Migrate to a Supabase row once the credentials land.
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const line = JSON.stringify({
      email: parsed.data.email.toLowerCase(),
      ts: new Date().toISOString(),
      source: 'holding-page',
    });
    await fs.appendFile(dataFile, line + '\n', 'utf8');
    return { ok: true };
  } catch (err) {
    console.error('waitlist write failed', err);
    return { ok: false, error: 'Something broke on our side. Try again in a minute.' };
  }
}

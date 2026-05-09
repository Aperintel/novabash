import { promises as fs } from 'node:fs';
import path from 'node:path';
import kleur from 'kleur';
import ora from 'ora';

interface PullOptions {
  env: string;
  out: string;
}

export async function pullCmd(opts: PullOptions) {
  const variant = opts.env;
  const out = path.resolve(process.cwd(), opts.out);

  const spinner = ora({
    text: `pulling ${variant} env from workspace`,
    color: 'yellow',
  }).start();

  // Stub: real implementation fetches /api/cli/env?variant=<v> using the
  // workspace key in ~/.novabash/credentials and writes the response.
  await new Promise((r) => setTimeout(r, 600));
  const stubContent = [
    `# NovaBash · ${variant} · pulled ${new Date().toISOString()}`,
    '# stub content. real CLI returns decrypted .env from your workspace.',
    '',
    'NEXT_PUBLIC_SUPABASE_URL=https://acid-thrush-04.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=<value>',
    '',
  ].join('\n');

  await fs.writeFile(out, stubContent, 'utf8');
  spinner.succeed(`wrote ${kleur.bold(opts.out)} (${variant})`);
}

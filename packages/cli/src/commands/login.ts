import kleur from 'kleur';
import open from 'open';
import ora from 'ora';

interface LoginOptions {
  token?: string;
}

export async function loginCmd(opts: LoginOptions) {
  if (opts.token) {
    const spinner = ora({ text: 'verifying token', color: 'yellow' }).start();
    await new Promise((r) => setTimeout(r, 400));
    // Stub: real implementation calls /api/cli/verify and writes the
    // workspace pointer to ~/.novabash/credentials.
    spinner.succeed('signed in via token');
    return;
  }

  console.log(kleur.bold().yellow('\n  novabash login\n'));

  // Stub device code. Real implementation issues a one-time short code from
  // the API, polls for confirmation, and writes the resulting workspace key
  // pointer to the local credentials file.
  const code = randomCode();
  const url = `https://novabash.dev/cli/${code}`;

  console.log(`  open ${kleur.underline().yellow(url)} in your browser`);
  console.log(`  and confirm the code: ${kleur.bold().white(code)}\n`);

  try {
    await open(url);
  } catch {
    // ignore — user can copy the URL manually
  }

  const spinner = ora({ text: 'waiting for confirmation', color: 'yellow' }).start();
  await new Promise((r) => setTimeout(r, 1200));
  spinner.succeed('signed in to workspace acid-thrush-04');
  console.log();
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

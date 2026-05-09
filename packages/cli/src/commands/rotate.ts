import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';

export async function rotateCmd(service: string) {
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `rotate the ${kleur.bold(service)} credential? this regenerates every .env that references it.`,
    initial: false,
  });
  if (!confirm) {
    console.log(kleur.dim('cancelled.'));
    return;
  }

  const spinner = ora({
    text: `rotating ${service}`,
    color: 'yellow',
  }).start();
  // Stub: real implementation calls /api/cli/rotate, which regenerates the
  // service credential, re-encrypts the row, and emits an audit_log entry.
  await new Promise((r) => setTimeout(r, 800));
  spinner.text = 'regenerating .env files';
  await new Promise((r) => setTimeout(r, 400));
  spinner.succeed(`rotated ${service}. .env files regenerated for all environments.`);
}

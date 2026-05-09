import kleur from 'kleur';
import prompts from 'prompts';
import ora from 'ora';

const bundleChoices = [
  { title: 'Launchpad — standard SaaS', value: 'launchpad' },
  { title: 'Builder AI — AI-powered SaaS', value: 'builder-ai' },
  { title: 'Edge Stack — edge-first', value: 'edge-stack' },
  { title: 'Data Stack — pipelines and queues', value: 'data-stack' },
  { title: 'Mobile First — Expo and Supabase', value: 'mobile-first' },
  { title: 'Enterprise Ready — SOC2-ready', value: 'enterprise-ready' },
];

export async function initCmd() {
  console.log(kleur.bold().yellow('\n  novabash init\n'));

  const answers = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'workspace name',
      initial: 'my-stack',
    },
    {
      type: 'select',
      name: 'bundle',
      message: 'pick a bundle',
      choices: bundleChoices,
      initial: 0,
    },
  ]);

  if (!answers.name || !answers.bundle) {
    console.log(kleur.dim('cancelled.'));
    return;
  }

  const spinner = ora({
    text: 'creating workspace',
    spinner: 'dots',
    color: 'yellow',
  }).start();

  // Stub: real implementation calls the NovaBash API to create a workspace.
  await new Promise((r) => setTimeout(r, 600));
  spinner.text = 'sealing vault';
  await new Promise((r) => setTimeout(r, 400));
  spinner.text = 'generating workspace key';
  await new Promise((r) => setTimeout(r, 400));
  spinner.succeed('workspace ready');

  console.log();
  console.log(`  ${kleur.dim('name')}    ${answers.name}`);
  console.log(`  ${kleur.dim('bundle')}  ${answers.bundle}`);
  console.log();
  console.log(
    `  next: ${kleur.bold('novabash login')} to connect this terminal to the workspace,`,
  );
  console.log(`        then ${kleur.bold('novabash pull')} once the keys are in.`);
  console.log();
}

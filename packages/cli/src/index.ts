#!/usr/bin/env node

import { Command } from 'commander';
import kleur from 'kleur';
import { initCmd } from './commands/init.js';
import { loginCmd } from './commands/login.js';
import { pullCmd } from './commands/pull.js';
import { statusCmd } from './commands/status.js';
import { rotateCmd } from './commands/rotate.js';

const program = new Command();

program
  .name('novabash')
  .description(
    `${kleur.bold('NovaBash')} · workspace, vault, .env, all from the terminal.`,
  )
  .version('0.0.1');

program
  .command('init')
  .description('create a workspace and pick a bundle')
  .action(initCmd);

program
  .command('login')
  .description('authenticate via device-code flow')
  .option('--token <token>', 'use a personal access token instead of the browser flow')
  .action(loginCmd);

program
  .command('pull')
  .description('write the .env for the active environment')
  .option('-e, --env <variant>', 'development | staging | production', 'development')
  .option('-o, --out <file>', 'output path', '.env.local')
  .action(pullCmd);

program
  .command('status')
  .description('show health, usage, and key age for every connected service')
  .action(statusCmd);

program
  .command('rotate')
  .description('rotate the credential for a connected service')
  .argument('<service>', 'service id, e.g. supabase or openrouter')
  .action(rotateCmd);

program.parseAsync(process.argv).catch((err) => {
  console.error(kleur.red('error: ') + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});

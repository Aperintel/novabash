import kleur from 'kleur';

const rows = [
  { name: 'Supabase', region: 'eu-west-2', primary: 'rows 124,388 / 500K', age: 14, health: 'ok' },
  { name: 'Vercel', region: 'global', primary: 'fns 932K / 1M', age: 21, health: 'ok' },
  { name: 'OpenRouter', region: 'global', primary: 'spend $54.20 / $75', age: 92, health: 'rotating' },
  { name: 'Upstash Redis', region: 'eu-central', primary: 'cmds 7,402 / 10K', age: 7, health: 'ok' },
  { name: 'Resend', region: 'global', primary: 'mails 1,140 / 3,000', age: 35, health: 'ok' },
  { name: 'Inngest', region: 'global', primary: 'steps 21,488 / 50K', age: 12, health: 'ok' },
  { name: 'Lemon Squeezy', region: 'global', primary: 'MRR $1,840', age: 41, health: 'ok' },
];

export async function statusCmd() {
  console.log();
  console.log(kleur.bold().yellow('  workspace acid-thrush-04') + kleur.dim(' · 7 services'));
  console.log();

  const widths = [22, 12, 26, 8, 10];
  const head = ['service', 'region', 'primary', 'age', 'health']
    .map((s, i) => kleur.dim(s.padEnd(widths[i]!)))
    .join(' ');
  console.log('  ' + head);
  console.log('  ' + kleur.dim('─'.repeat(widths.reduce((a, b) => a + b, 0) + widths.length - 1)));

  for (const r of rows) {
    const healthColored =
      r.health === 'ok'
        ? kleur.green('● ok')
        : r.health === 'rotating'
          ? kleur.yellow('● rotate')
          : kleur.red('● error');
    const ageColored = r.age > 90 ? kleur.yellow(`${r.age}d`) : `${r.age}d`;
    console.log(
      '  ' +
        [
          r.name.padEnd(widths[0]!),
          kleur.dim(r.region.padEnd(widths[1]!)),
          r.primary.padEnd(widths[2]!),
          ageColored.padEnd(widths[3]! + (ageColored.length - String(r.age + 'd').length)),
          healthColored,
        ].join(' '),
    );
  }
  console.log();
  console.log(
    `  ${kleur.dim('estimated monthly cost')} ${kleur.bold('£32.40')}  ` +
      `${kleur.dim('keys near rotation')} ${kleur.yellow('1')}`,
  );
  console.log();
}

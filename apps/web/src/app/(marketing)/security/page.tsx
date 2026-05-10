export const metadata = {
  title: 'Security',
  description:
    'How NovaBash holds your service credentials, what we encrypt, and what we audit.',
};

const principles = [
  {
    num: '/01',
    title: 'Plaintext credentials never exist on disk',
    body: 'Every API key, database URL, and service token is encrypted with AES-256-GCM using envelope encryption. The data key encrypts the credential, the master key encrypts the data key, the two are stored separately. In MVP the master key lives in a sealed environment variable, at v1.0 the master key is held in AWS KMS.',
  },
  {
    num: '/02',
    title: 'Each workspace is a separate cryptographic context',
    body: 'A vault breach in one workspace does not weaken the vault in another. Every workspace generates its own data key on creation, and every credential write rotates the per-workspace key version. Cross-workspace decryption is mathematically impossible because the keys are scoped, not shared.',
  },
  {
    num: '/03',
    title: 'Every read of every credential is logged',
    body: 'Reads, writes, validations, rotations, and revocations append to a hash-chained audit log. Each entry hash is sha256 of the previous hash concatenated with the canonical JSON of the current event, so any tampering breaks the chain. The audit log can be exported as signed JSON for compliance review.',
  },
  {
    num: '/04',
    title: 'The workspace key is a pointer, not the contents',
    body: 'When you sign in or pull from the CLI, you hold a workspace key that resolves credentials on demand. The key never carries the underlying vendor credentials. If the workspace key leaks, you rotate it and the vendor secrets stay safe behind the master key.',
  },
  {
    num: '/05',
    title: 'Validation runs against the vendor, never against us',
    body: 'Every key you paste is validated by hitting the vendor\'s own API before NovaBash stores anything. We never replay your validation traffic, we never log the value, and a wrong key fails before it touches the vault.',
  },
  {
    num: '/06',
    title: 'Disclosure is direct',
    body: 'If you find a security issue, write to security@novabash.dev. Triage acknowledgement within 24 hours, fix or mitigation timeline within five working days. We do not run a paid bounty programme yet but we credit reporters in the changelog when a fix ships.',
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">Security</span>
        <span>How we hold your credentials</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Six things,
        <br />
        <span className="text-fg-dim">in plain language.</span>
      </h1>
      <p className="mb-14 max-w-[640px] text-[17px] leading-[1.55] text-fg-mid">
        NovaBash holds the credentials your stack runs on, so the bar for the trust architecture
        has to be higher than for almost anything else you would deploy. Here is what we do, what
        we do not do, and where the disclosure inbox lives.
      </p>

      <div className="grid border-l border-t border-hairline sm:grid-cols-2">
        {principles.map((p) => (
          <article
            key={p.num}
            className="border-b border-r border-hairline p-9 transition-colors duration-200 ease-nb hover:bg-gold-fade"
          >
            <span className="mb-4 block font-mono text-[11px] tracking-[0.06em] text-gold">
              {p.num}
            </span>
            <h2 className="mb-3 text-[20px] font-bold leading-[1.2] tracking-heading">
              {p.title}
            </h2>
            <p className="text-[14.5px] leading-[1.65] text-fg-mid">{p.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 border border-hairline-bright bg-bg-elev p-9">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-gold">
          report something
        </div>
        <h3 className="mb-3 text-[22px] font-bold tracking-heading">
          security@novabash.dev
        </h3>
        <p className="mb-5 text-[14.5px] leading-[1.65] text-fg-mid">
          PGP key on request. Please include reproduction steps and the workspace ID if the issue
          is specific to a workspace. We will acknowledge within 24 hours and aim for an initial
          mitigation within five working days for anything material.
        </p>
      </div>
    </div>
  );
}

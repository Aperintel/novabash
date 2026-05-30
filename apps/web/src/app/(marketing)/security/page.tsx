export const metadata = {
  title: 'Security',
  description: 'How NovaBash protects your keys on your own device, and the honest limits of a browser vault.',
};

const principles = [
  {
    num: '/01',
    title: 'Encrypted in your browser, not on our server',
    body: 'Every key is encrypted with AES-256-GCM using the Web Crypto API, with a key derived from your passphrase via PBKDF2 (310,000 iterations). There is no NovaBash server, so there is nothing of yours sitting on our side to breach.',
  },
  {
    num: '/02',
    title: 'The passphrase never leaves the page',
    body: 'Your passphrase is never stored and never transmitted. The derived key lives in memory for the session and is gone when you lock or close the tab. There is no reset link, because there is no us to reset it. If you forget the passphrase, your 24-word recovery phrase is the way back in. Lose both and the vault is unrecoverable, which is the point.',
  },
  {
    num: '/03',
    title: 'The vault stays on your device',
    body: 'The encrypted vault lives in this browser via IndexedDB. Export it as a single encrypted file whenever you want a backup or a move to another machine. Clearing this site\'s data erases the local copy, so keep an export somewhere safe.',
  },
  {
    num: '/04',
    title: 'A tamper-evident local audit log',
    body: 'Every change appends an entry to a hash-chained log inside the vault. Each entry hashes the previous one, so editing history breaks the chain. Hit verify and you can prove your own history was not quietly altered. It is local, like everything else.',
  },
  {
    num: '/05',
    title: 'The honest part: it is a browser vault',
    body: 'The real risk for any client-side vault is cross-site scripting, which could read decrypted secrets while the vault is unlocked. We ship a strict Content-Security-Policy, set no cookies, run no analytics, and load no third-party scripts to shrink that surface. It is a strong convenience vault, not a hardware security module. A local command-line mode that keeps the vault out of the browser entirely is on the roadmap.',
  },
  {
    num: '/06',
    title: 'Disclosure is direct',
    body: 'Found a security issue? Open an issue on github.com/aperintel/novabash, or email enquiries@aperintel.com. Please include reproduction steps and never include real secrets or live keys. We acknowledge quickly and credit reporters when a fix ships.',
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">Security</span>
        <span>How your keys are protected, and what they are not</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Six things,
        <br />
        <span className="text-fg-dim">no hand-waving.</span>
      </h1>
      <p className="mb-14 max-w-[640px] text-[17px] leading-[1.55] text-fg-mid">
        NovaBash holds the keys your projects run on, so it owes you a straight
        answer about how that works. Here is what protects them, where the limits
        are, and where to send a security report.
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
            <h2 className="mb-3 text-[20px] font-bold leading-[1.2] tracking-heading">{p.title}</h2>
            <p className="text-[14.5px] leading-[1.65] text-fg-mid">{p.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 border border-hairline-bright bg-bg-elev p-9">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-gold">report something</div>
        <h3 className="mb-3 text-[22px] font-bold tracking-heading">enquiries@aperintel.com</h3>
        <p className="mb-5 text-[14.5px] leading-[1.65] text-fg-mid">
          Or open an issue on the public repository. Include reproduction steps and
          leave real secrets out of the report. We acknowledge quickly and aim for a
          mitigation within a few working days for anything material.
        </p>
      </div>
    </div>
  );
}
